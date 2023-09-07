"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PossibleTypeExtensionsRule = void 0;
const didYouMean_1 = require("../../jsutils/didYouMean");
const inspect_1 = require("../../jsutils/inspect");
const invariant_1 = require("../../jsutils/invariant");
const suggestionList_1 = require("../../jsutils/suggestionList");
const GraphQLError_1 = require("../../error/GraphQLError");
const kinds_1 = require("../../language/kinds");
const predicates_1 = require("../../language/predicates");
const definition_1 = require("../../type/definition");
/**
 * Possible type extension
 *
 * A type extension is only valid if the type is defined and has the same kind.
 */
function PossibleTypeExtensionsRule(context) {
    const schema = context.getSchema();
    const definedTypes = Object.create(null);
    for (const def of context.getDocument().definitions) {
        if ((0, predicates_1.isTypeDefinitionNode)(def)) {
            definedTypes[def.name.value] = def;
        }
    }
    return {
        ScalarTypeExtension: checkExtension,
        ObjectTypeExtension: checkExtension,
        InterfaceTypeExtension: checkExtension,
        UnionTypeExtension: checkExtension,
        EnumTypeExtension: checkExtension,
        InputObjectTypeExtension: checkExtension,
    };
    function checkExtension(node) {
        const typeName = node.name.value;
        const defNode = definedTypes[typeName];
        const existingType = schema === null || schema === void 0 ? void 0 : schema.getType(typeName);
        let expectedKind;
        if (defNode) {
            expectedKind = defKindToExtKind[defNode.kind];
        }
        else if (existingType) {
            expectedKind = typeToExtKind(existingType);
        }
        if (expectedKind) {
            if (expectedKind !== node.kind) {
                const kindStr = extensionKindToTypeName(node.kind);
                context.reportError(new GraphQLError_1.GraphQLError(`Cannot extend non-${kindStr} type "${typeName}".`, {
                    nodes: defNode ? [defNode, node] : node,
                }));
            }
        }
        else {
            const allTypeNames = Object.keys({
                ...definedTypes,
                ...schema === null || schema === void 0 ? void 0 : schema.getTypeMap(),
            });
            const suggestedTypes = (0, suggestionList_1.suggestionList)(typeName, allTypeNames);
            context.reportError(new GraphQLError_1.GraphQLError(`Cannot extend type "${typeName}" because it is not defined.` +
                (0, didYouMean_1.didYouMean)(suggestedTypes), { nodes: node.name }));
        }
    }
}
exports.PossibleTypeExtensionsRule = PossibleTypeExtensionsRule;
const defKindToExtKind = {
    [kinds_1.Kind.SCALAR_TYPE_DEFINITION]: kinds_1.Kind.SCALAR_TYPE_EXTENSION,
    [kinds_1.Kind.OBJECT_TYPE_DEFINITION]: kinds_1.Kind.OBJECT_TYPE_EXTENSION,
    [kinds_1.Kind.INTERFACE_TYPE_DEFINITION]: kinds_1.Kind.INTERFACE_TYPE_EXTENSION,
    [kinds_1.Kind.UNION_TYPE_DEFINITION]: kinds_1.Kind.UNION_TYPE_EXTENSION,
    [kinds_1.Kind.ENUM_TYPE_DEFINITION]: kinds_1.Kind.ENUM_TYPE_EXTENSION,
    [kinds_1.Kind.INPUT_OBJECT_TYPE_DEFINITION]: kinds_1.Kind.INPUT_OBJECT_TYPE_EXTENSION,
};
function typeToExtKind(type) {
    if ((0, definition_1.isScalarType)(type)) {
        return kinds_1.Kind.SCALAR_TYPE_EXTENSION;
    }
    if ((0, definition_1.isObjectType)(type)) {
        return kinds_1.Kind.OBJECT_TYPE_EXTENSION;
    }
    if ((0, definition_1.isInterfaceType)(type)) {
        return kinds_1.Kind.INTERFACE_TYPE_EXTENSION;
    }
    if ((0, definition_1.isUnionType)(type)) {
        return kinds_1.Kind.UNION_TYPE_EXTENSION;
    }
    if ((0, definition_1.isEnumType)(type)) {
        return kinds_1.Kind.ENUM_TYPE_EXTENSION;
    }
    if ((0, definition_1.isInputObjectType)(type)) {
        return kinds_1.Kind.INPUT_OBJECT_TYPE_EXTENSION;
    }
    /* c8 ignore next 3 */
    // Not reachable. All possible types have been considered
    (0, invariant_1.invariant)(false, 'Unexpected type: ' + (0, inspect_1.inspect)(type));
}
function extensionKindToTypeName(kind) {
    switch (kind) {
        case kinds_1.Kind.SCALAR_TYPE_EXTENSION:
            return 'scalar';
        case kinds_1.Kind.OBJECT_TYPE_EXTENSION:
            return 'object';
        case kinds_1.Kind.INTERFACE_TYPE_EXTENSION:
            return 'interface';
        case kinds_1.Kind.UNION_TYPE_EXTENSION:
            return 'union';
        case kinds_1.Kind.ENUM_TYPE_EXTENSION:
            return 'enum';
        case kinds_1.Kind.INPUT_OBJECT_TYPE_EXTENSION:
            return 'input object';
        // Not reachable. All possible types have been considered
        /* c8 ignore next */
        default:
            (0, invariant_1.invariant)(false, 'Unexpected kind: ' + (0, inspect_1.inspect)(kind));
    }
}
//# sourceMappingURL=PossibleTypeExtensionsRule.js.map