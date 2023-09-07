"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownTypeNamesRule = void 0;
const didYouMean_1 = require("../../jsutils/didYouMean");
const suggestionList_1 = require("../../jsutils/suggestionList");
const GraphQLError_1 = require("../../error/GraphQLError");
const predicates_1 = require("../../language/predicates");
const introspection_1 = require("../../type/introspection");
const scalars_1 = require("../../type/scalars");
/**
 * Known type names
 *
 * A GraphQL document is only valid if referenced types (specifically
 * variable definitions and fragment conditions) are defined by the type schema.
 *
 * See https://spec.graphql.org/draft/#sec-Fragment-Spread-Type-Existence
 */
function KnownTypeNamesRule(context) {
    const schema = context.getSchema();
    const existingTypesMap = schema ? schema.getTypeMap() : Object.create(null);
    const definedTypes = Object.create(null);
    for (const def of context.getDocument().definitions) {
        if ((0, predicates_1.isTypeDefinitionNode)(def)) {
            definedTypes[def.name.value] = true;
        }
    }
    const typeNames = [
        ...Object.keys(existingTypesMap),
        ...Object.keys(definedTypes),
    ];
    return {
        NamedType(node, _1, parent, _2, ancestors) {
            var _a;
            const typeName = node.name.value;
            if (!existingTypesMap[typeName] && !definedTypes[typeName]) {
                const definitionNode = (_a = ancestors[2]) !== null && _a !== void 0 ? _a : parent;
                const isSDL = definitionNode != null && isSDLNode(definitionNode);
                if (isSDL && standardTypeNames.includes(typeName)) {
                    return;
                }
                const suggestedTypes = (0, suggestionList_1.suggestionList)(typeName, isSDL ? standardTypeNames.concat(typeNames) : typeNames);
                context.reportError(new GraphQLError_1.GraphQLError(`Unknown type "${typeName}".` + (0, didYouMean_1.didYouMean)(suggestedTypes), { nodes: node }));
            }
        },
    };
}
exports.KnownTypeNamesRule = KnownTypeNamesRule;
const standardTypeNames = [...scalars_1.specifiedScalarTypes, ...introspection_1.introspectionTypes].map((type) => type.name);
function isSDLNode(value) {
    return ('kind' in value &&
        ((0, predicates_1.isTypeSystemDefinitionNode)(value) || (0, predicates_1.isTypeSystemExtensionNode)(value)));
}
//# sourceMappingURL=KnownTypeNamesRule.js.map