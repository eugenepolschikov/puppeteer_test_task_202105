'use strict';

const BasePage = require('./base-page.js');

class HomePage extends BasePage {
    constructor() {
        super();
        this.page = global.page;

        // top navigation bar
        this.newProjectBtn = "button[data-action=add-project]";

        // planning tab
        this.planningTab = "[href='/planning']";

        // preparation tab
        this.preparationTab = "[href='/preparation'] span";

        // user menu
        this.drpUser = 'button.user-menu button.expand-btn i';
        this.btnLogout = 'button[id=navbar-logout]';

        // search input across campaigns/subcampaigns
        this.searchInput = "input[id*='input'][placeholder*='Search']";

        // Alerts header
        this.alertsHeader = 'h2.alerts-wrapper__heading';

        // authorized user context menu
        this.userMenu = "button[type='button'][class*='user-menu']";

        // this.logoutUserOption = '#navbar-logout';
        this.logoutUserOption = "#app [role='menu'] button";

        // unauthorized elements of 403 page
        this.unauthorizedHeader = 'div.error-page h1.title';
        this.unauthorized403Body = 'div.error-page h2>span.error-code';
        this.unauthorizedLabel = 'div.error-page p';
    }

    async userLogout() {
        await this.page.waitForSelector(this.userMenu);
        this.page.click(this.userMenu);
        await this.waitForTwoSec();
        await this.waitForVisible(this.logoutUserOption);

        // click Logout button and wait for redirection finish
        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(this.logoutUserOption),
        ]);
    }

    async addNewProject() {
        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(this.planningTab),
        ]);
    }
}

module.exports = new HomePage();
