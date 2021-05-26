'use strict';

/**
 * Add a screenshot to reporting
 * @param reporter - Reporting object
 * @param description - Description for screenshot
 */
async function addScreenshot (reporter, description) {
  const page = global.page;
  const screenshotBuffer = await page.screenshot();
    reporter.addAttachment(description, screenshotBuffer, "image/png");
}


module.exports = {
    addScreenshot,
};