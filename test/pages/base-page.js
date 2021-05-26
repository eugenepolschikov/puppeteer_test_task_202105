'use strict';

const _ = require('lodash');
const PageObject = require('puppeteer-page-object');
const args = require('minimist')(process.argv.slice(2));
const rootConfig = require('config');
const Promise = require('bluebird');

const waitTimes = rootConfig.get('testdata.wait-times');
const url = rootConfig.get('url');
const testdata = rootConfig.get('testdata');

class BasePage extends PageObject {
    constructor() {
        super();
        this.page = global.page;
        this.url = url;
        this.testdata = testdata;
    }

    getUrl() {
        switch (args.e) {
            case 'dev':
                return this.url.dev;
            case 'latestCommit':
                return this.url.latestCommit;
            case 'testing':
                return this.url.testing;
            default:
                return this.url.latestCommit;
        }
    }

    getEnvironmentTestData() {
        switch (args.e) {
            case 'dev':
            case 'latestCommit':
                return this.testdata.latestCommit;
            case 'testing':
                return this.testdata.testing;
            default:
                return this.testdata.latestCommit;
        }
    }

    getTitle() {
        return this.page.title();
    }

    async reloadThePage() {
        await this.page.reload({ waitUntil: ['load', 'domcontentloaded', 'networkidle0'] });
    }

