"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../identityFunc");
const isObjectLike_1 = require("../isObjectLike");
(0, mocha_1.describe)('isObjectLike', () => {
    (0, mocha_1.it)('should return `true` for objects', () => {
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)({})).to.equal(true);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(Object.create(null))).to.equal(true);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(/a/)).to.equal(true);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)([])).to.equal(true);
    });
    (0, mocha_1.it)('should return `false` for non-objects', () => {
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(undefined)).to.equal(false);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(null)).to.equal(false);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(true)).to.equal(false);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)('')).to.equal(false);
        (0, chai_1.expect)((0, isObjectLike_1.isObjectLike)(identityFunc_1.identityFunc)).to.equal(false);
    });
});
//# sourceMappingURL=isObjectLike-test.js.map