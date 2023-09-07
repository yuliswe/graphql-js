"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.introspectionFromSchema = void 0;
const invariant_1 = require("../jsutils/invariant");
const parser_1 = require("../language/parser");
const execute_1 = require("../execution/execute");
const getIntrospectionQuery_1 = require("./getIntrospectionQuery");
/**
 * Build an IntrospectionQuery from a GraphQLSchema
 *
 * IntrospectionQuery is useful for utilities that care about type and field
 * relationships, but do not need to traverse through those relationships.
 *
 * This is the inverse of buildClientSchema. The primary use case is outside
 * of the server context, for instance when doing schema comparisons.
 */
function introspectionFromSchema(schema, options) {
    const optionsWithDefaults = {
        specifiedByUrl: true,
        directiveIsRepeatable: true,
        schemaDescription: true,
        inputValueDeprecation: true,
        ...options,
    };
    const document = (0, parser_1.parse)((0, getIntrospectionQuery_1.getIntrospectionQuery)(optionsWithDefaults));
    const result = (0, execute_1.executeSync)({ schema, document });
    (0, invariant_1.invariant)(!result.errors && result.data);
    return result.data;
}
exports.introspectionFromSchema = introspectionFromSchema;
//# sourceMappingURL=introspectionFromSchema.js.map