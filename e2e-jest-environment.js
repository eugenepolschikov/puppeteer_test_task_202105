'use strict';

/**
 * Put any Jest setup/teardown functionality common to all e2e tests here
 */

const NodeEnvironment = require('jest-environment-node');
const puppeteer = require('puppeteer');
require('events').EventEmitter.defaultMaxListeners = 100;

class e2eEnvironment extends NodeEnvironment {
    async setup() {
        /**
         * called by each test suite before then running all of its tests
         */
        await super.setup();

        this.browser = await puppeteer.launch({
            headless: false,
            slowMo: 0,
            defaultViewport: null,
            args: [
                `--window-size=1920,1080`,
                `--no-sandbox`,
                `--disable-setuid-sandbox`,
                '--disable-dev-shm-usage',
            ],
        });

        this.global.page = await this.browser.newPage();
    }

    async teardown() {
        /**
         * Called by each test suite after running all of the
         */
        await super.teardown();
        this.browser.close();
    }

    runScript(script) {
        return super.runScript(script);
    }
}

module.exports = e2eEnvironment;
