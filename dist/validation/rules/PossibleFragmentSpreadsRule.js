"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PossibleFragmentSpreadsRule = void 0;
const inspect_1 = require("../../jsutils/inspect");
const GraphQLError_1 = require("../../error/GraphQLError");
const definition_1 = require("../../type/definition");
const typeComparators_1 = require("../../utilities/typeComparators");
const typeFromAST_1 = require("../../utilities/typeFromAST");
/**
 * Possible fragment spread
 *
 * A fragment spread is only valid if the type condition could ever possibly
 * be true: if there is a non-empty intersection of the possible parent types,
 * and possible types which pass the type condition.
 */
function PossibleFragmentSpreadsRule(context) {
    return {
        InlineFragment(node) {
            const fragType = context.getType();
            const parentType = context.getParentType();
            if ((0, definition_1.isCompositeType)(fragType) &&
                (0, definition_1.isCompositeType)(parentType) &&
                !(0, typeComparators_1.doTypesOverlap)(context.getSchema(), fragType, parentType)) {
                const parentTypeStr = (0, inspect_1.inspect)(parentType);
                const fragTypeStr = (0, inspect_1.inspect)(fragType);
                context.reportError(new GraphQLError_1.GraphQLError(`Fragment cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
            }
        },
        FragmentSpread(node) {
            const fragName = node.name.value;
            const fragType = getFragmentType(context, fragName);
            const parentType = context.getParentType();
            if (fragType &&
                parentType &&
                !(0, typeComparators_1.doTypesOverlap)(context.getSchema(), fragType, parentType)) {
                const parentTypeStr = (0, inspect_1.inspect)(parentType);
                const fragTypeStr = (0, inspect_1.inspect)(fragType);
                context.reportError(new GraphQLError_1.GraphQLError(`Fragment "${fragName}" cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
            }
        },
    };
}
exports.PossibleFragmentSpreadsRule = PossibleFragmentSpreadsRule;
function getFragmentType(context, name) {
    const frag = context.getFragment(name);
    if (frag) {
        const type = (0, typeFromAST_1.typeFromAST)(context.getSchema(), frag.typeCondition);
        if ((0, definition_1.isCompositeType)(type)) {
            return type;
        }
    }
}
//# sourceMappingURL=PossibleFragmentSpreadsRule.js.map