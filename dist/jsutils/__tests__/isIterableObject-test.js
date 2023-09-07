"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../identityFunc");
const isIterableObject_1 = require("../isIterableObject");
(0, mocha_1.describe)('isIterableObject', () => {
    (0, mocha_1.it)('should return `true` for collections', () => {
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)([])).to.equal(true);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(new Int8Array(1))).to.equal(true);
        // eslint-disable-next-line no-new-wrappers
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(new String('ABC'))).to.equal(true);
        function getArguments() {
            return arguments;
        }
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(getArguments())).to.equal(true);
        const iterable = { [Symbol.iterator]: identityFunc_1.identityFunc };
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(iterable)).to.equal(true);
        function* generatorFunc() {
            /* do nothing */
        }
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(generatorFunc())).to.equal(true);
        // But generator function itself is not iterable
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(generatorFunc)).to.equal(false);
    });
    (0, mocha_1.it)('should return `false` for non-collections', () => {
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(null)).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(undefined)).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)('ABC')).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)('0')).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)('')).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(1)).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(0)).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(NaN)).to.equal(false);
        // eslint-disable-next-line no-new-wrappers
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(new Number(123))).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(true)).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(false)).to.equal(false);
        // eslint-disable-next-line no-new-wrappers
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(new Boolean(true))).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)({})).to.equal(false);
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)({ iterable: true })).to.equal(false);
        const iteratorWithoutSymbol = { next: identityFunc_1.identityFunc };
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(iteratorWithoutSymbol)).to.equal(false);
        const invalidIterable = {
            [Symbol.iterator]: { next: identityFunc_1.identityFunc },
        };
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(invalidIterable)).to.equal(false);
        const arrayLike = {};
        arrayLike[0] = 'Alpha';
        arrayLike[1] = 'Bravo';
        arrayLike[2] = 'Charlie';
        arrayLike.length = 3;
        (0, chai_1.expect)((0, isIterableObject_1.isIterableObject)(arrayLike)).to.equal(false);
    });
});
//# sourceMappingURL=isIterableObject-test.js.map