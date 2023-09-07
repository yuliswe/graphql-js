"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../../jsutils/identityFunc");
const invariant_1 = require("../../jsutils/invariant");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const valueFromAST_1 = require("../valueFromAST");
(0, mocha_1.describe)('valueFromAST', () => {
    function expectValueFrom(valueText, type, variables) {
        const ast = (0, parser_1.parseValue)(valueText);
        const value = (0, valueFromAST_1.valueFromAST)(ast, type, variables);
        return (0, chai_1.expect)(value);
    }
    (0, mocha_1.it)('rejects empty input', () => {
        (0, chai_1.expect)((0, valueFromAST_1.valueFromAST)(null, scalars_1.GraphQLBoolean)).to.deep.equal(undefined);
    });
    (0, mocha_1.it)('converts according to input coercion rules', () => {
        expectValueFrom('true', scalars_1.GraphQLBoolean).to.equal(true);
        expectValueFrom('false', scalars_1.GraphQLBoolean).to.equal(false);
        expectValueFrom('123', scalars_1.GraphQLInt).to.equal(123);
        expectValueFrom('123', scalars_1.GraphQLFloat).to.equal(123);
        expectValueFrom('123.456', scalars_1.GraphQLFloat).to.equal(123.456);
        expectValueFrom('"abc123"', scalars_1.GraphQLString).to.equal('abc123');
        expectValueFrom('123456', scalars_1.GraphQLID).to.equal('123456');
        expectValueFrom('"123456"', scalars_1.GraphQLID).to.equal('123456');
    });
    (0, mocha_1.it)('does not convert when input coercion rules reject a value', () => {
        expectValueFrom('123', scalars_1.GraphQLBoolean).to.equal(undefined);
        expectValueFrom('123.456', scalars_1.GraphQLInt).to.equal(undefined);
        expectValueFrom('true', scalars_1.GraphQLInt).to.equal(undefined);
        expectValueFrom('"123"', scalars_1.GraphQLInt).to.equal(undefined);
        expectValueFrom('"123"', scalars_1.GraphQLFloat).to.equal(undefined);
        expectValueFrom('123', scalars_1.GraphQLString).to.equal(undefined);
        expectValueFrom('true', scalars_1.GraphQLString).to.equal(undefined);
        expectValueFrom('123.456', scalars_1.GraphQLString).to.equal(undefined);
    });
    (0, mocha_1.it)('convert using parseLiteral from a custom scalar type', () => {
        const passthroughScalar = new definition_1.GraphQLScalarType({
            name: 'PassthroughScalar',
            parseLiteral(node) {
                (0, invariant_1.invariant)(node.kind === 'StringValue');
                return node.value;
            },
            parseValue: identityFunc_1.identityFunc,
        });
        expectValueFrom('"value"', passthroughScalar).to.equal('value');
        const throwScalar = new definition_1.GraphQLScalarType({
            name: 'ThrowScalar',
            parseLiteral() {
                throw new Error('Test');
            },
            parseValue: identityFunc_1.identityFunc,
        });
        expectValueFrom('value', throwScalar).to.equal(undefined);
        const returnUndefinedScalar = new definition_1.GraphQLScalarType({
            name: 'ReturnUndefinedScalar',
            parseLiteral() {
                return undefined;
            },
            parseValue: identityFunc_1.identityFunc,
        });
        expectValueFrom('value', returnUndefinedScalar).to.equal(undefined);
    });
    (0, mocha_1.it)('converts enum values according to input coercion rules', () => {
        const testEnum = new definition_1.GraphQLEnumType({
            name: 'TestColor',
            values: {
                RED: { value: 1 },
                GREEN: { value: 2 },
                BLUE: { value: 3 },
                NULL: { value: null },
                NAN: { value: NaN },
                NO_CUSTOM_VALUE: { value: undefined },
            },
        });
        expectValueFrom('RED', testEnum).to.equal(1);
        expectValueFrom('BLUE', testEnum).to.equal(3);
        expectValueFrom('3', testEnum).to.equal(undefined);
        expectValueFrom('"BLUE"', testEnum).to.equal(undefined);
        expectValueFrom('null', testEnum).to.equal(null);
        expectValueFrom('NULL', testEnum).to.equal(null);
        expectValueFrom('NULL', new definition_1.GraphQLNonNull(testEnum)).to.equal(null);
        expectValueFrom('NAN', testEnum).to.deep.equal(NaN);
        expectValueFrom('NO_CUSTOM_VALUE', testEnum).to.equal('NO_CUSTOM_VALUE');
    });
    // Boolean!
    const nonNullBool = new definition_1.GraphQLNonNull(scalars_1.GraphQLBoolean);
    // [Boolean]
    const listOfBool = new definition_1.GraphQLList(scalars_1.GraphQLBoolean);
    // [Boolean!]
    const listOfNonNullBool = new definition_1.GraphQLList(nonNullBool);
    // [Boolean]!
    const nonNullListOfBool = new definition_1.GraphQLNonNull(listOfBool);
    // [Boolean!]!
    const nonNullListOfNonNullBool = new definition_1.GraphQLNonNull(listOfNonNullBool);
    (0, mocha_1.it)('coerces to null unless non-null', () => {
        expectValueFrom('null', scalars_1.GraphQLBoolean).to.equal(null);
        expectValueFrom('null', nonNullBool).to.equal(undefined);
    });
    (0, mocha_1.it)('coerces lists of values', () => {
        expectValueFrom('true', listOfBool).to.deep.equal([true]);
        expectValueFrom('123', listOfBool).to.equal(undefined);
        expectValueFrom('null', listOfBool).to.equal(null);
        expectValueFrom('[true, false]', listOfBool).to.deep.equal([true, false]);
        expectValueFrom('[true, 123]', listOfBool).to.equal(undefined);
        expectValueFrom('[true, null]', listOfBool).to.deep.equal([true, null]);
        expectValueFrom('{ true: true }', listOfBool).to.equal(undefined);
    });
    (0, mocha_1.it)('coerces non-null lists of values', () => {
        expectValueFrom('true', nonNullListOfBool).to.deep.equal([true]);
        expectValueFrom('123', nonNullListOfBool).to.equal(undefined);
        expectValueFrom('null', nonNullListOfBool).to.equal(undefined);
        expectValueFrom('[true, false]', nonNullListOfBool).to.deep.equal([
            true,
            false,
        ]);
        expectValueFrom('[true, 123]', nonNullListOfBool).to.equal(undefined);
        expectValueFrom('[true, null]', nonNullListOfBool).to.deep.equal([
            true,
            null,
        ]);
    });
    (0, mocha_1.it)('coerces lists of non-null values', () => {
        expectValueFrom('true', listOfNonNullBool).to.deep.equal([true]);
        expectValueFrom('123', listOfNonNullBool).to.equal(undefined);
        expectValueFrom('null', listOfNonNullBool).to.equal(null);
        expectValueFrom('[true, false]', listOfNonNullBool).to.deep.equal([
            true,
            false,
        ]);
        expectValueFrom('[true, 123]', listOfNonNullBool).to.equal(undefined);
        expectValueFrom('[true, null]', listOfNonNullBool).to.equal(undefined);
    });
    (0, mocha_1.it)('coerces non-null lists of non-null values', () => {
        expectValueFrom('true', nonNullListOfNonNullBool).to.deep.equal([true]);
        expectValueFrom('123', nonNullListOfNonNullBool).to.equal(undefined);
        expectValueFrom('null', nonNullListOfNonNullBool).to.equal(undefined);
        expectValueFrom('[true, false]', nonNullListOfNonNullBool).to.deep.equal([
            true,
            false,
        ]);
        expectValueFrom('[true, 123]', nonNullListOfNonNullBool).to.equal(undefined);
        expectValueFrom('[true, null]', nonNullListOfNonNullBool).to.equal(undefined);
    });
    const testInputObj = new definition_1.GraphQLInputObjectType({
        name: 'TestInput',
        fields: {
            int: { type: scalars_1.GraphQLInt, defaultValue: 42 },
            bool: { type: scalars_1.GraphQLBoolean },
            requiredBool: { type: nonNullBool },
        },
    });
    (0, mocha_1.it)('coerces input objects according to input coercion rules', () => {
        expectValueFrom('null', testInputObj).to.equal(null);
        expectValueFrom('123', testInputObj).to.equal(undefined);
        expectValueFrom('[]', testInputObj).to.equal(undefined);
        expectValueFrom('{ int: 123, requiredBool: false }', testInputObj).to.deep.equal({
            int: 123,
            requiredBool: false,
        });
        expectValueFrom('{ bool: true, requiredBool: false }', testInputObj).to.deep.equal({
            int: 42,
            bool: true,
            requiredBool: false,
        });
        expectValueFrom('{ int: true, requiredBool: true }', testInputObj).to.equal(undefined);
        expectValueFrom('{ requiredBool: null }', testInputObj).to.equal(undefined);
        expectValueFrom('{ bool: true }', testInputObj).to.equal(undefined);
    });
    (0, mocha_1.it)('accepts variable values assuming already coerced', () => {
        expectValueFrom('$var', scalars_1.GraphQLBoolean, {}).to.equal(undefined);
        expectValueFrom('$var', scalars_1.GraphQLBoolean, { var: true }).to.equal(true);
        expectValueFrom('$var', scalars_1.GraphQLBoolean, { var: null }).to.equal(null);
        expectValueFrom('$var', nonNullBool, { var: null }).to.equal(undefined);
    });
    (0, mocha_1.it)('asserts variables are provided as items in lists', () => {
        expectValueFrom('[ $foo ]', listOfBool, {}).to.deep.equal([null]);
        expectValueFrom('[ $foo ]', listOfNonNullBool, {}).to.equal(undefined);
        expectValueFrom('[ $foo ]', listOfNonNullBool, {
            foo: true,
        }).to.deep.equal([true]);
        // Note: variables are expected to have already been coerced, so we
        // do not expect the singleton wrapping behavior for variables.
        expectValueFrom('$foo', listOfNonNullBool, { foo: true }).to.equal(true);
        expectValueFrom('$foo', listOfNonNullBool, { foo: [true] }).to.deep.equal([
            true,
        ]);
    });
    (0, mocha_1.it)('omits input object fields for unprovided variables', () => {
        expectValueFrom('{ int: $foo, bool: $foo, requiredBool: true }', testInputObj, {}).to.deep.equal({ int: 42, requiredBool: true });
        expectValueFrom('{ requiredBool: $foo }', testInputObj, {}).to.equal(undefined);
        expectValueFrom('{ requiredBool: $foo }', testInputObj, {
            foo: true,
        }).to.deep.equal({
            int: 42,
            requiredBool: true,
        });
    });
});
//# sourceMappingURL=valueFromAST-test.js.map