"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectStr = void 0;
/**
 * Special inspect function to produce readable string literal for error messages in tests
 */
function inspectStr(str) {
    if (str == null) {
        return 'null';
    }
    return JSON.stringify(str)
        .replace(/^"|"$/g, '`')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\');
}
exports.inspectStr = inspectStr;
//# sourceMappingURL=inspectStr.js.map