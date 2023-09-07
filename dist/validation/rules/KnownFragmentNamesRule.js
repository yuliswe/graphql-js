"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownFragmentNamesRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Known fragment names
 *
 * A GraphQL document is only valid if all `...Fragment` fragment spreads refer
 * to fragments defined in the same document.
 *
 * See https://spec.graphql.org/draft/#sec-Fragment-spread-target-defined
 */
function KnownFragmentNamesRule(context) {
    return {
        FragmentSpread(node) {
            const fragmentName = node.name.value;
            const fragment = context.getFragment(fragmentName);
            if (!fragment) {
                context.reportError(new GraphQLError_1.GraphQLError(`Unknown fragment "${fragmentName}".`, {
                    nodes: node.name,
                }));
            }
        },
    };
}
exports.KnownFragmentNamesRule = KnownFragmentNamesRule;
//# sourceMappingURL=KnownFragmentNamesRule.js.map