"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const assertName_1 = require("../assertName");
(0, mocha_1.describe)('assertName', () => {
    (0, mocha_1.it)('passthrough valid name', () => {
        (0, chai_1.expect)((0, assertName_1.assertName)('_ValidName123')).to.equal('_ValidName123');
    });
    (0, mocha_1.it)('throws for non-strings', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, assertName_1.assertName)({})).to.throw('Expected name to be a string.');
    });
    (0, mocha_1.it)('throws on empty strings', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertName)('')).to.throw('Expected name to be a non-empty string.');
    });
    (0, mocha_1.it)('throws for names with invalid characters', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertName)('>--()-->')).to.throw('Names must only contain [_a-zA-Z0-9] but ">--()-->" does not.');
    });
    (0, mocha_1.it)('throws for names starting with invalid characters', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertName)('42MeaningsOfLife')).to.throw('Names must start with [_a-zA-Z] but "42MeaningsOfLife" does not.');
    });
});
(0, mocha_1.describe)('assertEnumValueName', () => {
    (0, mocha_1.it)('passthrough valid name', () => {
        (0, chai_1.expect)((0, assertName_1.assertEnumValueName)('_ValidName123')).to.equal('_ValidName123');
    });
    (0, mocha_1.it)('throws on empty strings', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('')).to.throw('Expected name to be a non-empty string.');
    });
    (0, mocha_1.it)('throws for names with invalid characters', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('>--()-->')).to.throw('Names must only contain [_a-zA-Z0-9] but ">--()-->" does not.');
    });
    (0, mocha_1.it)('throws for names starting with invalid characters', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('42MeaningsOfLife')).to.throw('Names must start with [_a-zA-Z] but "42MeaningsOfLife" does not.');
    });
    (0, mocha_1.it)('throws for restricted names', () => {
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('true')).to.throw('Enum values cannot be named: true');
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('false')).to.throw('Enum values cannot be named: false');
        (0, chai_1.expect)(() => (0, assertName_1.assertEnumValueName)('null')).to.throw('Enum values cannot be named: null');
    });
});
//# sourceMappingURL=assertName-test.js.map