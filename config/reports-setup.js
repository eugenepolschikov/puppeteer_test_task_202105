'use strict';

/**
 * Additional config function that creates/cleans the output directory
 * for storing screenshots etc. for reports
 */
const fs = require('fs');
const path = require('path');
const rootConfig = require('config');

const reportsDir = 'allure-results';

const cleanup = () => {
    // clean the allure reports directory before the test run
    // set via config, will clean the directory of all files
    if (rootConfig.get('settings.allureReports')) {
        if (rootConfig.get('settings.cleanReports')) {
            fs.readdir(reportsDir, (err, files) => {
                if (err) throw err;
                files.forEach(file => {
                    fs.unlink(path.join(reportsDir, file), errDel => {
                        if (errDel) throw errDel;
                    });
                });
            });
        }
    }
};
const reportsSetup = () => {
    // create output directory for test reports
    fs.access(reportsDir, fs.constants.F_OK, err => {
        if (err) {
            // create a reports directory if directory does not exist.
            fs.mkdir(reportsDir, { recursive: true }, error => {
                if (error) {
                    console.log(`Error creating directory: ${error}`);
                } else {
                    console.log('Directory created successfully.');
                }
            });
        } else {
            cleanup();
        }
    });
};

exports.reportsSetup = reportsSetup;
reportsSetup();
