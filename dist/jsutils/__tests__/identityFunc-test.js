"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../identityFunc");
(0, mocha_1.describe)('identityFunc', () => {
    (0, mocha_1.it)('returns the first argument it receives', () => {
        // @ts-expect-error (Expects an argument)
        (0, chai_1.expect)((0, identityFunc_1.identityFunc)()).to.equal(undefined);
        (0, chai_1.expect)((0, identityFunc_1.identityFunc)(undefined)).to.equal(undefined);
        (0, chai_1.expect)((0, identityFunc_1.identityFunc)(null)).to.equal(null);
        const obj = {};
        (0, chai_1.expect)((0, identityFunc_1.identityFunc)(obj)).to.equal(obj);
    });
});
//# sourceMappingURL=identityFunc-test.js.map