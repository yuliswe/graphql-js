"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueFromASTUntyped = void 0;
const keyValMap_1 = require("../jsutils/keyValMap");
const kinds_1 = require("../language/kinds");
/**
 * Produces a JavaScript value given a GraphQL Value AST.
 *
 * Unlike `valueFromAST()`, no type is provided. The resulting JavaScript value
 * will reflect the provided GraphQL value AST.
 *
 * | GraphQL Value        | JavaScript Value |
 * | -------------------- | ---------------- |
 * | Input Object         | Object           |
 * | List                 | Array            |
 * | Boolean              | Boolean          |
 * | String / Enum        | String           |
 * | Int / Float          | Number           |
 * | Null                 | null             |
 *
 */
function valueFromASTUntyped(valueNode, variables) {
    switch (valueNode.kind) {
        case kinds_1.Kind.NULL:
            return null;
        case kinds_1.Kind.INT:
            return parseInt(valueNode.value, 10);
        case kinds_1.Kind.FLOAT:
            return parseFloat(valueNode.value);
        case kinds_1.Kind.STRING:
        case kinds_1.Kind.ENUM:
        case kinds_1.Kind.BOOLEAN:
            return valueNode.value;
        case kinds_1.Kind.LIST:
            return valueNode.values.map((node) => valueFromASTUntyped(node, variables));
        case kinds_1.Kind.OBJECT:
            return (0, keyValMap_1.keyValMap)(valueNode.fields, (field) => field.name.value, (field) => valueFromASTUntyped(field.value, variables));
        case kinds_1.Kind.VARIABLE:
            return variables === null || variables === void 0 ? void 0 : variables[valueNode.name.value];
    }
}
exports.valueFromASTUntyped = valueFromASTUntyped;
//# sourceMappingURL=valueFromASTUntyped.js.map