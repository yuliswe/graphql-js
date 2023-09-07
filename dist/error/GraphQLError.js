"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatError = exports.printError = exports.GraphQLError = void 0;
const isObjectLike_1 = require("../jsutils/isObjectLike");
const location_1 = require("../language/location");
const printLocation_1 = require("../language/printLocation");
function toNormalizedOptions(args) {
    const firstArg = args[0];
    if (firstArg == null || 'kind' in firstArg || 'length' in firstArg) {
        return {
            nodes: firstArg,
            source: args[1],
            positions: args[2],
            path: args[3],
            originalError: args[4],
            extensions: args[5],
        };
    }
    return firstArg;
}
/**
 * A GraphQLError describes an Error found during the parse, validate, or
 * execute phases of performing a GraphQL operation. In addition to a message
 * and stack trace, it also includes information about the locations in a
 * GraphQL document and/or execution result that correspond to the Error.
 */
class GraphQLError extends Error {
    constructor(message, ...rawArgs) {
        var _a, _b, _c;
        const { nodes, source, positions, path, originalError, extensions } = toNormalizedOptions(rawArgs);
        super(message);
        this.name = 'GraphQLError';
        this.path = path !== null && path !== void 0 ? path : undefined;
        this.originalError = originalError !== null && originalError !== void 0 ? originalError : undefined;
        // Compute list of blame nodes.
        this.nodes = undefinedIfEmpty(Array.isArray(nodes) ? nodes : nodes ? [nodes] : undefined);
        const nodeLocations = undefinedIfEmpty((_a = this.nodes) === null || _a === void 0 ? void 0 : _a.map((node) => node.loc).filter((loc) => loc != null));
        // Compute locations in the source for the given nodes/positions.
        this.source = source !== null && source !== void 0 ? source : (_b = nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations[0]) === null || _b === void 0 ? void 0 : _b.source;
        this.positions = positions !== null && positions !== void 0 ? positions : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => loc.start);
        this.locations =
            positions && source
                ? positions.map((pos) => (0, location_1.getLocation)(source, pos))
                : nodeLocations === null || nodeLocations === void 0 ? void 0 : nodeLocations.map((loc) => (0, location_1.getLocation)(loc.source, loc.start));
        const originalExtensions = (0, isObjectLike_1.isObjectLike)(originalError === null || originalError === void 0 ? void 0 : originalError.extensions)
            ? originalError === null || originalError === void 0 ? void 0 : originalError.extensions
            : undefined;
        this.extensions = (_c = extensions !== null && extensions !== void 0 ? extensions : originalExtensions) !== null && _c !== void 0 ? _c : Object.create(null);
        // Only properties prescribed by the spec should be enumerable.
        // Keep the rest as non-enumerable.
        Object.defineProperties(this, {
            message: {
                writable: true,
                enumerable: true,
            },
            name: { enumerable: false },
            nodes: { enumerable: false },
            source: { enumerable: false },
            positions: { enumerable: false },
            originalError: { enumerable: false },
        });
        // Include (non-enumerable) stack trace.
        /* c8 ignore start */
        // FIXME: https://github.com/graphql/graphql-js/issues/2317
        if (originalError === null || originalError === void 0 ? void 0 : originalError.stack) {
            Object.defineProperty(this, 'stack', {
                value: originalError.stack,
                writable: true,
                configurable: true,
            });
        }
        else if (Error.captureStackTrace) {
            Error.captureStackTrace(this, GraphQLError);
        }
        else {
            Object.defineProperty(this, 'stack', {
                value: Error().stack,
                writable: true,
                configurable: true,
            });
        }
        /* c8 ignore stop */
    }
    get [Symbol.toStringTag]() {
        return 'GraphQLError';
    }
    toString() {
        let output = this.message;
        if (this.nodes) {
            for (const node of this.nodes) {
                if (node.loc) {
                    output += '\n\n' + (0, printLocation_1.printLocation)(node.loc);
                }
            }
        }
        else if (this.source && this.locations) {
            for (const location of this.locations) {
                output += '\n\n' + (0, printLocation_1.printSourceLocation)(this.source, location);
            }
        }
        return output;
    }
    toJSON() {
        const formattedError = {
            message: this.message,
        };
        if (this.locations != null) {
            formattedError.locations = this.locations;
        }
        if (this.path != null) {
            formattedError.path = this.path;
        }
        if (this.extensions != null && Object.keys(this.extensions).length > 0) {
            formattedError.extensions = this.extensions;
        }
        return formattedError;
    }
}
exports.GraphQLError = GraphQLError;
function undefinedIfEmpty(array) {
    return array === undefined || array.length === 0 ? undefined : array;
}
/**
 * Prints a GraphQLError to a string, representing useful location information
 * about the error's position in the source.
 *
 * @deprecated Please use `error.toString` instead. Will be removed in v17
 */
function printError(error) {
    return error.toString();
}
exports.printError = printError;
/**
 * Given a GraphQLError, format it according to the rules described by the
 * Response Format, Errors section of the GraphQL Specification.
 *
 * @deprecated Please use `error.toJSON` instead. Will be removed in v17
 */
function formatError(error) {
    return error.toJSON();
}
exports.formatError = formatError;
//# sourceMappingURL=GraphQLError.js.map