'use strict';

const rootConfig = require('config');
const { expect } = require('chai');
const homePage = require('../pages/home-page.js');
const loginPage = require('../pages/login-page.js');
const reportUtils = require('../reporting/utils');

const waitTimes = rootConfig.get('testdata.wait-times');

const AppLoginTests = () => {
    const { reporter } = global;
    const homePageValues = rootConfig.get('testdata.home-page-values');

    let isConsoleWarningOrError;

    beforeEach(() => {
        jest.setTimeout(waitTimes.jestTimeOut);
        isConsoleWarningOrError = false;
        jest.spyOn(global.console, 'error').mockImplementation((...args) => {
            isConsoleWarningOrError = true;
            // Optional: I've found that jest spits out the errors anyways
            console.log(...args);
        });
        jest.spyOn(global.console, 'warn').mockImplementation((...args) => {
            isConsoleWarningOrError = true;
            // Optional: I've found that jest spits out the errors anyways
            console.log(...args);
        });
    });

    afterEach(async () => {
        await reportUtils.addScreenshot(reporter, 'AppLoginTests');
        if (isConsoleWarningOrError) {
            throw new Error('Console warnings and errors are not allowed');
        }
    });

    it('(smoke): Can load and authorize the lokalise', async () => {
        const alertsHeaderTextValue = homePageValues.alertsHeader;
        const url = await loginPage.getUrl();

        // Login to the application
        await loginPage.login(url);
        expect(!!(await homePage.isVisible(homePage.alertsHeader))).to.eql(true);
        expect(await homePage.getTextContent(homePage.alertsHeader)).to.eql(alertsHeaderTextValue);
    });
};

module.exports = AppLoginTests;
