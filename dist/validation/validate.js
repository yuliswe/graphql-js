"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidSDLExtension = exports.assertValidSDL = exports.validateSDL = exports.validate = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const GraphQLError_1 = require("../error/GraphQLError");
const visitor_1 = require("../language/visitor");
const validate_1 = require("../type/validate");
const TypeInfo_1 = require("../utilities/TypeInfo");
const specifiedRules_1 = require("./specifiedRules");
const ValidationContext_1 = require("./ValidationContext");
/**
 * Implements the "Validation" section of the spec.
 *
 * Validation runs synchronously, returning an array of encountered errors, or
 * an empty array if no errors were encountered and the document is valid.
 *
 * A list of specific validation rules may be provided. If not provided, the
 * default list of rules defined by the GraphQL specification will be used.
 *
 * Each validation rules is a function which returns a visitor
 * (see the language/visitor API). Visitor methods are expected to return
 * GraphQLErrors, or Arrays of GraphQLErrors when invalid.
 *
 * Validate will stop validation after a `maxErrors` limit has been reached.
 * Attackers can send pathologically invalid queries to induce a DoS attack,
 * so by default `maxErrors` set to 100 errors.
 *
 * Optionally a custom TypeInfo instance may be provided. If not provided, one
 * will be created from the provided schema.
 */
function validate(schema, documentAST, rules = specifiedRules_1.specifiedRules, options, 
/** @deprecated will be removed in 17.0.0 */
typeInfo = new TypeInfo_1.TypeInfo(schema)) {
    var _a;
    const maxErrors = (_a = options === null || options === void 0 ? void 0 : options.maxErrors) !== null && _a !== void 0 ? _a : 100;
    (0, devAssert_1.devAssert)(documentAST, 'Must provide document.');
    // If the schema used for validation is invalid, throw an error.
    (0, validate_1.assertValidSchema)(schema);
    const abortObj = Object.freeze({});
    const errors = [];
    const context = new ValidationContext_1.ValidationContext(schema, documentAST, typeInfo, (error) => {
        if (errors.length >= maxErrors) {
            errors.push(new GraphQLError_1.GraphQLError('Too many validation errors, error limit reached. Validation aborted.'));
            // eslint-disable-next-line @typescript-eslint/no-throw-literal
            throw abortObj;
        }
        errors.push(error);
    });
    // This uses a specialized visitor which runs multiple visitors in parallel,
    // while maintaining the visitor skip and break API.
    const visitor = (0, visitor_1.visitInParallel)(rules.map((rule) => rule(context)));
    // Visit the whole document with each instance of all provided rules.
    try {
        (0, visitor_1.visit)(documentAST, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, visitor));
    }
    catch (e) {
        if (e !== abortObj) {
            throw e;
        }
    }
    return errors;
}
exports.validate = validate;
/**
 * @internal
 */
function validateSDL(documentAST, schemaToExtend, rules = specifiedRules_1.specifiedSDLRules) {
    const errors = [];
    const context = new ValidationContext_1.SDLValidationContext(documentAST, schemaToExtend, (error) => {
        errors.push(error);
    });
    const visitors = rules.map((rule) => rule(context));
    (0, visitor_1.visit)(documentAST, (0, visitor_1.visitInParallel)(visitors));
    return errors;
}
exports.validateSDL = validateSDL;
/**
 * Utility function which asserts a SDL document is valid by throwing an error
 * if it is invalid.
 *
 * @internal
 */
function assertValidSDL(documentAST) {
    const errors = validateSDL(documentAST);
    if (errors.length !== 0) {
        throw new Error(errors.map((error) => error.message).join('\n\n'));
    }
}
exports.assertValidSDL = assertValidSDL;
/**
 * Utility function which asserts a SDL document is valid by throwing an error
 * if it is invalid.
 *
 * @internal
 */
function assertValidSDLExtension(documentAST, schema) {
    const errors = validateSDL(documentAST, schema);
    if (errors.length !== 0) {
        throw new Error(errors.map((error) => error.message).join('\n\n'));
    }
}
exports.assertValidSDLExtension = assertValidSDLExtension;
//# sourceMappingURL=validate.js.map