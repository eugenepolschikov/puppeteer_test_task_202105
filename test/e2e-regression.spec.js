'use strict';

/**
 * The e2e regression test suite runs various tests in pre-determined order
 * due to dependencies amongst various test steps
 */

const appLoginTest = require('../test/e2e-regression/app-login-tests');


describe('appLoginTests', appLoginTest);
