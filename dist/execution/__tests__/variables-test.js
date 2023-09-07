"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const inspect_1 = require("../../jsutils/inspect");
const invariant_1 = require("../../jsutils/invariant");
const GraphQLError_1 = require("../../error/GraphQLError");
const kinds_1 = require("../../language/kinds");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
const values_1 = require("../values");
const TestFaultyScalarGraphQLError = new GraphQLError_1.GraphQLError('FaultyScalarErrorMessage', {
    extensions: {
        code: 'FaultyScalarErrorMessageExtensionCode',
    },
});
const TestFaultyScalar = new definition_1.GraphQLScalarType({
    name: 'FaultyScalar',
    parseValue() {
        throw TestFaultyScalarGraphQLError;
    },
    parseLiteral() {
        throw TestFaultyScalarGraphQLError;
    },
});
const TestComplexScalar = new definition_1.GraphQLScalarType({
    name: 'ComplexScalar',
    parseValue(value) {
        (0, chai_1.expect)(value).to.equal('SerializedValue');
        return 'DeserializedValue';
    },
    parseLiteral(ast) {
        (0, chai_1.expect)(ast).to.include({ kind: 'StringValue', value: 'SerializedValue' });
        return 'DeserializedValue';
    },
});
const TestInputObject = new definition_1.GraphQLInputObjectType({
    name: 'TestInputObject',
    fields: {
        a: { type: scalars_1.GraphQLString },
        b: { type: new definition_1.GraphQLList(scalars_1.GraphQLString) },
        c: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
        d: { type: TestComplexScalar },
        e: { type: TestFaultyScalar },
    },
});
const TestNestedInputObject = new definition_1.GraphQLInputObjectType({
    name: 'TestNestedInputObject',
    fields: {
        na: { type: new definition_1.GraphQLNonNull(TestInputObject) },
        nb: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
    },
});
const TestEnum = new definition_1.GraphQLEnumType({
    name: 'TestEnum',
    values: {
        NULL: { value: null },
        UNDEFINED: { value: undefined },
        NAN: { value: NaN },
        FALSE: { value: false },
        CUSTOM: { value: 'custom value' },
        DEFAULT_VALUE: {},
    },
});
function fieldWithInputArg(inputArg) {
    return {
        type: scalars_1.GraphQLString,
        args: { input: inputArg },
        resolve(_, args) {
            if ('input' in args) {
                return (0, inspect_1.inspect)(args.input);
            }
        },
    };
}
const TestType = new definition_1.GraphQLObjectType({
    name: 'TestType',
    fields: {
        fieldWithEnumInput: fieldWithInputArg({ type: TestEnum }),
        fieldWithNonNullableEnumInput: fieldWithInputArg({
            type: new definition_1.GraphQLNonNull(TestEnum),
        }),
        fieldWithObjectInput: fieldWithInputArg({ type: TestInputObject }),
        fieldWithNullableStringInput: fieldWithInputArg({ type: scalars_1.GraphQLString }),
        fieldWithNonNullableStringInput: fieldWithInputArg({
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
        }),
        fieldWithDefaultArgumentValue: fieldWithInputArg({
            type: scalars_1.GraphQLString,
            defaultValue: 'Hello World',
        }),
        fieldWithNonNullableStringInputAndDefaultArgumentValue: fieldWithInputArg({
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            defaultValue: 'Hello World',
        }),
        fieldWithNestedInputObject: fieldWithInputArg({
            type: TestNestedInputObject,
            defaultValue: 'Hello World',
        }),
        list: fieldWithInputArg({ type: new definition_1.GraphQLList(scalars_1.GraphQLString) }),
        nnList: fieldWithInputArg({
            type: new definition_1.GraphQLNonNull(new definition_1.GraphQLList(scalars_1.GraphQLString)),
        }),
        listNN: fieldWithInputArg({
            type: new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString)),
        }),
        nnListNN: fieldWithInputArg({
            type: new definition_1.GraphQLNonNull(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString))),
        }),
    },
});
const schema = new schema_1.GraphQLSchema({ query: TestType });
function executeQuery(query, variableValues) {
    const document = (0, parser_1.parse)(query);
    return (0, execute_1.executeSync)({ schema, document, variableValues });
}
(0, mocha_1.describe)('Execute: Handles inputs', () => {
    (0, mocha_1.describe)('Handles objects and nullability', () => {
        (0, mocha_1.describe)('using inline structs', () => {
            (0, mocha_1.it)('executes with complex input', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: {a: "foo", b: ["bar"], c: "baz"})
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: "foo", b: ["bar"], c: "baz" }',
                    },
                });
            });
            (0, mocha_1.it)('properly parses single value to list', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: {a: "foo", b: "bar", c: "baz"})
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: "foo", b: ["bar"], c: "baz" }',
                    },
                });
            });
            (0, mocha_1.it)('properly parses null value to null', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: {a: null, b: null, c: "C", d: null})
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: null, b: null, c: "C", d: null }',
                    },
                });
            });
            (0, mocha_1.it)('properly parses null value in list', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: {b: ["A",null,"C"], c: "C"})
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ b: ["A", null, "C"], c: "C" }',
                    },
                });
            });
            (0, mocha_1.it)('does not use incorrect value', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: ["foo", "bar", "baz"])
          }
        `);
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    data: {
                        fieldWithObjectInput: null,
                    },
                    errors: [
                        {
                            message: 'Argument "input" has invalid value ["foo", "bar", "baz"].',
                            path: ['fieldWithObjectInput'],
                            locations: [{ line: 3, column: 41 }],
                        },
                    ],
                });
            });
            (0, mocha_1.it)('properly runs parseLiteral on complex scalar types', () => {
                const result = executeQuery(`
          {
            fieldWithObjectInput(input: {c: "foo", d: "SerializedValue"})
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ c: "foo", d: "DeserializedValue" }',
                    },
                });
            });
        });
        (0, mocha_1.it)('errors on faulty scalar type input', () => {
            const result = executeQuery(`
        {
          fieldWithObjectInput(input: {c: "foo", e: "bar"})
        }
      `);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    fieldWithObjectInput: null,
                },
                errors: [
                    {
                        message: 'Argument "input" has invalid value {c: "foo", e: "bar"}.',
                        path: ['fieldWithObjectInput'],
                        locations: [{ line: 3, column: 39 }],
                    },
                ],
            });
        });
        (0, mocha_1.describe)('using variables', () => {
            const doc = `
        query ($input: TestInputObject) {
          fieldWithObjectInput(input: $input)
        }
      `;
            (0, mocha_1.it)('executes with complex input', () => {
                const params = { input: { a: 'foo', b: ['bar'], c: 'baz' } };
                const result = executeQuery(doc, params);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: "foo", b: ["bar"], c: "baz" }',
                    },
                });
            });
            (0, mocha_1.it)('uses undefined when variable not provided', () => {
                const result = executeQuery(`
          query q($input: String) {
            fieldWithNullableStringInput(input: $input)
          }`, {
                // Intentionally missing variable values.
                });
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithNullableStringInput: null,
                    },
                });
            });
            (0, mocha_1.it)('uses null when variable provided explicit null value', () => {
                const result = executeQuery(`
          query q($input: String) {
            fieldWithNullableStringInput(input: $input)
          }`, { input: null });
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithNullableStringInput: 'null',
                    },
                });
            });
            (0, mocha_1.it)('uses default value when not provided', () => {
                const result = executeQuery(`
          query ($input: TestInputObject = {a: "foo", b: ["bar"], c: "baz"}) {
            fieldWithObjectInput(input: $input)
          }
        `);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: "foo", b: ["bar"], c: "baz" }',
                    },
                });
            });
            (0, mocha_1.it)('does not use default value when provided', () => {
                const result = executeQuery(`
            query q($input: String = "Default value") {
              fieldWithNullableStringInput(input: $input)
            }
          `, { input: 'Variable value' });
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithNullableStringInput: '"Variable value"',
                    },
                });
            });
            (0, mocha_1.it)('uses explicit null value instead of default value', () => {
                const result = executeQuery(`
          query q($input: String = "Default value") {
            fieldWithNullableStringInput(input: $input)
          }`, { input: null });
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithNullableStringInput: 'null',
                    },
                });
            });
            (0, mocha_1.it)('uses null default value when not provided', () => {
                const result = executeQuery(`
          query q($input: String = null) {
            fieldWithNullableStringInput(input: $input)
          }`, {
                // Intentionally missing variable values.
                });
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithNullableStringInput: 'null',
                    },
                });
            });
            (0, mocha_1.it)('properly parses single value to list', () => {
                const params = { input: { a: 'foo', b: 'bar', c: 'baz' } };
                const result = executeQuery(doc, params);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ a: "foo", b: ["bar"], c: "baz" }',
                    },
                });
            });
            (0, mocha_1.it)('executes with complex scalar input', () => {
                const params = { input: { c: 'foo', d: 'SerializedValue' } };
                const result = executeQuery(doc, params);
                (0, chai_1.expect)(result).to.deep.equal({
                    data: {
                        fieldWithObjectInput: '{ c: "foo", d: "DeserializedValue" }',
                    },
                });
            });
            (0, mocha_1.it)('errors on faulty scalar type input', () => {
                const params = { input: { c: 'foo', e: 'SerializedValue' } };
                const result = executeQuery(doc, params);
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value "SerializedValue" at "input.e"; FaultyScalarErrorMessage',
                            locations: [{ line: 2, column: 16 }],
                            extensions: { code: 'FaultyScalarErrorMessageExtensionCode' },
                        },
                    ],
                });
            });
            (0, mocha_1.it)('errors on null for nested non-null', () => {
                const params = { input: { a: 'foo', b: 'bar', c: null } };
                const result = executeQuery(doc, params);
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value null at "input.c"; Expected non-nullable type "String!" not to be null.',
                            locations: [{ line: 2, column: 16 }],
                        },
                    ],
                });
            });
            (0, mocha_1.it)('errors on incorrect type', () => {
                const result = executeQuery(doc, { input: 'foo bar' });
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value "foo bar"; Expected type "TestInputObject" to be an object.',
                            locations: [{ line: 2, column: 16 }],
                        },
                    ],
                });
            });
            (0, mocha_1.it)('errors on omission of nested non-null', () => {
                const result = executeQuery(doc, { input: { a: 'foo', b: 'bar' } });
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value { a: "foo", b: "bar" }; Field "c" of required type "String!" was not provided.',
                            locations: [{ line: 2, column: 16 }],
                        },
                    ],
                });
            });
            (0, mocha_1.it)('errors on deep nested errors and with many errors', () => {
                const nestedDoc = `
          query ($input: TestNestedInputObject) {
            fieldWithNestedObjectInput(input: $input)
          }
        `;
                const result = executeQuery(nestedDoc, { input: { na: { a: 'foo' } } });
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value { a: "foo" } at "input.na"; Field "c" of required type "String!" was not provided.',
                            locations: [{ line: 2, column: 18 }],
                        },
                        {
                            message: 'Variable "$input" got invalid value { na: { a: "foo" } }; Field "nb" of required type "String!" was not provided.',
                            locations: [{ line: 2, column: 18 }],
                        },
                    ],
                });
            });
            (0, mocha_1.it)('errors on addition of unknown input field', () => {
                const params = {
                    input: { a: 'foo', b: 'bar', c: 'baz', extra: 'dog' },
                };
                const result = executeQuery(doc, params);
                (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                    errors: [
                        {
                            message: 'Variable "$input" got invalid value { a: "foo", b: "bar", c: "baz", extra: "dog" }; Field "extra" is not defined by type "TestInputObject".',
                            locations: [{ line: 2, column: 16 }],
                        },
                    ],
                });
            });
        });
    });
    (0, mocha_1.describe)('Handles custom enum values', () => {
        (0, mocha_1.it)('allows custom enum values as inputs', () => {
            const result = executeQuery(`
        {
          null: fieldWithEnumInput(input: NULL)
          NaN: fieldWithEnumInput(input: NAN)
          false: fieldWithEnumInput(input: FALSE)
          customValue: fieldWithEnumInput(input: CUSTOM)
          defaultValue: fieldWithEnumInput(input: DEFAULT_VALUE)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    null: 'null',
                    NaN: 'NaN',
                    false: 'false',
                    customValue: '"custom value"',
                    defaultValue: '"DEFAULT_VALUE"',
                },
            });
        });
        (0, mocha_1.it)('allows non-nullable inputs to have null as enum custom value', () => {
            const result = executeQuery(`
        {
          fieldWithNonNullableEnumInput(input: NULL)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNonNullableEnumInput: 'null',
                },
            });
        });
    });
    (0, mocha_1.describe)('Handles nullable scalars', () => {
        (0, mocha_1.it)('allows nullable inputs to be omitted', () => {
            const result = executeQuery(`
        {
          fieldWithNullableStringInput
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: null,
                },
            });
        });
        (0, mocha_1.it)('allows nullable inputs to be omitted in a variable', () => {
            const result = executeQuery(`
        query ($value: String) {
          fieldWithNullableStringInput(input: $value)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: null,
                },
            });
        });
        (0, mocha_1.it)('allows nullable inputs to be omitted in an unlisted variable', () => {
            const result = executeQuery(`
        query {
          fieldWithNullableStringInput(input: $value)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: null,
                },
            });
        });
        (0, mocha_1.it)('allows nullable inputs to be set to null in a variable', () => {
            const doc = `
        query ($value: String) {
          fieldWithNullableStringInput(input: $value)
        }
      `;
            const result = executeQuery(doc, { value: null });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: 'null',
                },
            });
        });
        (0, mocha_1.it)('allows nullable inputs to be set to a value in a variable', () => {
            const doc = `
        query ($value: String) {
          fieldWithNullableStringInput(input: $value)
        }
      `;
            const result = executeQuery(doc, { value: 'a' });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: '"a"',
                },
            });
        });
        (0, mocha_1.it)('allows nullable inputs to be set to a value directly', () => {
            const result = executeQuery(`
        {
          fieldWithNullableStringInput(input: "a")
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: '"a"',
                },
            });
        });
    });
    (0, mocha_1.describe)('Handles non-nullable scalars', () => {
        (0, mocha_1.it)('allows non-nullable variable to be omitted given a default', () => {
            const result = executeQuery(`
        query ($value: String! = "default") {
          fieldWithNullableStringInput(input: $value)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNullableStringInput: '"default"',
                },
            });
        });
        (0, mocha_1.it)('allows non-nullable inputs to be omitted given a default', () => {
            const result = executeQuery(`
        query ($value: String = "default") {
          fieldWithNonNullableStringInput(input: $value)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNonNullableStringInput: '"default"',
                },
            });
        });
        (0, mocha_1.it)('does not allow non-nullable inputs to be omitted in a variable', () => {
            const result = executeQuery(`
        query ($value: String!) {
          fieldWithNonNullableStringInput(input: $value)
        }
      `);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$value" of required type "String!" was not provided.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('does not allow non-nullable inputs to be set to null in a variable', () => {
            const doc = `
        query ($value: String!) {
          fieldWithNonNullableStringInput(input: $value)
        }
      `;
            const result = executeQuery(doc, { value: null });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$value" of non-null type "String!" must not be null.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('allows non-nullable inputs to be set to a value in a variable', () => {
            const doc = `
        query ($value: String!) {
          fieldWithNonNullableStringInput(input: $value)
        }
      `;
            const result = executeQuery(doc, { value: 'a' });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNonNullableStringInput: '"a"',
                },
            });
        });
        (0, mocha_1.it)('allows non-nullable inputs to be set to a value directly', () => {
            const result = executeQuery(`
        {
          fieldWithNonNullableStringInput(input: "a")
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNonNullableStringInput: '"a"',
                },
            });
        });
        (0, mocha_1.it)('reports error for missing non-nullable inputs', () => {
            const result = executeQuery('{ fieldWithNonNullableStringInput }');
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    fieldWithNonNullableStringInput: null,
                },
                errors: [
                    {
                        message: 'Argument "input" of required type "String!" was not provided.',
                        locations: [{ line: 1, column: 3 }],
                        path: ['fieldWithNonNullableStringInput'],
                    },
                ],
            });
        });
        (0, mocha_1.it)('reports error for array passed into string input', () => {
            const doc = `
        query ($value: String!) {
          fieldWithNonNullableStringInput(input: $value)
        }
      `;
            const result = executeQuery(doc, { value: [1, 2, 3] });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$value" got invalid value [1, 2, 3]; String cannot represent a non string value: [1, 2, 3]',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
            (0, chai_1.expect)(result).to.have.nested.property('errors[0].originalError');
        });
        (0, mocha_1.it)('reports error for non-provided variables for non-nullable inputs', () => {
            // Note: this test would typically fail validation before encountering
            // this execution error, however for queries which previously validated
            // and are being run against a new schema which have introduced a breaking
            // change to make a formerly non-required argument required, this asserts
            // failure before allowing the underlying code to receive a non-null value.
            const result = executeQuery(`
        {
          fieldWithNonNullableStringInput(input: $foo)
        }
      `);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    fieldWithNonNullableStringInput: null,
                },
                errors: [
                    {
                        message: 'Argument "input" of required type "String!" was provided the variable "$foo" which was not provided a runtime value.',
                        locations: [{ line: 3, column: 50 }],
                        path: ['fieldWithNonNullableStringInput'],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('Handles lists and nullability', () => {
        (0, mocha_1.it)('allows lists to be null', () => {
            const doc = `
        query ($input: [String]) {
          list(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: null });
            (0, chai_1.expect)(result).to.deep.equal({ data: { list: 'null' } });
        });
        (0, mocha_1.it)('allows lists to contain values', () => {
            const doc = `
        query ($input: [String]) {
          list(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { list: '["A"]' } });
        });
        (0, mocha_1.it)('allows lists to contain null', () => {
            const doc = `
        query ($input: [String]) {
          list(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A', null, 'B'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { list: '["A", null, "B"]' } });
        });
        (0, mocha_1.it)('does not allow non-null lists to be null', () => {
            const doc = `
        query ($input: [String]!) {
          nnList(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: null });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" of non-null type "[String]!" must not be null.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('allows non-null lists to contain values', () => {
            const doc = `
        query ($input: [String]!) {
          nnList(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { nnList: '["A"]' } });
        });
        (0, mocha_1.it)('allows non-null lists to contain null', () => {
            const doc = `
        query ($input: [String]!) {
          nnList(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A', null, 'B'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { nnList: '["A", null, "B"]' } });
        });
        (0, mocha_1.it)('allows lists of non-nulls to be null', () => {
            const doc = `
        query ($input: [String!]) {
          listNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: null });
            (0, chai_1.expect)(result).to.deep.equal({ data: { listNN: 'null' } });
        });
        (0, mocha_1.it)('allows lists of non-nulls to contain values', () => {
            const doc = `
        query ($input: [String!]) {
          listNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { listNN: '["A"]' } });
        });
        (0, mocha_1.it)('does not allow lists of non-nulls to contain null', () => {
            const doc = `
        query ($input: [String!]) {
          listNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A', null, 'B'] });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" got invalid value null at "input[1]"; Expected non-nullable type "String!" not to be null.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('does not allow non-null lists of non-nulls to be null', () => {
            const doc = `
        query ($input: [String!]!) {
          nnListNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: null });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" of non-null type "[String!]!" must not be null.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('allows non-null lists of non-nulls to contain values', () => {
            const doc = `
        query ($input: [String!]!) {
          nnListNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A'] });
            (0, chai_1.expect)(result).to.deep.equal({ data: { nnListNN: '["A"]' } });
        });
        (0, mocha_1.it)('does not allow non-null lists of non-nulls to contain null', () => {
            const doc = `
        query ($input: [String!]!) {
          nnListNN(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: ['A', null, 'B'] });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" got invalid value null at "input[1]"; Expected non-nullable type "String!" not to be null.',
                        locations: [{ line: 2, column: 16 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('does not allow invalid types to be used as values', () => {
            const doc = `
        query ($input: TestType!) {
          fieldWithObjectInput(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: { list: ['A', 'B'] } });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" expected value of type "TestType!" which cannot be used as an input type.',
                        locations: [{ line: 2, column: 24 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('does not allow unknown types to be used as values', () => {
            const doc = `
        query ($input: UnknownType!) {
          fieldWithObjectInput(input: $input)
        }
      `;
            const result = executeQuery(doc, { input: 'WhoKnows' });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Variable "$input" expected value of type "UnknownType!" which cannot be used as an input type.',
                        locations: [{ line: 2, column: 24 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('Execute: Uses argument default values', () => {
        (0, mocha_1.it)('when no argument provided', () => {
            const result = executeQuery('{ fieldWithDefaultArgumentValue }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithDefaultArgumentValue: '"Hello World"',
                },
            });
        });
        (0, mocha_1.it)('when omitted variable provided', () => {
            const result = executeQuery(`
        query ($optional: String) {
          fieldWithDefaultArgumentValue(input: $optional)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithDefaultArgumentValue: '"Hello World"',
                },
            });
        });
        (0, mocha_1.it)('not when argument cannot be coerced', () => {
            const result = executeQuery(`
        {
          fieldWithDefaultArgumentValue(input: WRONG_TYPE)
        }
      `);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    fieldWithDefaultArgumentValue: null,
                },
                errors: [
                    {
                        message: 'Argument "input" has invalid value WRONG_TYPE.',
                        locations: [{ line: 3, column: 48 }],
                        path: ['fieldWithDefaultArgumentValue'],
                    },
                ],
            });
        });
        (0, mocha_1.it)('when no runtime value is provided to a non-null argument', () => {
            const result = executeQuery(`
        query optionalVariable($optional: String) {
          fieldWithNonNullableStringInputAndDefaultArgumentValue(input: $optional)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    fieldWithNonNullableStringInputAndDefaultArgumentValue: '"Hello World"',
                },
            });
        });
    });
    (0, mocha_1.describe)('getVariableValues: limit maximum number of coercion errors', () => {
        const doc = (0, parser_1.parse)(`
      query ($input: [String!]) {
        listNN(input: $input)
      }
    `);
        const operation = doc.definitions[0];
        (0, invariant_1.invariant)(operation.kind === kinds_1.Kind.OPERATION_DEFINITION);
        const { variableDefinitions } = operation;
        (0, invariant_1.invariant)(variableDefinitions != null);
        const inputValue = { input: [0, 1, 2] };
        function invalidValueError(value, index) {
            return {
                message: `Variable "$input" got invalid value ${value} at "input[${index}]"; String cannot represent a non string value: ${value}`,
                locations: [{ line: 2, column: 14 }],
            };
        }
        (0, mocha_1.it)('return all errors by default', () => {
            const result = (0, values_1.getVariableValues)(schema, variableDefinitions, inputValue);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    invalidValueError(0, 0),
                    invalidValueError(1, 1),
                    invalidValueError(2, 2),
                ],
            });
        });
        (0, mocha_1.it)('when maxErrors is equal to number of errors', () => {
            const result = (0, values_1.getVariableValues)(schema, variableDefinitions, inputValue, { maxErrors: 3 });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    invalidValueError(0, 0),
                    invalidValueError(1, 1),
                    invalidValueError(2, 2),
                ],
            });
        });
        (0, mocha_1.it)('when maxErrors is less than number of errors', () => {
            const result = (0, values_1.getVariableValues)(schema, variableDefinitions, inputValue, { maxErrors: 2 });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    invalidValueError(0, 0),
                    invalidValueError(1, 1),
                    {
                        message: 'Too many errors processing variables, error limit reached. Execution aborted.',
                    },
                ],
            });
        });
    });
});
//# sourceMappingURL=variables-test.js.map