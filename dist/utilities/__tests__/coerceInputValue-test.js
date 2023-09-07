"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const coerceInputValue_1 = require("../coerceInputValue");
function coerceValue(inputValue, type) {
    const errors = [];
    const value = (0, coerceInputValue_1.coerceInputValue)(inputValue, type, (path, invalidValue, error) => {
        errors.push({ path, value: invalidValue, error: error.message });
    });
    return { errors, value };
}
function expectValue(result) {
    (0, chai_1.expect)(result.errors).to.deep.equal([]);
    return (0, chai_1.expect)(result.value);
}
function expectErrors(result) {
    return (0, chai_1.expect)(result.errors);
}
(0, mocha_1.describe)('coerceInputValue', () => {
    (0, mocha_1.describe)('for GraphQLNonNull', () => {
        const TestNonNull = new definition_1.GraphQLNonNull(scalars_1.GraphQLInt);
        (0, mocha_1.it)('returns no error for non-null value', () => {
            const result = coerceValue(1, TestNonNull);
            expectValue(result).to.equal(1);
        });
        (0, mocha_1.it)('returns an error for undefined value', () => {
            const result = coerceValue(undefined, TestNonNull);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Expected non-nullable type "Int!" not to be null.',
                    path: [],
                    value: undefined,
                },
            ]);
        });
        (0, mocha_1.it)('returns an error for null value', () => {
            const result = coerceValue(null, TestNonNull);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Expected non-nullable type "Int!" not to be null.',
                    path: [],
                    value: null,
                },
            ]);
        });
    });
    (0, mocha_1.describe)('for GraphQLScalar', () => {
        const TestScalar = new definition_1.GraphQLScalarType({
            name: 'TestScalar',
            parseValue(input) {
                if (input.error != null) {
                    throw new Error(input.error);
                }
                return input.value;
            },
        });
        (0, mocha_1.it)('returns no error for valid input', () => {
            const result = coerceValue({ value: 1 }, TestScalar);
            expectValue(result).to.equal(1);
        });
        (0, mocha_1.it)('returns no error for null result', () => {
            const result = coerceValue({ value: null }, TestScalar);
            expectValue(result).to.equal(null);
        });
        (0, mocha_1.it)('returns no error for NaN result', () => {
            const result = coerceValue({ value: NaN }, TestScalar);
            expectValue(result).to.satisfy(Number.isNaN);
        });
        (0, mocha_1.it)('returns an error for undefined result', () => {
            const result = coerceValue({ value: undefined }, TestScalar);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Expected type "TestScalar".',
                    path: [],
                    value: { value: undefined },
                },
            ]);
        });
        (0, mocha_1.it)('returns an error for undefined result', () => {
            const inputValue = { error: 'Some error message' };
            const result = coerceValue(inputValue, TestScalar);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Expected type "TestScalar". Some error message',
                    path: [],
                    value: { error: 'Some error message' },
                },
            ]);
        });
    });
    (0, mocha_1.describe)('for GraphQLEnum', () => {
        const TestEnum = new definition_1.GraphQLEnumType({
            name: 'TestEnum',
            values: {
                FOO: { value: 'InternalFoo' },
                BAR: { value: 123456789 },
            },
        });
        (0, mocha_1.it)('returns no error for a known enum name', () => {
            const fooResult = coerceValue('FOO', TestEnum);
            expectValue(fooResult).to.equal('InternalFoo');
            const barResult = coerceValue('BAR', TestEnum);
            expectValue(barResult).to.equal(123456789);
        });
        (0, mocha_1.it)('returns an error for misspelled enum value', () => {
            const result = coerceValue('foo', TestEnum);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Value "foo" does not exist in "TestEnum" enum. Did you mean the enum value "FOO"?',
                    path: [],
                    value: 'foo',
                },
            ]);
        });
        (0, mocha_1.it)('returns an error for incorrect value type', () => {
            const result1 = coerceValue(123, TestEnum);
            expectErrors(result1).to.deep.equal([
                {
                    error: 'Enum "TestEnum" cannot represent non-string value: 123.',
                    path: [],
                    value: 123,
                },
            ]);
            const result2 = coerceValue({ field: 'value' }, TestEnum);
            expectErrors(result2).to.deep.equal([
                {
                    error: 'Enum "TestEnum" cannot represent non-string value: { field: "value" }.',
                    path: [],
                    value: { field: 'value' },
                },
            ]);
        });
    });
    (0, mocha_1.describe)('for GraphQLInputObject', () => {
        const TestInputObject = new definition_1.GraphQLInputObjectType({
            name: 'TestInputObject',
            fields: {
                foo: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLInt) },
                bar: { type: scalars_1.GraphQLInt },
            },
        });
        (0, mocha_1.it)('returns no error for a valid input', () => {
            const result = coerceValue({ foo: 123 }, TestInputObject);
            expectValue(result).to.deep.equal({ foo: 123 });
        });
        (0, mocha_1.it)('returns an error for a non-object type', () => {
            const result = coerceValue(123, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Expected type "TestInputObject" to be an object.',
                    path: [],
                    value: 123,
                },
            ]);
        });
        (0, mocha_1.it)('returns an error for an invalid field', () => {
            const result = coerceValue({ foo: NaN }, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Int cannot represent non-integer value: NaN',
                    path: ['foo'],
                    value: NaN,
                },
            ]);
        });
        (0, mocha_1.it)('returns multiple errors for multiple invalid fields', () => {
            const result = coerceValue({ foo: 'abc', bar: 'def' }, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Int cannot represent non-integer value: "abc"',
                    path: ['foo'],
                    value: 'abc',
                },
                {
                    error: 'Int cannot represent non-integer value: "def"',
                    path: ['bar'],
                    value: 'def',
                },
            ]);
        });
        (0, mocha_1.it)('returns error for a missing required field', () => {
            const result = coerceValue({ bar: 123 }, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Field "foo" of required type "Int!" was not provided.',
                    path: [],
                    value: { bar: 123 },
                },
            ]);
        });
        (0, mocha_1.it)('returns error for an unknown field', () => {
            const result = coerceValue({ foo: 123, unknownField: 123 }, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Field "unknownField" is not defined by type "TestInputObject".',
                    path: [],
                    value: { foo: 123, unknownField: 123 },
                },
            ]);
        });
        (0, mocha_1.it)('returns error for a misspelled field', () => {
            const result = coerceValue({ foo: 123, bart: 123 }, TestInputObject);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Field "bart" is not defined by type "TestInputObject". Did you mean "bar"?',
                    path: [],
                    value: { foo: 123, bart: 123 },
                },
            ]);
        });
    });
    (0, mocha_1.describe)('for GraphQLInputObject with default value', () => {
        const makeTestInputObject = (defaultValue) => new definition_1.GraphQLInputObjectType({
            name: 'TestInputObject',
            fields: {
                foo: {
                    type: new definition_1.GraphQLScalarType({ name: 'TestScalar' }),
                    defaultValue,
                },
            },
        });
        (0, mocha_1.it)('returns no errors for valid input value', () => {
            const result = coerceValue({ foo: 5 }, makeTestInputObject(7));
            expectValue(result).to.deep.equal({ foo: 5 });
        });
        (0, mocha_1.it)('returns object with default value', () => {
            const result = coerceValue({}, makeTestInputObject(7));
            expectValue(result).to.deep.equal({ foo: 7 });
        });
        (0, mocha_1.it)('returns null as value', () => {
            const result = coerceValue({}, makeTestInputObject(null));
            expectValue(result).to.deep.equal({ foo: null });
        });
        (0, mocha_1.it)('returns NaN as value', () => {
            const result = coerceValue({}, makeTestInputObject(NaN));
            expectValue(result).to.have.property('foo').that.satisfy(Number.isNaN);
        });
    });
    (0, mocha_1.describe)('for GraphQLList', () => {
        const TestList = new definition_1.GraphQLList(scalars_1.GraphQLInt);
        (0, mocha_1.it)('returns no error for a valid input', () => {
            const result = coerceValue([1, 2, 3], TestList);
            expectValue(result).to.deep.equal([1, 2, 3]);
        });
        (0, mocha_1.it)('returns no error for a valid iterable input', () => {
            function* listGenerator() {
                yield 1;
                yield 2;
                yield 3;
            }
            const result = coerceValue(listGenerator(), TestList);
            expectValue(result).to.deep.equal([1, 2, 3]);
        });
        (0, mocha_1.it)('returns an error for an invalid input', () => {
            const result = coerceValue([1, 'b', true, 4], TestList);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Int cannot represent non-integer value: "b"',
                    path: [1],
                    value: 'b',
                },
                {
                    error: 'Int cannot represent non-integer value: true',
                    path: [2],
                    value: true,
                },
            ]);
        });
        (0, mocha_1.it)('returns a list for a non-list value', () => {
            const result = coerceValue(42, TestList);
            expectValue(result).to.deep.equal([42]);
        });
        (0, mocha_1.it)('returns a list for a non-list object value', () => {
            const TestListOfObjects = new definition_1.GraphQLList(new definition_1.GraphQLInputObjectType({
                name: 'TestObject',
                fields: {
                    length: { type: scalars_1.GraphQLInt },
                },
            }));
            const result = coerceValue({ length: 100500 }, TestListOfObjects);
            expectValue(result).to.deep.equal([{ length: 100500 }]);
        });
        (0, mocha_1.it)('returns an error for a non-list invalid value', () => {
            const result = coerceValue('INVALID', TestList);
            expectErrors(result).to.deep.equal([
                {
                    error: 'Int cannot represent non-integer value: "INVALID"',
                    path: [],
                    value: 'INVALID',
                },
            ]);
        });
        (0, mocha_1.it)('returns null for a null value', () => {
            const result = coerceValue(null, TestList);
            expectValue(result).to.deep.equal(null);
        });
    });
    (0, mocha_1.describe)('for nested GraphQLList', () => {
        const TestNestedList = new definition_1.GraphQLList(new definition_1.GraphQLList(scalars_1.GraphQLInt));
        (0, mocha_1.it)('returns no error for a valid input', () => {
            const result = coerceValue([[1], [2, 3]], TestNestedList);
            expectValue(result).to.deep.equal([[1], [2, 3]]);
        });
        (0, mocha_1.it)('returns a list for a non-list value', () => {
            const result = coerceValue(42, TestNestedList);
            expectValue(result).to.deep.equal([[42]]);
        });
        (0, mocha_1.it)('returns null for a null value', () => {
            const result = coerceValue(null, TestNestedList);
            expectValue(result).to.deep.equal(null);
        });
        (0, mocha_1.it)('returns nested lists for nested non-list values', () => {
            const result = coerceValue([1, 2, 3], TestNestedList);
            expectValue(result).to.deep.equal([[1], [2], [3]]);
        });
        (0, mocha_1.it)('returns nested null for nested null values', () => {
            const result = coerceValue([42, [null], null], TestNestedList);
            expectValue(result).to.deep.equal([[42], [null], null]);
        });
    });
    (0, mocha_1.describe)('with default onError', () => {
        (0, mocha_1.it)('throw error without path', () => {
            (0, chai_1.expect)(() => (0, coerceInputValue_1.coerceInputValue)(null, new definition_1.GraphQLNonNull(scalars_1.GraphQLInt))).to.throw('Invalid value null: Expected non-nullable type "Int!" not to be null.');
        });
        (0, mocha_1.it)('throw error with path', () => {
            (0, chai_1.expect)(() => (0, coerceInputValue_1.coerceInputValue)([null], new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLInt)))).to.throw('Invalid value null at "value[0]": Expected non-nullable type "Int!" not to be null.');
        });
    });
});
//# sourceMappingURL=coerceInputValue-test.js.map