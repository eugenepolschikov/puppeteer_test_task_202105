'use strict';

const BasePage = require('./base-page.js');

class HomePage extends BasePage {
    constructor() {
        super();
        this.page = global.page;

        // new project button
        this.newProjectBtn = "button[data-action=add-project]";

        // project popup webelements
        this.projectName = "#addproject  #project-name";

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
            this.page.click(this.newProjectBtn);
    }

    async fillInProjectDataAndSubmit(projectData){
        await this.enterInField(
            this.projectName,
            projectData.projectName
        );

    }
}

module.exports = new HomePage();
