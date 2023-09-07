"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const source_1 = require("../source");
(0, mocha_1.describe)('Source', () => {
    (0, mocha_1.it)('asserts that a body was provided', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => new source_1.Source()).to.throw('Body must be a string. Received: undefined.');
    });
    (0, mocha_1.it)('asserts that a valid body was provided', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => new source_1.Source({})).to.throw('Body must be a string. Received: {}.');
    });
    (0, mocha_1.it)('can be Object.toStringified', () => {
        const source = new source_1.Source('');
        (0, chai_1.expect)(Object.prototype.toString.call(source)).to.equal('[object Source]');
    });
    (0, mocha_1.it)('rejects invalid locationOffset', () => {
        function createSource(locationOffset) {
            return new source_1.Source('', '', locationOffset);
        }
        (0, chai_1.expect)(() => createSource({ line: 0, column: 1 })).to.throw('line in locationOffset is 1-indexed and must be positive.');
        (0, chai_1.expect)(() => createSource({ line: -1, column: 1 })).to.throw('line in locationOffset is 1-indexed and must be positive.');
        (0, chai_1.expect)(() => createSource({ line: 1, column: 0 })).to.throw('column in locationOffset is 1-indexed and must be positive.');
        (0, chai_1.expect)(() => createSource({ line: 1, column: -1 })).to.throw('column in locationOffset is 1-indexed and must be positive.');
    });
});
//# sourceMappingURL=source-test.js.map