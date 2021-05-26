'use strict';

const faker = require('faker');
require('datejs');


class KeyDto {
    constructor() {
        const randomStrLenght = 4;
        this.keyName = `${faker.random.alphaNumeric(
            randomStrLenght)}`;

    }
}

module.exports = KeyDto;
