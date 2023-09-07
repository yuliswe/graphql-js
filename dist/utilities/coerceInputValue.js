"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.coerceInputValue = void 0;
const didYouMean_1 = require("../jsutils/didYouMean");
const inspect_1 = require("../jsutils/inspect");
const invariant_1 = require("../jsutils/invariant");
const isIterableObject_1 = require("../jsutils/isIterableObject");
const isObjectLike_1 = require("../jsutils/isObjectLike");
const Path_1 = require("../jsutils/Path");
const printPathArray_1 = require("../jsutils/printPathArray");
const suggestionList_1 = require("../jsutils/suggestionList");
const GraphQLError_1 = require("../error/GraphQLError");
const definition_1 = require("../type/definition");
/**
 * Coerces a JavaScript value given a GraphQL Input Type.
 */
function coerceInputValue(inputValue, type, onError = defaultOnError) {
    return coerceInputValueImpl(inputValue, type, onError, undefined);
}
exports.coerceInputValue = coerceInputValue;
function defaultOnError(path, invalidValue, error) {
    let errorPrefix = 'Invalid value ' + (0, inspect_1.inspect)(invalidValue);
    if (path.length > 0) {
        errorPrefix += ` at "value${(0, printPathArray_1.printPathArray)(path)}"`;
    }
    error.message = errorPrefix + ': ' + error.message;
    throw error;
}
function coerceInputValueImpl(inputValue, type, onError, path) {
    if ((0, definition_1.isNonNullType)(type)) {
        if (inputValue != null) {
            return coerceInputValueImpl(inputValue, type.ofType, onError, path);
        }
        onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Expected non-nullable type "${(0, inspect_1.inspect)(type)}" not to be null.`));
        return;
    }
    if (inputValue == null) {
        // Explicitly return the value null.
        return null;
    }
    if ((0, definition_1.isListType)(type)) {
        const itemType = type.ofType;
        if ((0, isIterableObject_1.isIterableObject)(inputValue)) {
            return Array.from(inputValue, (itemValue, index) => {
                const itemPath = (0, Path_1.addPath)(path, index, undefined);
                return coerceInputValueImpl(itemValue, itemType, onError, itemPath);
            });
        }
        // Lists accept a non-list value as a list of one.
        return [coerceInputValueImpl(inputValue, itemType, onError, path)];
    }
    if ((0, definition_1.isInputObjectType)(type)) {
        if (!(0, isObjectLike_1.isObjectLike)(inputValue)) {
            onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Expected type "${type.name}" to be an object.`));
            return;
        }
        const coercedValue = {};
        const fieldDefs = type.getFields();
        for (const field of Object.values(fieldDefs)) {
            const fieldValue = inputValue[field.name];
            if (fieldValue === undefined) {
                if (field.defaultValue !== undefined) {
                    coercedValue[field.name] = field.defaultValue;
                }
                else if ((0, definition_1.isNonNullType)(field.type)) {
                    const typeStr = (0, inspect_1.inspect)(field.type);
                    onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Field "${field.name}" of required type "${typeStr}" was not provided.`));
                }
                continue;
            }
            coercedValue[field.name] = coerceInputValueImpl(fieldValue, field.type, onError, (0, Path_1.addPath)(path, field.name, type.name));
        }
        // Ensure every provided field is defined.
        for (const fieldName of Object.keys(inputValue)) {
            if (!fieldDefs[fieldName]) {
                const suggestions = (0, suggestionList_1.suggestionList)(fieldName, Object.keys(type.getFields()));
                onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Field "${fieldName}" is not defined by type "${type.name}".` +
                    (0, didYouMean_1.didYouMean)(suggestions)));
            }
        }
        return coercedValue;
    }
    if ((0, definition_1.isLeafType)(type)) {
        let parseResult;
        // Scalars and Enums determine if a input value is valid via parseValue(),
        // which can throw to indicate failure. If it throws, maintain a reference
        // to the original error.
        try {
            parseResult = type.parseValue(inputValue);
        }
        catch (error) {
            if (error instanceof GraphQLError_1.GraphQLError) {
                onError((0, Path_1.pathToArray)(path), inputValue, error);
            }
            else {
                onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Expected type "${type.name}". ` + error.message, {
                    originalError: error,
                }));
            }
            return;
        }
        if (parseResult === undefined) {
            onError((0, Path_1.pathToArray)(path), inputValue, new GraphQLError_1.GraphQLError(`Expected type "${type.name}".`));
        }
        return parseResult;
    }
    /* c8 ignore next 3 */
    // Not reachable, all possible types have been considered.
    (0, invariant_1.invariant)(false, 'Unexpected input type: ' + (0, inspect_1.inspect)(type));
}
//# sourceMappingURL=coerceInputValue.js.map