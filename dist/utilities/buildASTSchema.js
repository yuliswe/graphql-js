"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSchema = exports.buildASTSchema = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const kinds_1 = require("../language/kinds");
const parser_1 = require("../language/parser");
const directives_1 = require("../type/directives");
const schema_1 = require("../type/schema");
const validate_1 = require("../validation/validate");
const extendSchema_1 = require("./extendSchema");
/**
 * This takes the ast of a schema document produced by the parse function in
 * src/language/parser.js.
 *
 * If no schema definition is provided, then it will look for types named Query,
 * Mutation and Subscription.
 *
 * Given that AST it constructs a GraphQLSchema. The resulting schema
 * has no resolve methods, so execution will use default resolvers.
 */
function buildASTSchema(documentAST, options) {
    (0, devAssert_1.devAssert)(documentAST != null && documentAST.kind === kinds_1.Kind.DOCUMENT, 'Must provide valid Document AST.');
    if ((options === null || options === void 0 ? void 0 : options.assumeValid) !== true && (options === null || options === void 0 ? void 0 : options.assumeValidSDL) !== true) {
        (0, validate_1.assertValidSDL)(documentAST);
    }
    const emptySchemaConfig = {
        description: undefined,
        types: [],
        directives: [],
        extensions: Object.create(null),
        extensionASTNodes: [],
        assumeValid: false,
    };
    const config = (0, extendSchema_1.extendSchemaImpl)(emptySchemaConfig, documentAST, options);
    if (config.astNode == null) {
        for (const type of config.types) {
            switch (type.name) {
                // Note: While this could make early assertions to get the correctly
                // typed values below, that would throw immediately while type system
                // validation with validateSchema() will produce more actionable results.
                case 'Query':
                    // @ts-expect-error validated in `validateSchema`
                    config.query = type;
                    break;
                case 'Mutation':
                    // @ts-expect-error validated in `validateSchema`
                    config.mutation = type;
                    break;
                case 'Subscription':
                    // @ts-expect-error validated in `validateSchema`
                    config.subscription = type;
                    break;
            }
        }
    }
    const directives = [
        ...config.directives,
        // If specified directives were not explicitly declared, add them.
        ...directives_1.specifiedDirectives.filter((stdDirective) => config.directives.every((directive) => directive.name !== stdDirective.name)),
    ];
    return new schema_1.GraphQLSchema({ ...config, directives });
}
exports.buildASTSchema = buildASTSchema;
/**
 * A helper function to build a GraphQLSchema directly from a source
 * document.
 */
function buildSchema(source, options) {
    const document = (0, parser_1.parse)(source, {
        noLocation: options === null || options === void 0 ? void 0 : options.noLocation,
        allowLegacyFragmentVariables: options === null || options === void 0 ? void 0 : options.allowLegacyFragmentVariables,
    });
    return buildASTSchema(document, {
        assumeValidSDL: options === null || options === void 0 ? void 0 : options.assumeValidSDL,
        assumeValid: options === null || options === void 0 ? void 0 : options.assumeValid,
    });
}
exports.buildSchema = buildSchema;
//# sourceMappingURL=buildASTSchema.js.map