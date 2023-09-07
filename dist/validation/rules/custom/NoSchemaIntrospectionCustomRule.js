"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSchemaIntrospectionCustomRule = void 0;
const GraphQLError_1 = require("../../../error/GraphQLError");
const definition_1 = require("../../../type/definition");
const introspection_1 = require("../../../type/introspection");
/**
 * Prohibit introspection queries
 *
 * A GraphQL document is only valid if all fields selected are not fields that
 * return an introspection type.
 *
 * Note: This rule is optional and is not part of the Validation section of the
 * GraphQL Specification. This rule effectively disables introspection, which
 * does not reflect best practices and should only be done if absolutely necessary.
 */
function NoSchemaIntrospectionCustomRule(context) {
    return {
        Field(node) {
            const type = (0, definition_1.getNamedType)(context.getType());
            if (type && (0, introspection_1.isIntrospectionType)(type)) {
                context.reportError(new GraphQLError_1.GraphQLError(`GraphQL introspection has been disabled, but the requested query contained the field "${node.name.value}".`, { nodes: node }));
            }
        },
    };
}
exports.NoSchemaIntrospectionCustomRule = NoSchemaIntrospectionCustomRule;
//# sourceMappingURL=NoSchemaIntrospectionCustomRule.js.map