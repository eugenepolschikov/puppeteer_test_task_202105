'use strict';

require('dotenv').config();
const BasePage = require('./base-page.js');

class LoginPage extends BasePage {
    constructor() {
        super();
        this.page = global.page;
        this.formSignin = '.form-signin';
        this.fldUsername = 'input[type=username]';
        this.fldPassword = 'input[type=password]';
        this.btnSubmit = 'button[id=submit]';

        this.username = process.env.APP_USERNAME;
        this.password = process.env.APP_PASSWORD;
    }

    async login(url) {
        const signInBtn = this.btnSubmit;

        await this.page.goto(url, {
            waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        });
        await this.page.waitForSelector(this.formSignin);

        // Enter username and password
        await this.page.type(this.fldUsername, this.username);
        await this.page.type(this.fldPassword, this.password);

        // Click on Sign In button
        await this.page.waitForSelector(signInBtn);
        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(signInBtn),
        ]);
    }

    async loginWithUserDto(url, user) {
        const signInBtn = this.btnSubmit;

        await this.page.goto(url, {
            waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        });
        await this.page.waitForSelector(this.formSignin);

        // Enter username and password
        await this.page.type(this.fldUsername, user.username);
        await this.page.type(this.fldPassword, user.password);

        // Click on Sign In button
        await this.page.waitForSelector(signInBtn);
        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(signInBtn),
        ]);
    }
}

module.exports = new LoginPage();