    // gets text content of a simple selector
    async getTextContent(selector) {
        const element = await this.page.$(selector);
        const textContent = await this.page.evaluate(el => el.textContent, element);
        return textContent
            .replace(/(\r\n|\n|\r)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
    }

    // gets element value defined by provided selector
    async getElementTextValue(selector) {
        const valueExtracted = await this.page.$eval(selector, el => el.value);
        return valueExtracted;
    }

    // gets innerText of an element
    async getElementInnerText(selector) {
        await this.page.waitForSelector(selector, { visible: true });
        const valueExtracted = await this.page.$eval(selector, el => el.innerText);
        return valueExtracted;
    }

    // get element text with addtional wait
    async getTextOfXpathElement(xpath) {
        // wait for element defined by XPath appear in page
        await this.page.waitForXPath(xpath);
        // evaluate XPath expression of the target selector (it return array of ElementHandle)
        const elHandle = await this.page.$x(xpath);
        // prepare to get the textContent of the selector above (use page.evaluate)
        const textExtracted = await this.page.evaluate(el => el.textContent, elHandle[0]);
        return textExtracted;
    }

    // gets text content of an array element
    async getInnerText(element) {
        const innerText = await this.page.evaluate(el => el.textContent, element);
        return innerText
            .replace(/(\r\n|\n|\r)/gm, '')
            .replace(/\s\s+/g, ' ')
            .trim();
    }

    async getAttribute(selector, attributeName) {
        const attrValue = this.page.$eval(
            selector,
            (el, attribute) => el.getAttribute(attribute),
            attributeName
        );

        return attrValue;
    }

    // clicks on an array element
    async clickArrayElements(selector) {
        await selector.click();
        await this.page.waitForTimeout(waitTimes.loadTime);
        return true;
    }

    // wait for element of css locator is visible
    async waitForVisible(selector) {
        try {
            await this.page.waitForSelector(selector, { visible: true });
            return true;
        } catch (e) {
            // eslint-disable-next-line no-shadow
            const url = await this.page.url();
            throw new Error(
                `${url} : Error found during waiting for visibility the element with selector '${selector}'. ${e}. Most likely locator issue. Please contact developers for investigation`
            );
        }
    }

    // given a selector of a text/date field, clears the existing contents and enters new contents
    async enterInField(selector, newValue) {
        // clear existing value
        await this.page.focus(selector);
        await this.page.$eval(selector, el => el.setSelectionRange(0, el.value.length));
        await this.page.keyboard.press('Backspace');
        await this.waitForTwoSec();

        // type new value
        await this.page.type(selector, newValue);
        await this.waitForTwoSec();
    }

    async passDownArrow() {
        await this.page.keyboard.press('ArrowDown');
        return true;
    }

    async pressEnter() {
        await this.page.keyboard.press('Enter');
        return true;
    }

    // given the selector of a drop down object & its index in the page(in case there are more than one drop downs with same selector),
    // selects one by one all options in the drop down, till it reaches the requiredValue
    async selectFromDropdown(dropDown, index, requiredValue) {
        let count = 0;
        let innerText = '';
        let firstValue = '';

        const unselectedDrop = await this.page.$$(dropDown);
        const selectedDrop = `${dropDown} div`;

        do {
            await unselectedDrop[index].click();
            this.page.keyboard.press('ArrowDown');
            this.page.keyboard.press('Enter');

            // eslint-disable-next-line no-await-in-loop
            const selectDropDown = await this.page.$$(selectedDrop);
            // eslint-disable-next-line no-await-in-loop
            innerText = await this.page.evaluate(el => el.textContent, _.last(selectDropDown));

            if (count === 0) {
                firstValue = innerText;
            }

            if (count > 0 && _.eq(innerText.trim(), firstValue.trim())) {
                console.log('Did not find required value', requiredValue);
                return true;
            }
            count += 1;
        } while (!_.eq(innerText.trim(), requiredValue.trim()));

        return true;
    }

    // given array of selectors of origin box to drag from, array of selectors of destination box to drop to and
    // index of selectors to select for dragging & dropping, performs drag and drop
    async dragAndDrop(
        originArraySelector,
        destinationArraySelector,
        originIndex,
        destinationIndex
    ) {
        const origin = await this.page.$$(originArraySelector);
        const destination = await this.page.$$(destinationArraySelector);
        const originBox = await origin[originIndex].boundingBox();
        const destinationBox = await destination[destinationIndex].boundingBox();

        const lastPositionCoordenate = box => ({
            x: box.x + box.width / 2,
            y: box.y + box.height,
        });
        const getPayload = box => ({
            bubbles: true,
            cancelable: true,
            screenX: lastPositionCoordenate(box).x,
            screenY: lastPositionCoordenate(box).y,
            clientX: lastPositionCoordenate(box).x,
            clientY: lastPositionCoordenate(box).y,
        });

        // function in browser.
        const pageFunction = async (
            originSelector,
            destinationSelector,
            originPayload,
            destinationPayload,
            index1,
            index2
        ) => {
            const originBrowser = document.querySelectorAll(originSelector)[index1];
            let destinationBrowser = document.querySelectorAll(destinationSelector)[index2];

            // If has child, put at the end.
            destinationBrowser = destinationBrowser.lastElementChild || destinationBrowser;

            // init events
            originBrowser.dispatchEvent(new MouseEvent('pointerdown', originPayload));
            originBrowser.dispatchEvent(new DragEvent('dragstart', originPayload));

            await new Promise(resolve => setTimeout(resolve, 2000));
            destinationBrowser.dispatchEvent(new MouseEvent('dragenter', destinationPayload));
            originBrowser.dispatchEvent(new DragEvent('dragend', destinationPayload));
        };

        // init drag and drop.
        await this.page.evaluate(
            pageFunction,
            originArraySelector,
            destinationArraySelector,
            getPayload(originBox),
            getPayload(destinationBox),
            originIndex,
            destinationIndex
        );
        await this.page.waitForTimeout(waitTimes.timeoutTwoSec);
    }

    async handleDialog() {
        this.page.on('dialog', async dialog => {
            dialog.accept();
        });
    }

    async scrollToBottom() {
        this.page.evaluate(function() {
            window.scrollBy(0, window.innerHeight);
        });
        await this.page.waitForTimeout(waitTimes.loadTime);
    }

    async scrollToTop() {
        this.page.evaluate(function() {
            window.scrollTo(0, 0);
        });
        await this.page.waitForTimeout(waitTimes.loadTime);
    }

    // given an array of selectors, gets text from all of them
    async getTextFromListOfElements(selectors) {
        return _.map(selectors, async selector => {
            const rawText = await this.page.evaluate(el => el.textContent, selector);
            const cleanedText = rawText.replace(/\n\r/g, ' ').replace(/\s\s+/g, ' ');
            return cleanedText.trim();
        });
    }

    async getArrayOfTextsFromElementBySelector(selector) {
        return await this.page.$$eval(selector, options =>
            options.map(option => option.textContent.trim())
        );
    }

    async getArrayOfTextFromTable(table) {
        const actual = [];
        const rows = await table.$$('tr');
        await rows.reduce(async (promise, row) => {
            await promise;
            const cells = await row.$$('td');
            const cellText = await this.getArrayOfTextsFromListOfElements(cells);
            actual.push(cellText);
        }, Promise.resolve());

        return actual;
    }

    // given a list of selectors, clicks on selector with given text
    async clickSelectorWithText(selectors, text) {
        return _.map(selectors, async selector => {
            const rawText = await this.page.evaluate(el => el.textContent, selector);
            const cleanedText = rawText.replace(/\n\r/g, ' ').replace(/\s\s+/g, ' ');

            if (_.eq(cleanedText.trim(), text)) {
                selector.click();
                return true;
            }
        });
    }

    // given a selector, waits for a set time for it to be visible
    isVisible(selector, setTime) {
        return this.page.waitForSelector(selector, {
            visible: true,
            timeout: setTime,
        });
    }

    // given a selector, waits for a set time for it to be visible
    isNotVisible(selector, setTime) {
        return this.page.waitForSelector(selector, {
            hidden: true,
            timeout: setTime,
        });
    }

    // return true if element disabled, false if enabled
    async isDisabled(selector) {
        if (typeof selector === 'string') {
            return await this.page.$eval(selector, el => {
                return el.disabled;
            });
        }
        return await this.page.evaluate(el => {
            return el.disabled;
        }, selector);
    }

    // uploads csv file from uploadFile path, given all buttons needed are provided
    async csvImport(findFileBtn, uploadFile, addBtn, saveBtn) {
        // upload file in form
        const [fileChooser] = await Promise.all([
            this.page.waitForFileChooser(),
            this.page.click(findFileBtn), // some button that triggers file selection
        ]);
        await fileChooser.accept([uploadFile]);

        // click on add button in form
        await this.page.click(addBtn);
        await this.page.waitForTimeout(waitTimes.loadTime);

        // click on save button on page
        await this.page.click(saveBtn);
        await this.page.waitForTimeout(waitTimes.loadTime);
    }

    // takes screenshot of a given page and compares with stored baseline
    async visualTest() {
        const image = await this.page.screenshot();
        try {
            await this.page.waitForTimeout(waitTimes.loadTime);
            expect(image).toMatchImageSnapshot({
                failureThreshold: '0.01',
                failureThresholdType: 'percent',
            });
        } catch (err) {
            throw new Error(this.err);
        }
    }

    /* waits for CSS  selector in DOM, clicks element and waits for 2 seconds.
       The method is used in cases when clicking an element leads to
       network activities (excluding URL redirection) and
       page rendering or just to page rendering. Note: in case of URL redirection
       clickByCssAndWaitForRedirection() should be used */
    async clickByCssAndWait(cssLocator) {
        try {
            await this.page.waitForSelector(cssLocator);
            await this.page.click(cssLocator);
            await this.page.waitForTimeout(waitTimes.timeoutTwoSec);
        } catch (err) {
            console.log(err);
        }
    }

    // waits for xpath to appear in the page, and click on it via element handle
    async waitXpathAndClick(xpathLocator) {
        try {
            // wait for element defined by XPath appear in page
            await this.page.waitForXPath(xpathLocator);
            const elementHandle = await this.page.$x(xpathLocator);
            // prepare to click the xpath selector above (use page.evaluate)
            await this.page.evaluate(el => el.click(), elementHandle[0]);
        } catch (e) {
            // eslint-disable-next-line no-shadow
            const url = await this.page.url();
            throw new Error(
                `${url} : Error found during clicking on selector '${xpathLocator}'. ${e}. Most likely locator issue. Please contact developers for investigation`
            );
        }
    }

    // checks that element is missing in DOM and returns null in case of success
    async checkXpathMissing(xpathLocator) {
        // eslint-disable-next-line no-return-await
        return await this.page.waitForXPath(xpathLocator, { hidden: true });
    }

    async waitForXpathAndClickAndWait(xpathLocator) {
        try {
            // wait for element in DOM
            await this.page.waitForXPath(xpathLocator);
            // click element
            const elementHandle = await this.page.$x(xpathLocator);
            await this.page.evaluate(el => el.click(), elementHandle[0]);
            // wait for network idle
            await this.page.waitForTimeout(waitTimes.loadTime);
        } catch (e) {
            console.log(e);
        }
    }

    // iterative click actions on multiple webelements, like checkboxes on the page
    async clickMultipleElements(multipleElemsSelector, page) {
        const elems = await this.page.$$(multipleElemsSelector);
        elems.forEach(element => element.click());
        await page.waitForTimeout(waitTimes.timeoutTwoSec);
    }

    async ifElementByCssPresent(selector) {
        try {
            await this.page.waitForSelector(selector, { visible: true, timeout: 3000 });
            return true;
        } catch (error) {
            console.log(`The element by selector: ${selector} not found`);
            return false;
        }
    }

    async ifElementByXpathPresent(xpathLocator) {
        console.log(`checking for locator: ${xpathLocator}  on the page`);
        try {
            const xpathElems = await this.page.$x(xpathLocator);
            if (xpathElems !== null && xpathElems.length) {
                return true;
            }
        } catch (error) {
            console.log(`error not found: ${error}`);
            return false;
        }
        console.log(`The element by selector: ${xpathLocator} not found`);
        return false;
    }

    // eslint-disable-next-line class-methods-use-this
    async sleep(ms) {
        await new Promise(res => setTimeout(res, ms));
    }

    async waitForTwoSec() {
        await this.page.waitForTimeout(waitTimes.timeoutTwoSec);
    }

    /**
     * Method responsible for scrolling down in the bottom of the page
     * e.g in the case when new promo entity is added and page height increases.3
     * @returns {Promise<void>}
     */
    async scrollIntoViewAuto() {
        await this.page.evaluate(async () => {
            await new Promise((resolve, reject) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    async scrollIntoViewByClassName(className, classNameLastChild) {
        let preCount = '';
        let postCount = '';
        do {
            // eslint-disable-next-line no-await-in-loop
            preCount = await this.getCount(className);
            // eslint-disable-next-line no-await-in-loop
            await this.scrollDown(classNameLastChild);
            // eslint-disable-next-line no-await-in-loop
            await this.page.waitForTimeout(waitTimes.timeoutTwoSec);
            // eslint-disable-next-line no-await-in-loop
            postCount = await this.getCount(className);
        } while (postCount > preCount);
        await this.page.waitForTimeout(waitTimes.timeoutTwoSec);
    }

    async getCount(className) {
        return this.page.$$eval(className, a => a.length);
    }

    /**
     * classNameLastChild should have the value e.g '.class_name:last-child'
     * @param classNameLastChild
     * @returns {Promise<void>}
     */
    async scrollDown(classNameLastChild) {
        await this.page.$eval(classNameLastChild, e => {
            e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
        });
    }

    /**
     * Method watching for the completion of HTML source code modifications by the browser
     * @param page
     * @param timeout
     * @returns {Promise<void>}
     */
    async waitTillHTMLRendered(page, timeout = 30000) {
        const checkDurationMsecs = 1000;
        const maxChecks = timeout / checkDurationMsecs;
        let lastHTMLSize = 0;
        let checkCounts = 1;
        let countStableSizeIterations = 0;
        const minStableSizeIterations = 3;

        // eslint-disable-next-line no-plusplus
        while (checkCounts++ <= maxChecks) {
            // eslint-disable-next-line no-await-in-loop
            const html = await this.page.content();
            const currentHTMLSize = html.length;

            // eslint-disable-next-line no-await-in-loop
            const bodyHTMLSize = await this.page.evaluate(() => document.body.innerHTML.length);

            console.log(
                'last: ',
                lastHTMLSize,
                ' <> curr: ',
                currentHTMLSize,
                ' body html size: ',
                bodyHTMLSize
            );

            // eslint-disable-next-line eqeqeq,no-plusplus
            if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) countStableSizeIterations++;
            else countStableSizeIterations = 0; // reset the counter

            if (countStableSizeIterations >= minStableSizeIterations) {
                console.log('Page rendered fully..');
                break;
            }

            lastHTMLSize = currentHTMLSize;
            // eslint-disable-next-line no-await-in-loop
            await this.page.waitForTimeout(checkDurationMsecs);
        }
    }
}

module.exports = BasePage;
