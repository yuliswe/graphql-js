"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectiveValues = exports.getArgumentValues = exports.getVariableValues = void 0;
const inspect_1 = require("../jsutils/inspect");
const keyMap_1 = require("../jsutils/keyMap");
const printPathArray_1 = require("../jsutils/printPathArray");
const GraphQLError_1 = require("../error/GraphQLError");
const kinds_1 = require("../language/kinds");
const printer_1 = require("../language/printer");
const definition_1 = require("../type/definition");
const coerceInputValue_1 = require("../utilities/coerceInputValue");
const typeFromAST_1 = require("../utilities/typeFromAST");
const valueFromAST_1 = require("../utilities/valueFromAST");
/**
 * Prepares an object map of variableValues of the correct type based on the
 * provided variable definitions and arbitrary input. If the input cannot be
 * parsed to match the variable definitions, a GraphQLError will be thrown.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 */
function getVariableValues(schema, varDefNodes, inputs, options) {
    const errors = [];
    const maxErrors = options === null || options === void 0 ? void 0 : options.maxErrors;
    try {
        const coerced = coerceVariableValues(schema, varDefNodes, inputs, (error) => {
            if (maxErrors != null && errors.length >= maxErrors) {
                throw new GraphQLError_1.GraphQLError('Too many errors processing variables, error limit reached. Execution aborted.');
            }
            errors.push(error);
        });
        if (errors.length === 0) {
            return { coerced };
        }
    }
    catch (error) {
        errors.push(error);
    }
    return { errors };
}
exports.getVariableValues = getVariableValues;
function coerceVariableValues(schema, varDefNodes, inputs, onError) {
    const coercedValues = {};
    for (const varDefNode of varDefNodes) {
        const varName = varDefNode.variable.name.value;
        const varType = (0, typeFromAST_1.typeFromAST)(schema, varDefNode.type);
        if (!(0, definition_1.isInputType)(varType)) {
            // Must use input types for variables. This should be caught during
            // validation, however is checked again here for safety.
            const varTypeStr = (0, printer_1.print)(varDefNode.type);
            onError(new GraphQLError_1.GraphQLError(`Variable "$${varName}" expected value of type "${varTypeStr}" which cannot be used as an input type.`, { nodes: varDefNode.type }));
            continue;
        }
        if (!hasOwnProperty(inputs, varName)) {
            if (varDefNode.defaultValue) {
                coercedValues[varName] = (0, valueFromAST_1.valueFromAST)(varDefNode.defaultValue, varType);
            }
            else if ((0, definition_1.isNonNullType)(varType)) {
                const varTypeStr = (0, inspect_1.inspect)(varType);
                onError(new GraphQLError_1.GraphQLError(`Variable "$${varName}" of required type "${varTypeStr}" was not provided.`, { nodes: varDefNode }));
            }
            continue;
        }
        const value = inputs[varName];
        if (value === null && (0, definition_1.isNonNullType)(varType)) {
            const varTypeStr = (0, inspect_1.inspect)(varType);
            onError(new GraphQLError_1.GraphQLError(`Variable "$${varName}" of non-null type "${varTypeStr}" must not be null.`, { nodes: varDefNode }));
            continue;
        }
        coercedValues[varName] = (0, coerceInputValue_1.coerceInputValue)(value, varType, (path, invalidValue, error) => {
            let prefix = `Variable "$${varName}" got invalid value ` + (0, inspect_1.inspect)(invalidValue);
            if (path.length > 0) {
                prefix += ` at "${varName}${(0, printPathArray_1.printPathArray)(path)}"`;
            }
            onError(new GraphQLError_1.GraphQLError(prefix + '; ' + error.message, {
                nodes: varDefNode,
                originalError: error,
            }));
        });
    }
    return coercedValues;
}
/**
 * Prepares an object map of argument values given a list of argument
 * definitions and list of argument AST nodes.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 */
function getArgumentValues(def, node, variableValues) {
    var _a;
    const coercedValues = {};
    // FIXME: https://github.com/graphql/graphql-js/issues/2203
    /* c8 ignore next */
    const argumentNodes = (_a = node.arguments) !== null && _a !== void 0 ? _a : [];
    const argNodeMap = (0, keyMap_1.keyMap)(argumentNodes, (arg) => arg.name.value);
    for (const argDef of def.args) {
        const name = argDef.name;
        const argType = argDef.type;
        const argumentNode = argNodeMap[name];
        if (!argumentNode) {
            if (argDef.defaultValue !== undefined) {
                coercedValues[name] = argDef.defaultValue;
            }
            else if ((0, definition_1.isNonNullType)(argType)) {
                throw new GraphQLError_1.GraphQLError(`Argument "${name}" of required type "${(0, inspect_1.inspect)(argType)}" ` +
                    'was not provided.', { nodes: node });
            }
            continue;
        }
        const valueNode = argumentNode.value;
        let isNull = valueNode.kind === kinds_1.Kind.NULL;
        if (valueNode.kind === kinds_1.Kind.VARIABLE) {
            const variableName = valueNode.name.value;
            if (variableValues == null ||
                !hasOwnProperty(variableValues, variableName)) {
                if (argDef.defaultValue !== undefined) {
                    coercedValues[name] = argDef.defaultValue;
                }
                else if ((0, definition_1.isNonNullType)(argType)) {
                    throw new GraphQLError_1.GraphQLError(`Argument "${name}" of required type "${(0, inspect_1.inspect)(argType)}" ` +
                        `was provided the variable "$${variableName}" which was not provided a runtime value.`, { nodes: valueNode });
                }
                continue;
            }
            isNull = variableValues[variableName] == null;
        }
        if (isNull && (0, definition_1.isNonNullType)(argType)) {
            throw new GraphQLError_1.GraphQLError(`Argument "${name}" of non-null type "${(0, inspect_1.inspect)(argType)}" ` +
                'must not be null.', { nodes: valueNode });
        }
        const coercedValue = (0, valueFromAST_1.valueFromAST)(valueNode, argType, variableValues);
        if (coercedValue === undefined) {
            // Note: ValuesOfCorrectTypeRule validation should catch this before
            // execution. This is a runtime check to ensure execution does not
            // continue with an invalid argument value.
            throw new GraphQLError_1.GraphQLError(`Argument "${name}" has invalid value ${(0, printer_1.print)(valueNode)}.`, { nodes: valueNode });
        }
        coercedValues[name] = coercedValue;
    }
    return coercedValues;
}
exports.getArgumentValues = getArgumentValues;
/**
 * Prepares an object map of argument values given a directive definition
 * and a AST node which may contain directives. Optionally also accepts a map
 * of variable values.
 *
 * If the directive does not exist on the node, returns undefined.
 *
 * Note: The returned value is a plain Object with a prototype, since it is
 * exposed to user code. Care should be taken to not pull values from the
 * Object prototype.
 */
function getDirectiveValues(directiveDef, node, variableValues) {
    var _a;
    const directiveNode = (_a = node.directives) === null || _a === void 0 ? void 0 : _a.find((directive) => directive.name.value === directiveDef.name);
    if (directiveNode) {
        return getArgumentValues(directiveDef, directiveNode, variableValues);
    }
}
exports.getDirectiveValues = getDirectiveValues;
function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
//# sourceMappingURL=values.js.map