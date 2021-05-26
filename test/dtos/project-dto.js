'use strict';

const faker = require('faker');
require('datejs');


class ProjectDto {
    constructor() {
        const randomStrLenght = 5;
        this.projectName = `eugene-project-${faker.random.alphaNumeric(
            randomStrLenght
        )}-${new Date().format('%Y-%m-%d')}`;

    }
}

module.exports = ProjectDto;
