'use strict';

const {expect} = require('chai');
const rootConfig = require('config');
const reportUtils = require('../reporting/utils');
const homepage = require('../pages/home-page.js')
const ProjectDto = require("../dtos/project-dto");
const KeyDto = require("../dtos/key-dto");

const waitTimes = rootConfig.get('testdata.wait-times');

const HomepageNewprojectTests = () => {
    const {page, reporter} = global;
    const projectData = new ProjectDto();
    const projectTwo = new ProjectDto();
    const keyVal = new KeyDto();

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
        const expectedProjectsNumber = 1;
        await homepage.checkForTotalNumberOfProjectsOnThePage(expectedProjectsNumber);
    });

    it('can create another project and test that total number of projects equals 2', async () =>{
        await homepage.reloadThePage();
        await homepage.addNewProject();
        await homepage.fillInProjectDataAndSubmit(projectTwo);
        await homepage.navigateToProjectList();

        const expectedProjectsNumber = 2;
        await homepage.checkForTotalNumberOfProjectsOnThePage(expectedProjectsNumber);
    })

    it('can create a key for the first newly added project', async () =>{
        await homepage.reloadThePage();
        await homepage.openProjectByName(projectData.projectName);
        await homepage.addKeyButtonClick();
        await homepage.fillInKeyPopupAndSaveIt(keyVal.keyName);

    })

};

module.exports = HomepageNewprojectTests;
