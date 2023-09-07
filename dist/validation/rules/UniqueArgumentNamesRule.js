"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueArgumentNamesRule = void 0;
const groupBy_1 = require("../../jsutils/groupBy");
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Unique argument names
 *
 * A GraphQL field or directive is only valid if all supplied arguments are
 * uniquely named.
 *
 * See https://spec.graphql.org/draft/#sec-Argument-Names
 */
function UniqueArgumentNamesRule(context) {
    return {
        Field: checkArgUniqueness,
        Directive: checkArgUniqueness,
    };
    function checkArgUniqueness(parentNode) {
        var _a;
        // FIXME: https://github.com/graphql/graphql-js/issues/2203
        /* c8 ignore next */
        const argumentNodes = (_a = parentNode.arguments) !== null && _a !== void 0 ? _a : [];
        const seenArgs = (0, groupBy_1.groupBy)(argumentNodes, (arg) => arg.name.value);
        for (const [argName, argNodes] of seenArgs) {
            if (argNodes.length > 1) {
                context.reportError(new GraphQLError_1.GraphQLError(`There can be only one argument named "${argName}".`, { nodes: argNodes.map((node) => node.name) }));
            }
        }
    }
}
exports.UniqueArgumentNamesRule = UniqueArgumentNamesRule;
//# sourceMappingURL=UniqueArgumentNamesRule.js.map