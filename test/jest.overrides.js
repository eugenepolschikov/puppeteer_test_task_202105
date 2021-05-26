'use strict';

const error = console.error;

//  https://github.com/facebook/jest/issues/6121#issuecomment-483024070
console.error = function(message) {
    // eslint-disable-next-line prefer-rest-params
    error.apply(console, arguments); // keep default behaviour
    throw message instanceof Error ? message : new Error(message);
};
