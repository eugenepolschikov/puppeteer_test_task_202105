'use strict';

const chai = require('chai');
const expect = chai.expect;
const BasePage = require('./base-page.js');


class HomePage extends BasePage {
    constructor() {
        super();
        this.page = global.page;

        // new project button
        this.newProjectBtn = "button[data-action=add-project]";

        // project popup webelements
        this.projectName = "#addproject  #project-name";
        this.addNewProjectButton = "#project-add";

        // home subpage
        this.homeToProjectsButton = "a[href='/']";

        //actual project list
        this.projectList = "//div[@data-rbd-draggable-context-id='0']//div[@data-name='project-sidebar']/a";

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

        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(this.addNewProjectButton),
        ]);
    }

    async navigateToProjectList(){
        await Promise.all([
            this.page.waitForNavigation({
                waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
            }),
            this.page.click(this.homeToProjectsButton),
        ]);

    }

    async checkForTotalNumberOfProjectsOnThePage(totalProjNumber){
        let arrayOfProjects = await page.$x(this.projectList);
        expect(arrayOfProjects.length).to.eql(totalProjNumber);
    }
}

module.exports = new HomePage();
