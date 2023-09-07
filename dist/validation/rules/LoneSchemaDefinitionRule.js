"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoneSchemaDefinitionRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Lone Schema definition
 *
 * A GraphQL document is only valid if it contains only one schema definition.
 */
function LoneSchemaDefinitionRule(context) {
    var _a, _b, _c;
    const oldSchema = context.getSchema();
    const alreadyDefined = (_c = (_b = (_a = oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.astNode) !== null && _a !== void 0 ? _a : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getQueryType()) !== null && _b !== void 0 ? _b : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getMutationType()) !== null && _c !== void 0 ? _c : oldSchema === null || oldSchema === void 0 ? void 0 : oldSchema.getSubscriptionType();
    let schemaDefinitionsCount = 0;
    return {
        SchemaDefinition(node) {
            if (alreadyDefined) {
                context.reportError(new GraphQLError_1.GraphQLError('Cannot define a new schema within a schema extension.', { nodes: node }));
                return;
            }
            if (schemaDefinitionsCount > 0) {
                context.reportError(new GraphQLError_1.GraphQLError('Must provide only one schema definition.', {
                    nodes: node,
                }));
            }
            ++schemaDefinitionsCount;
        },
    };
}
exports.LoneSchemaDefinitionRule = LoneSchemaDefinitionRule;
//# sourceMappingURL=LoneSchemaDefinitionRule.js.map