"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const genFuzzStrings_1 = require("../genFuzzStrings");
function expectFuzzStrings(options) {
    return (0, chai_1.expect)([...(0, genFuzzStrings_1.genFuzzStrings)(options)]);
}
(0, mocha_1.describe)('genFuzzStrings', () => {
    (0, mocha_1.it)('always provide empty string', () => {
        expectFuzzStrings({ allowedChars: [], maxLength: 0 }).to.deep.equal(['']);
        expectFuzzStrings({ allowedChars: [], maxLength: 1 }).to.deep.equal(['']);
        expectFuzzStrings({ allowedChars: ['a'], maxLength: 0 }).to.deep.equal([
            '',
        ]);
    });
    (0, mocha_1.it)('generate strings with single character', () => {
        expectFuzzStrings({ allowedChars: ['a'], maxLength: 1 }).to.deep.equal([
            '',
            'a',
        ]);
        expectFuzzStrings({
            allowedChars: ['a', 'b', 'c'],
            maxLength: 1,
        }).to.deep.equal(['', 'a', 'b', 'c']);
    });
    (0, mocha_1.it)('generate strings with multiple character', () => {
        expectFuzzStrings({ allowedChars: ['a'], maxLength: 2 }).to.deep.equal([
            '',
            'a',
            'aa',
        ]);
        expectFuzzStrings({
            allowedChars: ['a', 'b', 'c'],
            maxLength: 2,
        }).to.deep.equal([
            '',
            'a',
            'b',
            'c',
            'aa',
            'ab',
            'ac',
            'ba',
            'bb',
            'bc',
            'ca',
            'cb',
            'cc',
        ]);
    });
    (0, mocha_1.it)('generate strings longer than possible number of characters', () => {
        expectFuzzStrings({
            allowedChars: ['a', 'b'],
            maxLength: 3,
        }).to.deep.equal([
            '',
            'a',
            'b',
            'aa',
            'ab',
            'ba',
            'bb',
            'aaa',
            'aab',
            'aba',
            'abb',
            'baa',
            'bab',
            'bba',
            'bbb',
        ]);
    });
});
//# sourceMappingURL=genFuzzStrings-test.js.map