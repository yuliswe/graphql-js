"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueVariableNamesRule = void 0;
const groupBy_1 = require("../../jsutils/groupBy");
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Unique variable names
 *
 * A GraphQL operation is only valid if all its variables are uniquely named.
 */
function UniqueVariableNamesRule(context) {
    return {
        OperationDefinition(operationNode) {
            var _a;
            // See: https://github.com/graphql/graphql-js/issues/2203
            /* c8 ignore next */
            const variableDefinitions = (_a = operationNode.variableDefinitions) !== null && _a !== void 0 ? _a : [];
            const seenVariableDefinitions = (0, groupBy_1.groupBy)(variableDefinitions, (node) => node.variable.name.value);
            for (const [variableName, variableNodes] of seenVariableDefinitions) {
                if (variableNodes.length > 1) {
                    context.reportError(new GraphQLError_1.GraphQLError(`There can be only one variable named "$${variableName}".`, { nodes: variableNodes.map((node) => node.variable.name) }));
                }
            }
        },
    };
}
exports.UniqueVariableNamesRule = UniqueVariableNamesRule;
//# sourceMappingURL=UniqueVariableNamesRule.js.map