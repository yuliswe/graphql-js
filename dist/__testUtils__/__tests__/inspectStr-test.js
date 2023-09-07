"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const inspectStr_1 = require("../inspectStr");
(0, mocha_1.describe)('inspectStr', () => {
    (0, mocha_1.it)('handles null and undefined values', () => {
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)(null)).to.equal('null');
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)(undefined)).to.equal('null');
    });
    (0, mocha_1.it)('correctly print various strings', () => {
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)('')).to.equal('``');
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)('a')).to.equal('`a`');
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)('"')).to.equal('`"`');
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)("'")).to.equal("`'`");
        (0, chai_1.expect)((0, inspectStr_1.inspectStr)('\\"')).to.equal('`\\"`');
    });
});
//# sourceMappingURL=inspectStr-test.js.map