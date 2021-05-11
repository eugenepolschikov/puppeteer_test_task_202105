const puppeteer = require("puppeteer");


(async function () {
    const browser = await puppeteer.launch({headless:false});
    const page = await browser.newPage();
    await page.goto("https://pptr.dev");

    await page.waitFor(5000);
    await browser.close();
})();