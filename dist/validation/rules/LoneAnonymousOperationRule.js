"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoneAnonymousOperationRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
const kinds_1 = require("../../language/kinds");
/**
 * Lone anonymous operation
 *
 * A GraphQL document is only valid if when it contains an anonymous operation
 * (the query short-hand) that it contains only that one operation definition.
 *
 * See https://spec.graphql.org/draft/#sec-Lone-Anonymous-Operation
 */
function LoneAnonymousOperationRule(context) {
    let operationCount = 0;
    return {
        Document(node) {
            operationCount = node.definitions.filter((definition) => definition.kind === kinds_1.Kind.OPERATION_DEFINITION).length;
        },
        OperationDefinition(node) {
            if (!node.name && operationCount > 1) {
                context.reportError(new GraphQLError_1.GraphQLError('This anonymous operation must be the only defined operation.', { nodes: node }));
            }
        },
    };
}
exports.LoneAnonymousOperationRule = LoneAnonymousOperationRule;
//# sourceMappingURL=LoneAnonymousOperationRule.js.map