"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseForObject = exports.MultipleErrors = void 0;
class MultipleErrors extends Error {
    constructor(errors) {
        super();
        this.errors = errors;
    }
    get [Symbol.toStringTag]() {
        return 'MultipleErrors';
    }
}
exports.MultipleErrors = MultipleErrors;
/**
 * This function transforms a JS object `ObjMap<Promise<T>>` into a
 * `Promise<ObjMap<T>>`
 *
 * Always waits for all promises to resolve or reject. If any of the promises in
 * the object rejects, the returned promise rejects. Rejected promises are
 * collected into an array, and included in the reason of the returned promise.
 *
 * This is akin to bluebird's `Promise.props`, but implemented only using
 * `Promise.all` so it will work with any implementation of ES6 promises.
 */
async function promiseForObject(object) {
    const maybeResolvedValues = await Promise.allSettled(Object.values(object));
    const errors = [];
    const resolvedObject = Object.create(null);
    for (const [i, key] of Object.keys(object).entries()) {
        if (maybeResolvedValues[i].status === 'rejected') {
            const reason = maybeResolvedValues[i].reason;
            if (reason instanceof MultipleErrors) {
                errors.push(...reason.errors);
            }
            else {
                errors.push(reason);
            }
        }
        else {
            resolvedObject[key] = maybeResolvedValues[i].value;
        }
    }
    if (errors.length > 0) {
        throw new MultipleErrors(errors);
    }
    return resolvedObject;
}
exports.promiseForObject = promiseForObject;
//# sourceMappingURL=promiseForObject.js.map