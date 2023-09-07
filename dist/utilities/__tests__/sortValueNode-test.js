"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const sortValueNode_1 = require("../sortValueNode");
(0, mocha_1.describe)('sortValueNode', () => {
    function expectSortedValue(source) {
        return (0, chai_1.expect)((0, printer_1.print)((0, sortValueNode_1.sortValueNode)((0, parser_1.parseValue)(source))));
    }
    (0, mocha_1.it)('do not change non-object values', () => {
        expectSortedValue('1').to.equal('1');
        expectSortedValue('3.14').to.equal('3.14');
        expectSortedValue('null').to.equal('null');
        expectSortedValue('true').to.equal('true');
        expectSortedValue('false').to.equal('false');
        expectSortedValue('"cba"').to.equal('"cba"');
        expectSortedValue('"""cba"""').to.equal('"""cba"""');
        expectSortedValue('[1, 3.14, null, false, "cba"]').to.equal('[1, 3.14, null, false, "cba"]');
        expectSortedValue('[[1, 3.14, null, false, "cba"]]').to.equal('[[1, 3.14, null, false, "cba"]]');
    });
    (0, mocha_1.it)('sort input object fields', () => {
        expectSortedValue('{ b: 2, a: 1 }').to.equal('{a: 1, b: 2}');
        expectSortedValue('{ a: { c: 3, b: 2 } }').to.equal('{a: {b: 2, c: 3}}');
        expectSortedValue('[{ b: 2, a: 1 }, { d: 4, c: 3}]').to.equal('[{a: 1, b: 2}, {c: 3, d: 4}]');
        expectSortedValue('{ b: { g: 7, f: 6 }, c: 3 , a: { d: 4, e: 5 } }').to.equal('{a: {d: 4, e: 5}, b: {f: 6, g: 7}, c: 3}');
    });
});
//# sourceMappingURL=sortValueNode-test.js.map