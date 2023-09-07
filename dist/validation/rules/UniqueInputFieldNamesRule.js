"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueInputFieldNamesRule = void 0;
const invariant_1 = require("../../jsutils/invariant");
const GraphQLError_1 = require("../../error/GraphQLError");
/**
 * Unique input field names
 *
 * A GraphQL input object value is only valid if all supplied fields are
 * uniquely named.
 *
 * See https://spec.graphql.org/draft/#sec-Input-Object-Field-Uniqueness
 */
function UniqueInputFieldNamesRule(context) {
    const knownNameStack = [];
    let knownNames = Object.create(null);
    return {
        ObjectValue: {
            enter() {
                knownNameStack.push(knownNames);
                knownNames = Object.create(null);
            },
            leave() {
                const prevKnownNames = knownNameStack.pop();
                (0, invariant_1.invariant)(prevKnownNames);
                knownNames = prevKnownNames;
            },
        },
        ObjectField(node) {
            const fieldName = node.name.value;
            if (knownNames[fieldName]) {
                context.reportError(new GraphQLError_1.GraphQLError(`There can be only one input field named "${fieldName}".`, { nodes: [knownNames[fieldName], node.name] }));
            }
            else {
                knownNames[fieldName] = node.name;
            }
        },
    };
}
exports.UniqueInputFieldNamesRule = UniqueInputFieldNamesRule;
//# sourceMappingURL=UniqueInputFieldNamesRule.js.map