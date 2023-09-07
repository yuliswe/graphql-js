"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseReduce = void 0;
const isPromise_1 = require("./isPromise");
/**
 * Similar to Array.prototype.reduce(), however the reducing callback may return
 * a Promise, in which case reduction will continue after each promise resolves.
 *
 * If the callback does not return a Promise, then this function will also not
 * return a Promise.
 */
function promiseReduce(values, callbackFn, initialValue) {
    let accumulator = initialValue;
    for (const value of values) {
        accumulator = (0, isPromise_1.isPromise)(accumulator)
            ? accumulator.then((resolved) => callbackFn(resolved, value))
            : callbackFn(accumulator, value);
    }
    return accumulator;
}
exports.promiseReduce = promiseReduce;
//# sourceMappingURL=promiseReduce.js.map