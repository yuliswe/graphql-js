"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = void 0;
function invariant(condition, message) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
        throw new Error(message != null ? message : 'Unexpected invariant triggered.');
    }
}
exports.invariant = invariant;
//# sourceMappingURL=invariant.js.map