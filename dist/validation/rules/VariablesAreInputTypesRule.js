"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariablesAreInputTypesRule = void 0;
const GraphQLError_1 = require("../../error/GraphQLError");
const printer_1 = require("../../language/printer");
const definition_1 = require("../../type/definition");
const typeFromAST_1 = require("../../utilities/typeFromAST");
/**
 * Variables are input types
 *
 * A GraphQL operation is only valid if all the variables it defines are of
 * input types (scalar, enum, or input object).
 *
 * See https://spec.graphql.org/draft/#sec-Variables-Are-Input-Types
 */
function VariablesAreInputTypesRule(context) {
    return {
        VariableDefinition(node) {
            const type = (0, typeFromAST_1.typeFromAST)(context.getSchema(), node.type);
            if (type !== undefined && !(0, definition_1.isInputType)(type)) {
                const variableName = node.variable.name.value;
                const typeName = (0, printer_1.print)(node.type);
                context.reportError(new GraphQLError_1.GraphQLError(`Variable "$${variableName}" cannot be non-input type "${typeName}".`, { nodes: node.type }));
            }
        },
    };
}
exports.VariablesAreInputTypesRule = VariablesAreInputTypesRule;
//# sourceMappingURL=VariablesAreInputTypesRule.js.map