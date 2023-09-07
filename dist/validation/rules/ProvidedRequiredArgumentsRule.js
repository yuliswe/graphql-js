"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvidedRequiredArgumentsOnDirectivesRule = exports.ProvidedRequiredArgumentsRule = void 0;
const inspect_1 = require("../../jsutils/inspect");
const keyMap_1 = require("../../jsutils/keyMap");
const GraphQLError_1 = require("../../error/GraphQLError");
const kinds_1 = require("../../language/kinds");
const printer_1 = require("../../language/printer");
const definition_1 = require("../../type/definition");
const directives_1 = require("../../type/directives");
/**
 * Provided required arguments
 *
 * A field or directive is only valid if all required (non-null without a
 * default value) field arguments have been provided.
 */
function ProvidedRequiredArgumentsRule(context) {
    return {
        // eslint-disable-next-line new-cap
        ...ProvidedRequiredArgumentsOnDirectivesRule(context),
        Field: {
            // Validate on leave to allow for deeper errors to appear first.
            leave(fieldNode) {
                var _a;
                const fieldDef = context.getFieldDef();
                if (!fieldDef) {
                    return false;
                }
                const providedArgs = new Set(
                // FIXME: https://github.com/graphql/graphql-js/issues/2203
                /* c8 ignore next */
                (_a = fieldNode.arguments) === null || _a === void 0 ? void 0 : _a.map((arg) => arg.name.value));
                for (const argDef of fieldDef.args) {
                    if (!providedArgs.has(argDef.name) && (0, definition_1.isRequiredArgument)(argDef)) {
                        const argTypeStr = (0, inspect_1.inspect)(argDef.type);
                        context.reportError(new GraphQLError_1.GraphQLError(`Field "${fieldDef.name}" argument "${argDef.name}" of type "${argTypeStr}" is required, but it was not provided.`, { nodes: fieldNode }));
                    }
                }
            },
        },
    };
}
exports.ProvidedRequiredArgumentsRule = ProvidedRequiredArgumentsRule;
/**
 * @internal
 */
function ProvidedRequiredArgumentsOnDirectivesRule(context) {
    var _a, _b;
    const requiredArgsMap = Object.create(null);
    const schema = context.getSchema();
    const definedDirectives = (_a = schema === null || schema === void 0 ? void 0 : schema.getDirectives()) !== null && _a !== void 0 ? _a : directives_1.specifiedDirectives;
    for (const directive of definedDirectives) {
        requiredArgsMap[directive.name] = (0, keyMap_1.keyMap)(directive.args.filter(definition_1.isRequiredArgument), (arg) => arg.name);
    }
    const astDefinitions = context.getDocument().definitions;
    for (const def of astDefinitions) {
        if (def.kind === kinds_1.Kind.DIRECTIVE_DEFINITION) {
            // FIXME: https://github.com/graphql/graphql-js/issues/2203
            /* c8 ignore next */
            const argNodes = (_b = def.arguments) !== null && _b !== void 0 ? _b : [];
            requiredArgsMap[def.name.value] = (0, keyMap_1.keyMap)(argNodes.filter(isRequiredArgumentNode), (arg) => arg.name.value);
        }
    }
    return {
        Directive: {
            // Validate on leave to allow for deeper errors to appear first.
            leave(directiveNode) {
                var _a;
                const directiveName = directiveNode.name.value;
                const requiredArgs = requiredArgsMap[directiveName];
                if (requiredArgs) {
                    // FIXME: https://github.com/graphql/graphql-js/issues/2203
                    /* c8 ignore next */
                    const argNodes = (_a = directiveNode.arguments) !== null && _a !== void 0 ? _a : [];
                    const argNodeMap = new Set(argNodes.map((arg) => arg.name.value));
                    for (const [argName, argDef] of Object.entries(requiredArgs)) {
                        if (!argNodeMap.has(argName)) {
                            const argType = (0, definition_1.isType)(argDef.type)
                                ? (0, inspect_1.inspect)(argDef.type)
                                : (0, printer_1.print)(argDef.type);
                            context.reportError(new GraphQLError_1.GraphQLError(`Directive "@${directiveName}" argument "${argName}" of type "${argType}" is required, but it was not provided.`, { nodes: directiveNode }));
                        }
                    }
                }
            },
        },
    };
}
exports.ProvidedRequiredArgumentsOnDirectivesRule = ProvidedRequiredArgumentsOnDirectivesRule;
function isRequiredArgumentNode(arg) {
    return arg.type.kind === kinds_1.Kind.NON_NULL_TYPE && arg.defaultValue == null;
}
//# sourceMappingURL=ProvidedRequiredArgumentsRule.js.map