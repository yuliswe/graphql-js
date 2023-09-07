"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../identityFunc");
const isAsyncIterable_1 = require("../isAsyncIterable");
(0, mocha_1.describe)('isAsyncIterable', () => {
    (0, mocha_1.it)('should return `true` for AsyncIterable', () => {
        const asyncIterable = { [Symbol.asyncIterator]: identityFunc_1.identityFunc };
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(asyncIterable)).to.equal(true);
        async function* asyncGeneratorFunc() {
            /* do nothing */
        }
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(asyncGeneratorFunc())).to.equal(true);
        // But async generator function itself is not iterable
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(asyncGeneratorFunc)).to.equal(false);
    });
    (0, mocha_1.it)('should return `false` for all other values', () => {
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(null)).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(undefined)).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)('ABC')).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)('0')).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)('')).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)([])).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(new Int8Array(1))).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)({})).to.equal(false);
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)({ iterable: true })).to.equal(false);
        const asyncIteratorWithoutSymbol = { next: identityFunc_1.identityFunc };
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(asyncIteratorWithoutSymbol)).to.equal(false);
        const nonAsyncIterable = { [Symbol.iterator]: identityFunc_1.identityFunc };
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(nonAsyncIterable)).to.equal(false);
        function* generatorFunc() {
            /* do nothing */
        }
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(generatorFunc())).to.equal(false);
        const invalidAsyncIterable = {
            [Symbol.asyncIterator]: { next: identityFunc_1.identityFunc },
        };
        (0, chai_1.expect)((0, isAsyncIterable_1.isAsyncIterable)(invalidAsyncIterable)).to.equal(false);
    });
});
//# sourceMappingURL=isAsyncIterable-test.js.map