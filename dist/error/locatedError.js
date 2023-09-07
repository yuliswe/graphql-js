"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locatedError = void 0;
const toError_1 = require("../jsutils/toError");
const GraphQLError_1 = require("./GraphQLError");
/**
 * Given an arbitrary value, presumably thrown while attempting to execute a
 * GraphQL operation, produce a new GraphQLError aware of the location in the
 * document responsible for the original Error.
 */
function locatedError(rawOriginalError, nodes, path) {
    var _a;
    const originalError = (0, toError_1.toError)(rawOriginalError);
    // Note: this uses a brand-check to support GraphQL errors originating from other contexts.
    if (isLocatedGraphQLError(originalError)) {
        return originalError;
    }
    return new GraphQLError_1.GraphQLError(originalError.message, {
        nodes: (_a = originalError.nodes) !== null && _a !== void 0 ? _a : nodes,
        source: originalError.source,
        positions: originalError.positions,
        path,
        originalError,
    });
}
exports.locatedError = locatedError;
function isLocatedGraphQLError(error) {
    return Array.isArray(error.path);
}
//# sourceMappingURL=locatedError.js.map