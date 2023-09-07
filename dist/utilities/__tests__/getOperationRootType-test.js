"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const invariant_1 = require("../../jsutils/invariant");
const kinds_1 = require("../../language/kinds");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const getOperationRootType_1 = require("../getOperationRootType");
const queryType = new definition_1.GraphQLObjectType({
    name: 'FooQuery',
    fields: () => ({
        field: { type: scalars_1.GraphQLString },
    }),
});
const mutationType = new definition_1.GraphQLObjectType({
    name: 'FooMutation',
    fields: () => ({
        field: { type: scalars_1.GraphQLString },
    }),
});
const subscriptionType = new definition_1.GraphQLObjectType({
    name: 'FooSubscription',
    fields: () => ({
        field: { type: scalars_1.GraphQLString },
    }),
});
function getOperationNode(doc) {
    const operationNode = doc.definitions[0];
    (0, invariant_1.invariant)(operationNode.kind === kinds_1.Kind.OPERATION_DEFINITION);
    return operationNode;
}
(0, mocha_1.describe)('Deprecated - getOperationRootType', () => {
    (0, mocha_1.it)('Gets a Query type for an unnamed OperationDefinitionNode', () => {
        const testSchema = new schema_1.GraphQLSchema({
            query: queryType,
        });
        const doc = (0, parser_1.parse)('{ field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.equal(queryType);
    });
    (0, mocha_1.it)('Gets a Query type for an named OperationDefinitionNode', () => {
        const testSchema = new schema_1.GraphQLSchema({
            query: queryType,
        });
        const doc = (0, parser_1.parse)('query Q { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.equal(queryType);
    });
    (0, mocha_1.it)('Gets a type for OperationTypeDefinitionNodes', () => {
        const testSchema = new schema_1.GraphQLSchema({
            query: queryType,
            mutation: mutationType,
            subscription: subscriptionType,
        });
        const doc = (0, parser_1.parse)(`
      schema {
        query: FooQuery
        mutation: FooMutation
        subscription: FooSubscription
      }
    `);
        const schemaNode = doc.definitions[0];
        (0, invariant_1.invariant)(schemaNode.kind === kinds_1.Kind.SCHEMA_DEFINITION);
        const [queryNode, mutationNode, subscriptionNode] = schemaNode.operationTypes;
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, queryNode)).to.equal(queryType);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, mutationNode)).to.equal(mutationType);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, subscriptionNode)).to.equal(subscriptionType);
    });
    (0, mocha_1.it)('Gets a Mutation type for an OperationDefinitionNode', () => {
        const testSchema = new schema_1.GraphQLSchema({
            mutation: mutationType,
        });
        const doc = (0, parser_1.parse)('mutation { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.equal(mutationType);
    });
    (0, mocha_1.it)('Gets a Subscription type for an OperationDefinitionNode', () => {
        const testSchema = new schema_1.GraphQLSchema({
            subscription: subscriptionType,
        });
        const doc = (0, parser_1.parse)('subscription { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)((0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.equal(subscriptionType);
    });
    (0, mocha_1.it)('Throws when query type not defined in schema', () => {
        const testSchema = new schema_1.GraphQLSchema({});
        const doc = (0, parser_1.parse)('query { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)(() => (0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.throw('Schema does not define the required query root type.');
    });
    (0, mocha_1.it)('Throws when mutation type not defined in schema', () => {
        const testSchema = new schema_1.GraphQLSchema({});
        const doc = (0, parser_1.parse)('mutation { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)(() => (0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.throw('Schema is not configured for mutations.');
    });
    (0, mocha_1.it)('Throws when subscription type not defined in schema', () => {
        const testSchema = new schema_1.GraphQLSchema({});
        const doc = (0, parser_1.parse)('subscription { field }');
        const operationNode = getOperationNode(doc);
        (0, chai_1.expect)(() => (0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.throw('Schema is not configured for subscriptions.');
    });
    (0, mocha_1.it)('Throws when operation not a valid operation kind', () => {
        const testSchema = new schema_1.GraphQLSchema({});
        const doc = (0, parser_1.parse)('{ field }');
        const operationNode = {
            ...getOperationNode(doc),
            // @ts-expect-error
            operation: 'non_existent_operation',
        };
        (0, chai_1.expect)(() => (0, getOperationRootType_1.getOperationRootType)(testSchema, operationNode)).to.throw('Can only have query, mutation and subscription operations.');
    });
});
//# sourceMappingURL=getOperationRootType-test.js.map