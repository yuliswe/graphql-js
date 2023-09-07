"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripIgnoredCharacters = void 0;
const blockString_1 = require("../language/blockString");
const lexer_1 = require("../language/lexer");
const source_1 = require("../language/source");
const tokenKind_1 = require("../language/tokenKind");
/**
 * Strips characters that are not significant to the validity or execution
 * of a GraphQL document:
 *   - UnicodeBOM
 *   - WhiteSpace
 *   - LineTerminator
 *   - Comment
 *   - Comma
 *   - BlockString indentation
 *
 * Note: It is required to have a delimiter character between neighboring
 * non-punctuator tokens and this function always uses single space as delimiter.
 *
 * It is guaranteed that both input and output documents if parsed would result
 * in the exact same AST except for nodes location.
 *
 * Warning: It is guaranteed that this function will always produce stable results.
 * However, it's not guaranteed that it will stay the same between different
 * releases due to bugfixes or changes in the GraphQL specification.
 *
 * Query example:
 *
 * ```graphql
 * query SomeQuery($foo: String!, $bar: String) {
 *   someField(foo: $foo, bar: $bar) {
 *     a
 *     b {
 *       c
 *       d
 *     }
 *   }
 * }
 * ```
 *
 * Becomes:
 *
 * ```graphql
 * query SomeQuery($foo:String!$bar:String){someField(foo:$foo bar:$bar){a b{c d}}}
 * ```
 *
 * SDL example:
 *
 * ```graphql
 * """
 * Type description
 * """
 * type Foo {
 *   """
 *   Field description
 *   """
 *   bar: String
 * }
 * ```
 *
 * Becomes:
 *
 * ```graphql
 * """Type description""" type Foo{"""Field description""" bar:String}
 * ```
 */
function stripIgnoredCharacters(source) {
    const sourceObj = (0, source_1.isSource)(source) ? source : new source_1.Source(source);
    const body = sourceObj.body;
    const lexer = new lexer_1.Lexer(sourceObj);
    let strippedBody = '';
    let wasLastAddedTokenNonPunctuator = false;
    while (lexer.advance().kind !== tokenKind_1.TokenKind.EOF) {
        const currentToken = lexer.token;
        const tokenKind = currentToken.kind;
        /**
         * Every two non-punctuator tokens should have space between them.
         * Also prevent case of non-punctuator token following by spread resulting
         * in invalid token (e.g. `1...` is invalid Float token).
         */
        const isNonPunctuator = !(0, lexer_1.isPunctuatorTokenKind)(currentToken.kind);
        if (wasLastAddedTokenNonPunctuator) {
            if (isNonPunctuator || currentToken.kind === tokenKind_1.TokenKind.SPREAD) {
                strippedBody += ' ';
            }
        }
        const tokenBody = body.slice(currentToken.start, currentToken.end);
        if (tokenKind === tokenKind_1.TokenKind.BLOCK_STRING) {
            strippedBody += (0, blockString_1.printBlockString)(currentToken.value, { minimize: true });
        }
        else {
            strippedBody += tokenBody;
        }
        wasLastAddedTokenNonPunctuator = isNonPunctuator;
    }
    return strippedBody;
}
exports.stripIgnoredCharacters = stripIgnoredCharacters;
//# sourceMappingURL=stripIgnoredCharacters.js.map