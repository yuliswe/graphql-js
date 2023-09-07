"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const astFromValue_1 = require("../astFromValue");
(0, mocha_1.describe)('astFromValue', () => {
    (0, mocha_1.it)('converts boolean values to ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(true, scalars_1.GraphQLBoolean)).to.deep.equal({
            kind: 'BooleanValue',
            value: true,
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(false, scalars_1.GraphQLBoolean)).to.deep.equal({
            kind: 'BooleanValue',
            value: false,
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(undefined, scalars_1.GraphQLBoolean)).to.deep.equal(null);
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(null, scalars_1.GraphQLBoolean)).to.deep.equal({
            kind: 'NullValue',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(0, scalars_1.GraphQLBoolean)).to.deep.equal({
            kind: 'BooleanValue',
            value: false,
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(1, scalars_1.GraphQLBoolean)).to.deep.equal({
            kind: 'BooleanValue',
            value: true,
        });
        const NonNullBoolean = new definition_1.GraphQLNonNull(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(0, NonNullBoolean)).to.deep.equal({
            kind: 'BooleanValue',
            value: false,
        });
    });
    (0, mocha_1.it)('converts Int values to Int ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(-1, scalars_1.GraphQLInt)).to.deep.equal({
            kind: 'IntValue',
            value: '-1',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(123.0, scalars_1.GraphQLInt)).to.deep.equal({
            kind: 'IntValue',
            value: '123',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(1e4, scalars_1.GraphQLInt)).to.deep.equal({
            kind: 'IntValue',
            value: '10000',
        });
        // GraphQL spec does not allow coercing non-integer values to Int to avoid
        // accidental data loss.
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(123.5, scalars_1.GraphQLInt)).to.throw('Int cannot represent non-integer value: 123.5');
        // Note: outside the bounds of 32bit signed int.
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(1e40, scalars_1.GraphQLInt)).to.throw('Int cannot represent non 32-bit signed integer value: 1e+40');
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(NaN, scalars_1.GraphQLInt)).to.throw('Int cannot represent non-integer value: NaN');
    });
    (0, mocha_1.it)('converts Float values to Int/Float ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(-1, scalars_1.GraphQLFloat)).to.deep.equal({
            kind: 'IntValue',
            value: '-1',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(123.0, scalars_1.GraphQLFloat)).to.deep.equal({
            kind: 'IntValue',
            value: '123',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(123.5, scalars_1.GraphQLFloat)).to.deep.equal({
            kind: 'FloatValue',
            value: '123.5',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(1e4, scalars_1.GraphQLFloat)).to.deep.equal({
            kind: 'IntValue',
            value: '10000',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(1e40, scalars_1.GraphQLFloat)).to.deep.equal({
            kind: 'FloatValue',
            value: '1e+40',
        });
    });
    (0, mocha_1.it)('converts String values to String ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('hello', scalars_1.GraphQLString)).to.deep.equal({
            kind: 'StringValue',
            value: 'hello',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('VALUE', scalars_1.GraphQLString)).to.deep.equal({
            kind: 'StringValue',
            value: 'VALUE',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('VA\nLUE', scalars_1.GraphQLString)).to.deep.equal({
            kind: 'StringValue',
            value: 'VA\nLUE',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(123, scalars_1.GraphQLString)).to.deep.equal({
            kind: 'StringValue',
            value: '123',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(false, scalars_1.GraphQLString)).to.deep.equal({
            kind: 'StringValue',
            value: 'false',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(null, scalars_1.GraphQLString)).to.deep.equal({
            kind: 'NullValue',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(undefined, scalars_1.GraphQLString)).to.deep.equal(null);
    });
    (0, mocha_1.it)('converts ID values to Int/String ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('hello', scalars_1.GraphQLID)).to.deep.equal({
            kind: 'StringValue',
            value: 'hello',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('VALUE', scalars_1.GraphQLID)).to.deep.equal({
            kind: 'StringValue',
            value: 'VALUE',
        });
        // Note: EnumValues cannot contain non-identifier characters
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('VA\nLUE', scalars_1.GraphQLID)).to.deep.equal({
            kind: 'StringValue',
            value: 'VA\nLUE',
        });
        // Note: IntValues are used when possible.
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(-1, scalars_1.GraphQLID)).to.deep.equal({
            kind: 'IntValue',
            value: '-1',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(123, scalars_1.GraphQLID)).to.deep.equal({
            kind: 'IntValue',
            value: '123',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('123', scalars_1.GraphQLID)).to.deep.equal({
            kind: 'IntValue',
            value: '123',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('01', scalars_1.GraphQLID)).to.deep.equal({
            kind: 'StringValue',
            value: '01',
        });
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(false, scalars_1.GraphQLID)).to.throw('ID cannot represent value: false');
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(null, scalars_1.GraphQLID)).to.deep.equal({ kind: 'NullValue' });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(undefined, scalars_1.GraphQLID)).to.deep.equal(null);
    });
    (0, mocha_1.it)('converts using serialize from a custom scalar type', () => {
        const passthroughScalar = new definition_1.GraphQLScalarType({
            name: 'PassthroughScalar',
            serialize(value) {
                return value;
            },
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('value', passthroughScalar)).to.deep.equal({
            kind: 'StringValue',
            value: 'value',
        });
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(NaN, passthroughScalar)).to.throw('Cannot convert value to AST: NaN.');
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)(Infinity, passthroughScalar)).to.throw('Cannot convert value to AST: Infinity.');
        const returnNullScalar = new definition_1.GraphQLScalarType({
            name: 'ReturnNullScalar',
            serialize() {
                return null;
            },
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('value', returnNullScalar)).to.equal(null);
        class SomeClass {
        }
        const returnCustomClassScalar = new definition_1.GraphQLScalarType({
            name: 'ReturnCustomClassScalar',
            serialize() {
                return new SomeClass();
            },
        });
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)('value', returnCustomClassScalar)).to.throw('Cannot convert value to AST: {}.');
    });
    (0, mocha_1.it)('does not converts NonNull values to NullValue', () => {
        const NonNullBoolean = new definition_1.GraphQLNonNull(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(null, NonNullBoolean)).to.deep.equal(null);
    });
    const complexValue = { someArbitrary: 'complexValue' };
    const myEnum = new definition_1.GraphQLEnumType({
        name: 'MyEnum',
        values: {
            HELLO: {},
            GOODBYE: {},
            COMPLEX: { value: complexValue },
        },
    });
    (0, mocha_1.it)('converts string values to Enum ASTs if possible', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('HELLO', myEnum)).to.deep.equal({
            kind: 'EnumValue',
            value: 'HELLO',
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(complexValue, myEnum)).to.deep.equal({
            kind: 'EnumValue',
            value: 'COMPLEX',
        });
        // Note: case sensitive
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)('hello', myEnum)).to.throw('Enum "MyEnum" cannot represent value: "hello"');
        // Note: Not a valid enum value
        (0, chai_1.expect)(() => (0, astFromValue_1.astFromValue)('UNKNOWN_VALUE', myEnum)).to.throw('Enum "MyEnum" cannot represent value: "UNKNOWN_VALUE"');
    });
    (0, mocha_1.it)('converts array values to List ASTs', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(['FOO', 'BAR'], new definition_1.GraphQLList(scalars_1.GraphQLString))).to.deep.equal({
            kind: 'ListValue',
            values: [
                { kind: 'StringValue', value: 'FOO' },
                { kind: 'StringValue', value: 'BAR' },
            ],
        });
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(['HELLO', 'GOODBYE'], new definition_1.GraphQLList(myEnum))).to.deep.equal({
            kind: 'ListValue',
            values: [
                { kind: 'EnumValue', value: 'HELLO' },
                { kind: 'EnumValue', value: 'GOODBYE' },
            ],
        });
        function* listGenerator() {
            yield 1;
            yield 2;
            yield 3;
        }
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(listGenerator(), new definition_1.GraphQLList(scalars_1.GraphQLInt))).to.deep.equal({
            kind: 'ListValue',
            values: [
                { kind: 'IntValue', value: '1' },
                { kind: 'IntValue', value: '2' },
                { kind: 'IntValue', value: '3' },
            ],
        });
    });
    (0, mocha_1.it)('converts list singletons', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)('FOO', new definition_1.GraphQLList(scalars_1.GraphQLString))).to.deep.equal({
            kind: 'StringValue',
            value: 'FOO',
        });
    });
    (0, mocha_1.it)('skip invalid list items', () => {
        const ast = (0, astFromValue_1.astFromValue)(['FOO', null, 'BAR'], new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString)));
        (0, chai_1.expect)(ast).to.deep.equal({
            kind: 'ListValue',
            values: [
                { kind: 'StringValue', value: 'FOO' },
                { kind: 'StringValue', value: 'BAR' },
            ],
        });
    });
    const inputObj = new definition_1.GraphQLInputObjectType({
        name: 'MyInputObj',
        fields: {
            foo: { type: scalars_1.GraphQLFloat },
            bar: { type: myEnum },
        },
    });
    (0, mocha_1.it)('converts input objects', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)({ foo: 3, bar: 'HELLO' }, inputObj)).to.deep.equal({
            kind: 'ObjectValue',
            fields: [
                {
                    kind: 'ObjectField',
                    name: { kind: 'Name', value: 'foo' },
                    value: { kind: 'IntValue', value: '3' },
                },
                {
                    kind: 'ObjectField',
                    name: { kind: 'Name', value: 'bar' },
                    value: { kind: 'EnumValue', value: 'HELLO' },
                },
            ],
        });
    });
    (0, mocha_1.it)('converts input objects with explicit nulls', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)({ foo: null }, inputObj)).to.deep.equal({
            kind: 'ObjectValue',
            fields: [
                {
                    kind: 'ObjectField',
                    name: { kind: 'Name', value: 'foo' },
                    value: { kind: 'NullValue' },
                },
            ],
        });
    });
    (0, mocha_1.it)('does not converts non-object values as input objects', () => {
        (0, chai_1.expect)((0, astFromValue_1.astFromValue)(5, inputObj)).to.equal(null);
    });
});
//# sourceMappingURL=astFromValue-test.js.map