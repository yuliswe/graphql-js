"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSourceEventStream = exports.subscribe = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const inspect_1 = require("../jsutils/inspect");
const isAsyncIterable_1 = require("../jsutils/isAsyncIterable");
const Path_1 = require("../jsutils/Path");
const GraphQLError_1 = require("../error/GraphQLError");
const locatedError_1 = require("../error/locatedError");
const collectFields_1 = require("./collectFields");
const execute_1 = require("./execute");
const mapAsyncIterator_1 = require("./mapAsyncIterator");
const values_1 = require("./values");
/**
 * Implements the "Subscribe" algorithm described in the GraphQL specification.
 *
 * Returns a Promise which resolves to either an AsyncIterator (if successful)
 * or an ExecutionResult (error). The promise will be rejected if the schema or
 * other arguments to this function are invalid, or if the resolved event stream
 * is not an async iterable.
 *
 * If the client-provided arguments to this function do not result in a
 * compliant subscription, a GraphQL Response (ExecutionResult) with
 * descriptive errors and no data will be returned.
 *
 * If the source stream could not be created due to faulty subscription
 * resolver logic or underlying systems, the promise will resolve to a single
 * ExecutionResult containing `errors` and no `data`.
 *
 * If the operation succeeded, the promise resolves to an AsyncIterator, which
 * yields a stream of ExecutionResults representing the response stream.
 *
 * Accepts either an object with named arguments, or individual arguments.
 */
async function subscribe(args) {
    // Temporary for v15 to v16 migration. Remove in v17
    (0, devAssert_1.devAssert)(arguments.length < 2, 'graphql@16 dropped long-deprecated support for positional arguments, please pass an object instead.');
    const resultOrStream = await createSourceEventStream(args);
    if (!(0, isAsyncIterable_1.isAsyncIterable)(resultOrStream)) {
        return resultOrStream;
    }
    // For each payload yielded from a subscription, map it over the normal
    // GraphQL `execute` function, with `payload` as the rootValue.
    // This implements the "MapSourceToResponseEvent" algorithm described in
    // the GraphQL specification. The `execute` function provides the
    // "ExecuteSubscriptionEvent" algorithm, as it is nearly identical to the
    // "ExecuteQuery" algorithm, for which `execute` is also used.
    const mapSourceToResponse = (payload) => (0, execute_1.execute)({
        ...args,
        rootValue: payload,
    });
    // Map every source value to a ExecutionResult value as described above.
    return (0, mapAsyncIterator_1.mapAsyncIterator)(resultOrStream, mapSourceToResponse);
}
exports.subscribe = subscribe;
function toNormalizedArgs(args) {
    const firstArg = args[0];
    if (firstArg && 'document' in firstArg) {
        return firstArg;
    }
    return {
        schema: firstArg,
        // FIXME: when underlying TS bug fixed, see https://github.com/microsoft/TypeScript/issues/31613
        document: args[1],
        rootValue: args[2],
        contextValue: args[3],
        variableValues: args[4],
        operationName: args[5],
        subscribeFieldResolver: args[6],
    };
}
async function createSourceEventStream(...rawArgs) {
    const args = toNormalizedArgs(rawArgs);
    const { schema, document, variableValues } = args;
    // If arguments are missing or incorrectly typed, this is an internal
    // developer mistake which should throw an early error.
    (0, execute_1.assertValidExecutionArguments)(schema, document, variableValues);
    // If a valid execution context cannot be created due to incorrect arguments,
    // a "Response" with only errors is returned.
    const exeContext = (0, execute_1.buildExecutionContext)(args);
    // Return early errors if execution context failed.
    if (!('schema' in exeContext)) {
        return { errors: exeContext };
    }
    try {
        const eventStream = await executeSubscription(exeContext);
        // Assert field returned an event stream, otherwise yield an error.
        if (!(0, isAsyncIterable_1.isAsyncIterable)(eventStream)) {
            throw new Error('Subscription field must return Async Iterable. ' +
                `Received: ${(0, inspect_1.inspect)(eventStream)}.`);
        }
        return eventStream;
    }
    catch (error) {
        // If it GraphQLError, report it as an ExecutionResult, containing only errors and no data.
        // Otherwise treat the error as a system-class error and re-throw it.
        if (error instanceof GraphQLError_1.GraphQLError) {
            return { errors: [error] };
        }
        throw error;
    }
}
exports.createSourceEventStream = createSourceEventStream;
async function executeSubscription(exeContext) {
    var _a;
    const { schema, fragments, operation, variableValues, rootValue } = exeContext;
    const rootType = schema.getSubscriptionType();
    if (rootType == null) {
        throw new GraphQLError_1.GraphQLError('Schema is not configured to execute subscription operation.', { nodes: operation });
    }
    const rootFields = (0, collectFields_1.collectFields)(schema, fragments, variableValues, rootType, operation.selectionSet);
    const [responseName, fieldNodes] = [...rootFields.entries()][0];
    const fieldDef = (0, execute_1.getFieldDef)(schema, rootType, fieldNodes[0]);
    if (!fieldDef) {
        const fieldName = fieldNodes[0].name.value;
        throw new GraphQLError_1.GraphQLError(`The subscription field "${fieldName}" is not defined.`, { nodes: fieldNodes });
    }
    const path = (0, Path_1.addPath)(undefined, responseName, rootType.name);
    const info = (0, execute_1.buildResolveInfo)(exeContext, fieldDef, fieldNodes, rootType, path);
    try {
        // Implements the "ResolveFieldEventStream" algorithm from GraphQL specification.
        // It differs from "ResolveFieldValue" due to providing a different `resolveFn`.
        // Build a JS object of arguments from the field.arguments AST, using the
        // variables scope to fulfill any variable references.
        const args = (0, values_1.getArgumentValues)(fieldDef, fieldNodes[0], variableValues);
        // The resolve function's optional third argument is a context value that
        // is provided to every resolve function within an execution. It is commonly
        // used to represent an authenticated user, or request-specific caches.
        const contextValue = exeContext.contextValue;
        // Call the `subscribe()` resolver or the default resolver to produce an
        // AsyncIterable yielding raw payloads.
        const resolveFn = (_a = fieldDef.subscribe) !== null && _a !== void 0 ? _a : exeContext.subscribeFieldResolver;
        const eventStream = await resolveFn(rootValue, args, contextValue, info);
        if (eventStream instanceof Error) {
            throw eventStream;
        }
        return eventStream;
    }
    catch (error) {
        throw (0, locatedError_1.locatedError)(error, fieldNodes, (0, Path_1.pathToArray)(path));
    }
}
//# sourceMappingURL=subscribe.js.map