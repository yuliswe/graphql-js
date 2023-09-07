"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const valueFromASTUntyped_1 = require("../valueFromASTUntyped");
(0, mocha_1.describe)('valueFromASTUntyped', () => {
    function expectValueFrom(valueText, variables) {
        const ast = (0, parser_1.parseValue)(valueText);
        const value = (0, valueFromASTUntyped_1.valueFromASTUntyped)(ast, variables);
        return (0, chai_1.expect)(value);
    }
    (0, mocha_1.it)('parses simple values', () => {
        expectValueFrom('null').to.equal(null);
        expectValueFrom('true').to.equal(true);
        expectValueFrom('false').to.equal(false);
        expectValueFrom('123').to.equal(123);
        expectValueFrom('123.456').to.equal(123.456);
        expectValueFrom('"abc123"').to.equal('abc123');
    });
    (0, mocha_1.it)('parses lists of values', () => {
        expectValueFrom('[true, false]').to.deep.equal([true, false]);
        expectValueFrom('[true, 123.45]').to.deep.equal([true, 123.45]);
        expectValueFrom('[true, null]').to.deep.equal([true, null]);
        expectValueFrom('[true, ["foo", 1.2]]').to.deep.equal([true, ['foo', 1.2]]);
    });
    (0, mocha_1.it)('parses input objects', () => {
        expectValueFrom('{ int: 123, bool: false }').to.deep.equal({
            int: 123,
            bool: false,
        });
        expectValueFrom('{ foo: [ { bar: "baz"} ] }').to.deep.equal({
            foo: [{ bar: 'baz' }],
        });
    });
    (0, mocha_1.it)('parses enum values as plain strings', () => {
        expectValueFrom('TEST_ENUM_VALUE').to.equal('TEST_ENUM_VALUE');
        expectValueFrom('[TEST_ENUM_VALUE]').to.deep.equal(['TEST_ENUM_VALUE']);
    });
    (0, mocha_1.it)('parses variables', () => {
        expectValueFrom('$testVariable', { testVariable: 'foo' }).to.equal('foo');
        expectValueFrom('[$testVariable]', { testVariable: 'foo' }).to.deep.equal([
            'foo',
        ]);
        expectValueFrom('{a:[$testVariable]}', {
            testVariable: 'foo',
        }).to.deep.equal({ a: ['foo'] });
        expectValueFrom('$testVariable', { testVariable: null }).to.equal(null);
        expectValueFrom('$testVariable', { testVariable: NaN }).to.satisfy(Number.isNaN);
        expectValueFrom('$testVariable', {}).to.equal(undefined);
        expectValueFrom('$testVariable', null).to.equal(undefined);
    });
});
//# sourceMappingURL=valueFromASTUntyped-test.js.map