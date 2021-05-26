'use strict';

const config = require('config');
const util = require('util');

// Add a reporter to track test failures, and attempt to take a screenshot afterwards
// Note that this will normally put the failure screenshot into the next test, due to the
// previous test already having ended (i.e. this is 'specDone' not 'specJustBeforeDone')
// This is a compromise, without rewriting the jest-allure module
const failureScreenshotReporting = () => {
    const { page, reporter } = global;

    jasmine.getEnv().addReporter({
        specDone: async spec => {
            if (spec.status === 'failed') {
                if (page && reporter) {
                    const screenshotBuffer = await page.screenshot();
                    const screenshotTitle = `Screenshot on failure for: '${spec.description}'`;
                    reporter.addAttachment(screenshotTitle, screenshotBuffer, 'image/png');
                }
            }
        },
    });
};

// Reporter to keep track of console output
const consoleOutputReporting = () => {
    const consoleLevel = config.settings.consoleLevel;
    const { page, reporter } = global;

    if (consoleLevel !== 'none') {
        jasmine.getEnv().addReporter({
            // Set up a monitor on console output - output the entire console output after tests are done
            specStarted: async spec => {
                spec.consoleOutput = ['CONSOLE:'];
                if (page) {
                    page.on('console', msg => {
                        // Get severity of message
                        const msgLevel = msg.type();

                        // Should the message be displayed
                        let showMessage = false;
                        if (
                            consoleLevel === 'all' ||
                            (consoleLevel === 'warning' &&
                                (msgLevel === 'warning' || msgLevel === 'error')) ||
                            (consoleLevel === 'error' && msgLevel === 'error')
                        )
                            showMessage = true;

                        // Add the message to be displayed later
                        if (showMessage) {
                            spec.consoleOutput.push(`${msgLevel}:`);
                            spec.consoleOutput.push(msg.text());
                            try {
                                if (msg.args().length > 0) {
                                    spec.consoleOutput.push(util.inspect(msg.args()));
                                }
                            } catch (err) {
                                console.log(err);
                            }
                            try {
                                spec.consoleOutput.push(util.inspect(msg.location()));
                            } catch (err) {
                                console.log(err);
                            }
                            spec.consoleOutput.push('-------');
                        }
                    });
                }
            },

            // Output the console results
            specDone: async spec => {
                // Check for console output
                if (spec.consoleOutput.length > 1) {
                    // Add a new step and output the console text into the description
                    if (reporter) {
                        reporter.allure.startCase('Console output');
                        reporter.allure.setDescription(spec.consoleOutput.join('\n\n'));
                        reporter.allure.endCase('unknown', 'error');
                    }
                }
            },
        });
    }
};

exports.failureScreenshotReporting = failureScreenshotReporting;
exports.consoleOutputReporting = consoleOutputReporting;
failureScreenshotReporting();
consoleOutputReporting();
