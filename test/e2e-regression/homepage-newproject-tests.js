'use strict';

const {expect} = require('chai');
const rootConfig = require('config');
const reportUtils = require('../reporting/utils');
const homepage = require('../pages/home-page.js')
const ProjectDto = require("../dtos/project-dto");

const waitTimes = rootConfig.get('testdata.wait-times');

const HomepageNewprojectTests = () => {
    const {page, reporter} = global;
    const projectData = new ProjectDto();

    beforeEach(() => {
        jest.setTimeout(waitTimes.jestExtendedTimeOut);
    });

    afterEach(async () => {
        await reportUtils.addScreenshot(reporter, 'HomepageNewprojectTests');
    });

    it('can create a new project with all mandatory fields', async () => {

        await homepage.reloadThePage();
        await homepage.addNewProject();
        await homepage.fillInProjectDataAndSubmit(projectData);
        await homepage.navigateToProjectList();
        //checking that a single project appeared on the page
        await homepage.checkForTotalNumberOfProjectsOnThePage(1);
    });

};

module.exports = HomepageNewprojectTests;
