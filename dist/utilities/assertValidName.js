"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidNameError = exports.assertValidName = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const GraphQLError_1 = require("../error/GraphQLError");
const assertName_1 = require("../type/assertName");
/* c8 ignore start */
/**
 * Upholds the spec rules about naming.
 * @deprecated Please use `assertName` instead. Will be removed in v17
 */
function assertValidName(name) {
    const error = isValidNameError(name);
    if (error) {
        throw error;
    }
    return name;
}
exports.assertValidName = assertValidName;
/**
 * Returns an Error if a name is invalid.
 * @deprecated Please use `assertName` instead. Will be removed in v17
 */
function isValidNameError(name) {
    (0, devAssert_1.devAssert)(typeof name === 'string', 'Expected name to be a string.');
    if (name.startsWith('__')) {
        return new GraphQLError_1.GraphQLError(`Name "${name}" must not begin with "__", which is reserved by GraphQL introspection.`);
    }
    try {
        (0, assertName_1.assertName)(name);
    }
    catch (error) {
        return error;
    }
}
exports.isValidNameError = isValidNameError;
/* c8 ignore stop */
//# sourceMappingURL=assertValidName.js.map