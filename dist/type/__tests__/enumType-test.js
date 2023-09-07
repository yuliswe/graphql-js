"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const introspectionFromSchema_1 = require("../../utilities/introspectionFromSchema");
const graphql_1 = require("../../graphql");
const definition_1 = require("../definition");
const scalars_1 = require("../scalars");
const schema_1 = require("../schema");
const ColorType = new definition_1.GraphQLEnumType({
    name: 'Color',
    values: {
        RED: { value: 0 },
        GREEN: { value: 1 },
        BLUE: { value: 2 },
    },
});
const Complex1 = { someRandomObject: new Date() };
const Complex2 = { someRandomValue: 123 };
const ComplexEnum = new definition_1.GraphQLEnumType({
    name: 'Complex',
    values: {
        ONE: { value: Complex1 },
        TWO: { value: Complex2 },
    },
});
const QueryType = new definition_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        colorEnum: {
            type: ColorType,
            args: {
                fromEnum: { type: ColorType },
                fromInt: { type: scalars_1.GraphQLInt },
                fromString: { type: scalars_1.GraphQLString },
            },
            resolve(_source, { fromEnum, fromInt, fromString }) {
                return fromInt !== undefined
                    ? fromInt
                    : fromString !== undefined
                        ? fromString
                        : fromEnum;
            },
        },
        colorInt: {
            type: scalars_1.GraphQLInt,
            args: {
                fromEnum: { type: ColorType },
            },
            resolve(_source, { fromEnum }) {
                return fromEnum;
            },
        },
        complexEnum: {
            type: ComplexEnum,
            args: {
                fromEnum: {
                    type: ComplexEnum,
                    // Note: defaultValue is provided an *internal* representation for
                    // Enums, rather than the string name.
                    defaultValue: Complex1,
                },
                provideGoodValue: { type: scalars_1.GraphQLBoolean },
                provideBadValue: { type: scalars_1.GraphQLBoolean },
            },
            resolve(_source, { fromEnum, provideGoodValue, provideBadValue }) {
                if (provideGoodValue) {
                    // Note: this is one of the references of the internal values which
                    // ComplexEnum allows.
                    return Complex2;
                }
                if (provideBadValue) {
                    // Note: similar shape, but not the same *reference*
                    // as Complex2 above. Enum internal values require === equality.
                    return { someRandomValue: 123 };
                }
                return fromEnum;
            },
        },
    },
});
const MutationType = new definition_1.GraphQLObjectType({
    name: 'Mutation',
    fields: {
        favoriteEnum: {
            type: ColorType,
            args: { color: { type: ColorType } },
            resolve: (_source, { color }) => color,
        },
    },
});
const SubscriptionType = new definition_1.GraphQLObjectType({
    name: 'Subscription',
    fields: {
        subscribeToEnum: {
            type: ColorType,
            args: { color: { type: ColorType } },
            resolve: (_source, { color }) => color,
        },
    },
});
const schema = new schema_1.GraphQLSchema({
    query: QueryType,
    mutation: MutationType,
    subscription: SubscriptionType,
});
function executeQuery(source, variableValues) {
    return (0, graphql_1.graphqlSync)({ schema, source, variableValues });
}
(0, mocha_1.describe)('Type System: Enum Values', () => {
    (0, mocha_1.it)('accepts enum literals as input', () => {
        const result = executeQuery('{ colorInt(fromEnum: GREEN) }');
        (0, chai_1.expect)(result).to.deep.equal({
            data: { colorInt: 1 },
        });
    });
    (0, mocha_1.it)('enum may be output type', () => {
        const result = executeQuery('{ colorEnum(fromInt: 1) }');
        (0, chai_1.expect)(result).to.deep.equal({
            data: { colorEnum: 'GREEN' },
        });
    });
    (0, mocha_1.it)('enum may be both input and output type', () => {
        const result = executeQuery('{ colorEnum(fromEnum: GREEN) }');
        (0, chai_1.expect)(result).to.deep.equal({
            data: { colorEnum: 'GREEN' },
        });
    });
    (0, mocha_1.it)('does not accept string literals', () => {
        const result = executeQuery('{ colorEnum(fromEnum: "GREEN") }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Enum "Color" cannot represent non-enum value: "GREEN". Did you mean the enum value "GREEN"?',
                    locations: [{ line: 1, column: 23 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept values not in the enum', () => {
        const result = executeQuery('{ colorEnum(fromEnum: GREENISH) }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Value "GREENISH" does not exist in "Color" enum. Did you mean the enum value "GREEN"?',
                    locations: [{ line: 1, column: 23 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept values with incorrect casing', () => {
        const result = executeQuery('{ colorEnum(fromEnum: green) }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Value "green" does not exist in "Color" enum. Did you mean the enum value "GREEN" or "RED"?',
                    locations: [{ line: 1, column: 23 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept incorrect internal value', () => {
        const result = executeQuery('{ colorEnum(fromString: "GREEN") }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: { colorEnum: null },
            errors: [
                {
                    message: 'Enum "Color" cannot represent value: "GREEN"',
                    locations: [{ line: 1, column: 3 }],
                    path: ['colorEnum'],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept internal value in place of enum literal', () => {
        const result = executeQuery('{ colorEnum(fromEnum: 1) }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Enum "Color" cannot represent non-enum value: 1.',
                    locations: [{ line: 1, column: 23 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept enum literal in place of int', () => {
        const result = executeQuery('{ colorEnum(fromInt: GREEN) }');
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Int cannot represent non-integer value: GREEN',
                    locations: [{ line: 1, column: 22 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('accepts JSON string as enum variable', () => {
        const doc = 'query ($color: Color!) { colorEnum(fromEnum: $color) }';
        const result = executeQuery(doc, { color: 'BLUE' });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { colorEnum: 'BLUE' },
        });
    });
    (0, mocha_1.it)('accepts enum literals as input arguments to mutations', () => {
        const doc = 'mutation ($color: Color!) { favoriteEnum(color: $color) }';
        const result = executeQuery(doc, { color: 'GREEN' });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { favoriteEnum: 'GREEN' },
        });
    });
    (0, mocha_1.it)('accepts enum literals as input arguments to subscriptions', () => {
        const doc = 'subscription ($color: Color!) { subscribeToEnum(color: $color) }';
        const result = executeQuery(doc, { color: 'GREEN' });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { subscribeToEnum: 'GREEN' },
        });
    });
    (0, mocha_1.it)('does not accept internal value as enum variable', () => {
        const doc = 'query ($color: Color!) { colorEnum(fromEnum: $color) }';
        const result = executeQuery(doc, { color: 2 });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Variable "$color" got invalid value 2; Enum "Color" cannot represent non-string value: 2.',
                    locations: [{ line: 1, column: 8 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept string variables as enum input', () => {
        const doc = 'query ($color: String!) { colorEnum(fromEnum: $color) }';
        const result = executeQuery(doc, { color: 'BLUE' });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Variable "$color" of type "String!" used in position expecting type "Color".',
                    locations: [
                        { line: 1, column: 8 },
                        { line: 1, column: 47 },
                    ],
                },
            ],
        });
    });
    (0, mocha_1.it)('does not accept internal value variable as enum input', () => {
        const doc = 'query ($color: Int!) { colorEnum(fromEnum: $color) }';
        const result = executeQuery(doc, { color: 2 });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Variable "$color" of type "Int!" used in position expecting type "Color".',
                    locations: [
                        { line: 1, column: 8 },
                        { line: 1, column: 44 },
                    ],
                },
            ],
        });
    });
    (0, mocha_1.it)('enum value may have an internal value of 0', () => {
        const result = executeQuery(`
      {
        colorEnum(fromEnum: RED)
        colorInt(fromEnum: RED)
      }
    `);
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                colorEnum: 'RED',
                colorInt: 0,
            },
        });
    });
    (0, mocha_1.it)('enum inputs may be nullable', () => {
        const result = executeQuery(`
      {
        colorEnum
        colorInt
      }
    `);
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                colorEnum: null,
                colorInt: null,
            },
        });
    });
    (0, mocha_1.it)('presents a getValues() API for complex enums', () => {
        const values = ComplexEnum.getValues();
        (0, chai_1.expect)(values).to.have.deep.ordered.members([
            {
                name: 'ONE',
                description: undefined,
                value: Complex1,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
            {
                name: 'TWO',
                description: undefined,
                value: Complex2,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
        ]);
    });
    (0, mocha_1.it)('presents a getValue() API for complex enums', () => {
        const oneValue = ComplexEnum.getValue('ONE');
        (0, chai_1.expect)(oneValue).to.include({ name: 'ONE', value: Complex1 });
        // @ts-expect-error
        const badUsage = ComplexEnum.getValue(Complex1);
        (0, chai_1.expect)(badUsage).to.equal(undefined);
    });
    (0, mocha_1.it)('may be internally represented with complex values', () => {
        const result = executeQuery(`
      {
        first: complexEnum
        second: complexEnum(fromEnum: TWO)
        good: complexEnum(provideGoodValue: true)
        bad: complexEnum(provideBadValue: true)
      }
    `);
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: {
                first: 'ONE',
                second: 'TWO',
                good: 'TWO',
                bad: null,
            },
            errors: [
                {
                    message: 'Enum "Complex" cannot represent value: { someRandomValue: 123 }',
                    locations: [{ line: 6, column: 9 }],
                    path: ['bad'],
                },
            ],
        });
    });
    (0, mocha_1.it)('can be introspected without error', () => {
        (0, chai_1.expect)(() => (0, introspectionFromSchema_1.introspectionFromSchema)(schema)).to.not.throw();
    });
});
//# sourceMappingURL=enumType-test.js.map