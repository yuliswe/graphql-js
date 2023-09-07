"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const validate_1 = require("../../validation/validate");
const graphql_1 = require("../../graphql");
const execute_1 = require("../execute");
(0, mocha_1.describe)('Execute: synchronously when possible', () => {
    const schema = new schema_1.GraphQLSchema({
        query: new definition_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                syncField: {
                    type: scalars_1.GraphQLString,
                    resolve(rootValue) {
                        return rootValue;
                    },
                },
                asyncField: {
                    type: scalars_1.GraphQLString,
                    resolve(rootValue) {
                        return Promise.resolve(rootValue);
                    },
                },
            },
        }),
        mutation: new definition_1.GraphQLObjectType({
            name: 'Mutation',
            fields: {
                syncMutationField: {
                    type: scalars_1.GraphQLString,
                    resolve(rootValue) {
                        return rootValue;
                    },
                },
            },
        }),
    });
    (0, mocha_1.it)('does not return a Promise for initial errors', () => {
        const doc = 'fragment Example on Query { syncField }';
        const result = (0, execute_1.execute)({
            schema,
            document: (0, parser_1.parse)(doc),
            rootValue: 'rootValue',
        });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [{ message: 'Must provide an operation.' }],
        });
    });
    (0, mocha_1.it)('does not return a Promise if fields are all synchronous', () => {
        const doc = 'query Example { syncField }';
        const result = (0, execute_1.execute)({
            schema,
            document: (0, parser_1.parse)(doc),
            rootValue: 'rootValue',
        });
        (0, chai_1.expect)(result).to.deep.equal({ data: { syncField: 'rootValue' } });
    });
    (0, mocha_1.it)('does not return a Promise if mutation fields are all synchronous', () => {
        const doc = 'mutation Example { syncMutationField }';
        const result = (0, execute_1.execute)({
            schema,
            document: (0, parser_1.parse)(doc),
            rootValue: 'rootValue',
        });
        (0, chai_1.expect)(result).to.deep.equal({ data: { syncMutationField: 'rootValue' } });
    });
    (0, mocha_1.it)('returns a Promise if any field is asynchronous', async () => {
        const doc = 'query Example { syncField, asyncField }';
        const result = (0, execute_1.execute)({
            schema,
            document: (0, parser_1.parse)(doc),
            rootValue: 'rootValue',
        });
        (0, chai_1.expect)(result).to.be.instanceOf(Promise);
        (0, chai_1.expect)(await result).to.deep.equal({
            data: { syncField: 'rootValue', asyncField: 'rootValue' },
        });
    });
    (0, mocha_1.describe)('executeSync', () => {
        (0, mocha_1.it)('does not return a Promise for sync execution', () => {
            const doc = 'query Example { syncField }';
            const result = (0, execute_1.executeSync)({
                schema,
                document: (0, parser_1.parse)(doc),
                rootValue: 'rootValue',
            });
            (0, chai_1.expect)(result).to.deep.equal({ data: { syncField: 'rootValue' } });
        });
        (0, mocha_1.it)('throws if encountering async execution', () => {
            const doc = 'query Example { syncField, asyncField }';
            (0, chai_1.expect)(() => {
                (0, execute_1.executeSync)({
                    schema,
                    document: (0, parser_1.parse)(doc),
                    rootValue: 'rootValue',
                });
            }).to.throw('GraphQL execution failed to complete synchronously.');
        });
    });
    (0, mocha_1.describe)('graphqlSync', () => {
        (0, mocha_1.it)('report errors raised during schema validation', () => {
            const badSchema = new schema_1.GraphQLSchema({});
            const result = (0, graphql_1.graphqlSync)({
                schema: badSchema,
                source: '{ __typename }',
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [{ message: 'Query root type must be provided.' }],
            });
        });
        (0, mocha_1.it)('does not return a Promise for syntax errors', () => {
            const doc = 'fragment Example on Query { { { syncField }';
            const result = (0, graphql_1.graphqlSync)({
                schema,
                source: doc,
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                errors: [
                    {
                        message: 'Syntax Error: Expected Name, found "{".',
                        locations: [{ line: 1, column: 29 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('does not return a Promise for validation errors', () => {
            const doc = 'fragment Example on Query { unknownField }';
            const validationErrors = (0, validate_1.validate)(schema, (0, parser_1.parse)(doc));
            const result = (0, graphql_1.graphqlSync)({
                schema,
                source: doc,
            });
            (0, chai_1.expect)(result).to.deep.equal({ errors: validationErrors });
        });
        (0, mocha_1.it)('does not return a Promise for sync execution', () => {
            const doc = 'query Example { syncField }';
            const result = (0, graphql_1.graphqlSync)({
                schema,
                source: doc,
                rootValue: 'rootValue',
            });
            (0, chai_1.expect)(result).to.deep.equal({ data: { syncField: 'rootValue' } });
        });
        (0, mocha_1.it)('throws if encountering async execution', () => {
            const doc = 'query Example { syncField, asyncField }';
            (0, chai_1.expect)(() => {
                (0, graphql_1.graphqlSync)({
                    schema,
                    source: doc,
                    rootValue: 'rootValue',
                });
            }).to.throw('GraphQL execution failed to complete synchronously.');
        });
    });
});
//# sourceMappingURL=sync-test.js.map