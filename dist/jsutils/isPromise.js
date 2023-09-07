"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
/**
 * Returns true if the value acts like a Promise, i.e. has a "then" function,
 * otherwise returns false.
 */
function isPromise(value) {
    return typeof (value === null || value === void 0 ? void 0 : value.then) === 'function';
}
exports.isPromise = isPromise;
//# sourceMappingURL=isPromise.js.map