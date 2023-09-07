"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const invariant_1 = require("../invariant");
(0, mocha_1.describe)('invariant', () => {
    (0, mocha_1.it)('throws on false conditions', () => {
        (0, chai_1.expect)(() => (0, invariant_1.invariant)(false, 'Oops!')).to.throw('Oops!');
    });
    (0, mocha_1.it)('use default error message', () => {
        (0, chai_1.expect)(() => (0, invariant_1.invariant)(false)).to.throw('Unexpected invariant triggered.');
    });
});
//# sourceMappingURL=invariant-test.js.map