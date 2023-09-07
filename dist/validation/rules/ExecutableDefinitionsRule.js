"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutableDefinitionsRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
const kinds_1 = require("../../language/kinds");
const predicates_1 = require("../../language/predicates");
/**
 * Executable definitions
 *
 * A GraphQL document is only valid for execution if all definitions are either
 * operation or fragment definitions.
 *
 * See https://spec.graphql.org/draft/#sec-Executable-Definitions
 */
function ExecutableDefinitionsRule(context) {
    return {
        Document(node) {
            for (const definition of node.definitions) {
                if (!(0, predicates_1.isExecutableDefinitionNode)(definition)) {
                    const defName = definition.kind === kinds_1.Kind.SCHEMA_DEFINITION ||
                        definition.kind === kinds_1.Kind.SCHEMA_EXTENSION
                        ? 'schema'
                        : '"' + definition.name.value + '"';
                    context.reportError(new GraphQLError_1.GraphQLError(`The ${defName} definition is not executable.`, {
                        nodes: definition,
                    }));
                }
            }
            return false;
        },
    };
}
exports.ExecutableDefinitionsRule = ExecutableDefinitionsRule;
//# sourceMappingURL=ExecutableDefinitionsRule.js.map