"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueOperationTypesRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Unique operation types
 *
 * A GraphQL document is only valid if it has only one type per operation.
 */
function UniqueOperationTypesRule(context) {
    const schema = context.getSchema();
    const definedOperationTypes = Object.create(null);
    const existingOperationTypes = schema
        ? {
            query: schema.getQueryType(),
            mutation: schema.getMutationType(),
            subscription: schema.getSubscriptionType(),
        }
        : {};
    return {
        SchemaDefinition: checkOperationTypes,
        SchemaExtension: checkOperationTypes,
    };
    function checkOperationTypes(node) {
        var _a;
        // See: https://github.com/graphql/graphql-js/issues/2203
        /* c8 ignore next */
        const operationTypesNodes = (_a = node.operationTypes) !== null && _a !== void 0 ? _a : [];
        for (const operationType of operationTypesNodes) {
            const operation = operationType.operation;
            const alreadyDefinedOperationType = definedOperationTypes[operation];
            if (existingOperationTypes[operation]) {
                context.reportError(new GraphQLError_1.GraphQLError(`Type for ${operation} already defined in the schema. It cannot be redefined.`, { nodes: operationType }));
            }
            else if (alreadyDefinedOperationType) {
                context.reportError(new GraphQLError_1.GraphQLError(`There can be only one ${operation} type in schema.`, { nodes: [alreadyDefinedOperationType, operationType] }));
            }
            else {
                definedOperationTypes[operation] = operationType;
            }
        }
        return false;
    }
}
exports.UniqueOperationTypesRule = UniqueOperationTypesRule;
//# sourceMappingURL=UniqueOperationTypesRule.js.map