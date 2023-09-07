"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOperationAST = void 0;
const kinds_1 = require("../language/kinds");
/**
 * Returns an operation AST given a document AST and optionally an operation
 * name. If a name is not provided, an operation is only returned if only one is
 * provided in the document.
 */
function getOperationAST(documentAST, operationName) {
    var _a;
    let operation = null;
    for (const definition of documentAST.definitions) {
        if (definition.kind === kinds_1.Kind.OPERATION_DEFINITION) {
            if (operationName == null) {
                // If no operation name was provided, only return an Operation if there
                // is one defined in the document. Upon encountering the second, return
                // null.
                if (operation) {
                    return null;
                }
                operation = definition;
            }
            else if (((_a = definition.name) === null || _a === void 0 ? void 0 : _a.value) === operationName) {
                return definition;
            }
        }
    }
    return operation;
}
exports.getOperationAST = getOperationAST;
//# sourceMappingURL=getOperationAST.js.map