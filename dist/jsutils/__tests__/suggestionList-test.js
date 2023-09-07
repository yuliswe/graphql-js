"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const suggestionList_1 = require("../suggestionList");
function expectSuggestions(input, options) {
    return (0, chai_1.expect)((0, suggestionList_1.suggestionList)(input, options));
}
(0, mocha_1.describe)('suggestionList', () => {
    (0, mocha_1.it)('Returns results when input is empty', () => {
        expectSuggestions('', ['a']).to.deep.equal(['a']);
    });
    (0, mocha_1.it)('Returns empty array when there are no options', () => {
        expectSuggestions('input', []).to.deep.equal([]);
    });
    (0, mocha_1.it)('Returns options with small lexical distance', () => {
        expectSuggestions('greenish', ['green']).to.deep.equal(['green']);
        expectSuggestions('green', ['greenish']).to.deep.equal(['greenish']);
    });
    (0, mocha_1.it)('Rejects options with distance that exceeds threshold', () => {
        // spell-checker:disable
        expectSuggestions('aaaa', ['aaab']).to.deep.equal(['aaab']);
        expectSuggestions('aaaa', ['aabb']).to.deep.equal(['aabb']);
        expectSuggestions('aaaa', ['abbb']).to.deep.equal([]);
        // spell-checker:enable
        expectSuggestions('ab', ['ca']).to.deep.equal([]);
    });
    (0, mocha_1.it)('Returns options with different case', () => {
        // cSpell:ignore verylongstring
        expectSuggestions('verylongstring', ['VERYLONGSTRING']).to.deep.equal([
            'VERYLONGSTRING',
        ]);
        expectSuggestions('VERYLONGSTRING', ['verylongstring']).to.deep.equal([
            'verylongstring',
        ]);
        expectSuggestions('VERYLONGSTRING', ['VeryLongString']).to.deep.equal([
            'VeryLongString',
        ]);
    });
    (0, mocha_1.it)('Returns options with transpositions', () => {
        expectSuggestions('agr', ['arg']).to.deep.equal(['arg']);
        expectSuggestions('214365879', ['123456789']).to.deep.equal(['123456789']);
    });
    (0, mocha_1.it)('Returns options sorted based on lexical distance', () => {
        expectSuggestions('abc', ['a', 'ab', 'abc']).to.deep.equal([
            'abc',
            'ab',
            'a',
        ]);
    });
    (0, mocha_1.it)('Returns options with the same lexical distance sorted lexicographically', () => {
        expectSuggestions('a', ['az', 'ax', 'ay']).to.deep.equal([
            'ax',
            'ay',
            'az',
        ]);
    });
});
//# sourceMappingURL=suggestionList-test.js.map