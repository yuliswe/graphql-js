"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoUnusedFragmentsRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * No unused fragments
 *
 * A GraphQL document is only valid if all fragment definitions are spread
 * within operations, or spread within other fragments spread within operations.
 *
 * See https://spec.graphql.org/draft/#sec-Fragments-Must-Be-Used
 */
function NoUnusedFragmentsRule(context) {
    const operationDefs = [];
    const fragmentDefs = [];
    return {
        OperationDefinition(node) {
            operationDefs.push(node);
            return false;
        },
        FragmentDefinition(node) {
            fragmentDefs.push(node);
            return false;
        },
        Document: {
            leave() {
                const fragmentNameUsed = Object.create(null);
                for (const operation of operationDefs) {
                    for (const fragment of context.getRecursivelyReferencedFragments(operation)) {
                        fragmentNameUsed[fragment.name.value] = true;
                    }
                }
                for (const fragmentDef of fragmentDefs) {
                    const fragName = fragmentDef.name.value;
                    if (fragmentNameUsed[fragName] !== true) {
                        context.reportError(new GraphQLError_1.GraphQLError(`Fragment "${fragName}" is never used.`, {
                            nodes: fragmentDef,
                        }));
                    }
                }
            },
        },
    };
}
exports.NoUnusedFragmentsRule = NoUnusedFragmentsRule;
//# sourceMappingURL=NoUnusedFragmentsRule.js.map