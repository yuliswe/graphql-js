"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDeprecatedCustomRule = void 0;
const invariant_1 = require("../../../jsutils/invariant");
const GraphQLError_1 = require("../../../error/GraphQLError");
const definition_1 = require("../../../type/definition");
/**
 * No deprecated
 *
 * A GraphQL document is only valid if all selected fields and all used enum values have not been
 * deprecated.
 *
 * Note: This rule is optional and is not part of the Validation section of the GraphQL
 * Specification. The main purpose of this rule is detection of deprecated usages and not
 * necessarily to forbid their use when querying a service.
 */
function NoDeprecatedCustomRule(context) {
    return {
        Field(node) {
            const fieldDef = context.getFieldDef();
            const deprecationReason = fieldDef === null || fieldDef === void 0 ? void 0 : fieldDef.deprecationReason;
            if (fieldDef && deprecationReason != null) {
                const parentType = context.getParentType();
                (0, invariant_1.invariant)(parentType != null);
                context.reportError(new GraphQLError_1.GraphQLError(`The field ${parentType.name}.${fieldDef.name} is deprecated. ${deprecationReason}`, { nodes: node }));
            }
        },
        Argument(node) {
            const argDef = context.getArgument();
            const deprecationReason = argDef === null || argDef === void 0 ? void 0 : argDef.deprecationReason;
            if (argDef && deprecationReason != null) {
                const directiveDef = context.getDirective();
                if (directiveDef != null) {
                    context.reportError(new GraphQLError_1.GraphQLError(`Directive "@${directiveDef.name}" argument "${argDef.name}" is deprecated. ${deprecationReason}`, { nodes: node }));
                }
                else {
                    const parentType = context.getParentType();
                    const fieldDef = context.getFieldDef();
                    (0, invariant_1.invariant)(parentType != null && fieldDef != null);
                    context.reportError(new GraphQLError_1.GraphQLError(`Field "${parentType.name}.${fieldDef.name}" argument "${argDef.name}" is deprecated. ${deprecationReason}`, { nodes: node }));
                }
            }
        },
        ObjectField(node) {
            const inputObjectDef = (0, definition_1.getNamedType)(context.getParentInputType());
            if ((0, definition_1.isInputObjectType)(inputObjectDef)) {
                const inputFieldDef = inputObjectDef.getFields()[node.name.value];
                const deprecationReason = inputFieldDef === null || inputFieldDef === void 0 ? void 0 : inputFieldDef.deprecationReason;
                if (deprecationReason != null) {
                    context.reportError(new GraphQLError_1.GraphQLError(`The input field ${inputObjectDef.name}.${inputFieldDef.name} is deprecated. ${deprecationReason}`, { nodes: node }));
                }
            }
        },
        EnumValue(node) {
            const enumValueDef = context.getEnumValue();
            const deprecationReason = enumValueDef === null || enumValueDef === void 0 ? void 0 : enumValueDef.deprecationReason;
            if (enumValueDef && deprecationReason != null) {
                const enumTypeDef = (0, definition_1.getNamedType)(context.getInputType());
                (0, invariant_1.invariant)(enumTypeDef != null);
                context.reportError(new GraphQLError_1.GraphQLError(`The enum value "${enumTypeDef.name}.${enumValueDef.name}" is deprecated. ${deprecationReason}`, { nodes: node }));
            }
        },
    };
}
exports.NoDeprecatedCustomRule = NoDeprecatedCustomRule;
//# sourceMappingURL=NoDeprecatedCustomRule.js.map