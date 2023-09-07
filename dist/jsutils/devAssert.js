"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devAssert = void 0;
function devAssert(condition, message) {
    const booleanCondition = Boolean(condition);
    if (!booleanCondition) {
        throw new Error(message);
    }
}
exports.devAssert = devAssert;
//# sourceMappingURL=devAssert.js.map