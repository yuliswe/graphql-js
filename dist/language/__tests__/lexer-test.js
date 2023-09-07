"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const inspect_1 = require("../../jsutils/inspect");
const GraphQLError_1 = require("../../error/GraphQLError");
const lexer_1 = require("../lexer");
const source_1 = require("../source");
const tokenKind_1 = require("../tokenKind");
function lexOne(str) {
    const lexer = new lexer_1.Lexer(new source_1.Source(str));
    return lexer.advance();
}
function lexSecond(str) {
    const lexer = new lexer_1.Lexer(new source_1.Source(str));
    lexer.advance();
    return lexer.advance();
}
function expectSyntaxError(text) {
    return (0, expectJSON_1.expectToThrowJSON)(() => lexSecond(text));
}
(0, mocha_1.describe)('Lexer', () => {
    (0, mocha_1.it)('ignores BOM header', () => {
        (0, chai_1.expect)(lexOne('\uFEFF foo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 2,
            end: 5,
            value: 'foo',
        });
    });
    (0, mocha_1.it)('tracks line breaks', () => {
        (0, chai_1.expect)(lexOne('foo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 0,
            end: 3,
            line: 1,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\nfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 1,
            end: 4,
            line: 2,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\rfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 1,
            end: 4,
            line: 2,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\r\nfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 2,
            end: 5,
            line: 2,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\n\rfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 2,
            end: 5,
            line: 3,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\r\r\n\nfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 4,
            end: 7,
            line: 4,
            column: 1,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\n\n\r\rfoo')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 4,
            end: 7,
            line: 5,
            column: 1,
            value: 'foo',
        });
    });
    (0, mocha_1.it)('records line and column', () => {
        (0, chai_1.expect)(lexOne('\n \r\n \r  foo\n')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 8,
            end: 11,
            line: 4,
            column: 3,
            value: 'foo',
        });
    });
    (0, mocha_1.it)('can be Object.toStringified, JSON.stringified, or jsutils.inspected', () => {
        const lexer = new lexer_1.Lexer(new source_1.Source('foo'));
        const token = lexer.advance();
        (0, chai_1.expect)(Object.prototype.toString.call(lexer)).to.equal('[object Lexer]');
        (0, chai_1.expect)(Object.prototype.toString.call(token)).to.equal('[object Token]');
        (0, chai_1.expect)(JSON.stringify(token)).to.equal('{"kind":"Name","value":"foo","line":1,"column":1}');
        (0, chai_1.expect)((0, inspect_1.inspect)(token)).to.equal('{ kind: "Name", value: "foo", line: 1, column: 1 }');
    });
    (0, mocha_1.it)('skips whitespace and comments', () => {
        (0, chai_1.expect)(lexOne(`

    foo


`)).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 6,
            end: 9,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne('\t\tfoo\t\t')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 2,
            end: 5,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne(`
    #comment
    foo#comment
`)).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 18,
            end: 21,
            value: 'foo',
        });
        (0, chai_1.expect)(lexOne(',,,foo,,,')).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 3,
            end: 6,
            value: 'foo',
        });
    });
    (0, mocha_1.it)('errors respect whitespace', () => {
        let caughtError;
        try {
            lexOne(['', '', ' ~', ''].join('\n'));
        }
        catch (error) {
            caughtError = error;
        }
        (0, chai_1.expect)(String(caughtError)).to.equal((0, dedent_1.dedent) `
      Syntax Error: Unexpected character: "~".

      GraphQL request:3:2
      2 |
      3 |  ~
        |  ^
      4 |
    `);
    });
    (0, mocha_1.it)('updates line numbers in error for file context', () => {
        let caughtError;
        try {
            const str = ['', '', '     ~', ''].join('\n');
            const source = new source_1.Source(str, 'foo.js', { line: 11, column: 12 });
            new lexer_1.Lexer(source).advance();
        }
        catch (error) {
            caughtError = error;
        }
        (0, chai_1.expect)(String(caughtError)).to.equal((0, dedent_1.dedent) `
      Syntax Error: Unexpected character: "~".

      foo.js:13:6
      12 |
      13 |      ~
         |      ^
      14 |
    `);
    });
    (0, mocha_1.it)('updates column numbers in error for file context', () => {
        let caughtError;
        try {
            const source = new source_1.Source('~', 'foo.js', { line: 1, column: 5 });
            new lexer_1.Lexer(source).advance();
        }
        catch (error) {
            caughtError = error;
        }
        (0, chai_1.expect)(String(caughtError)).to.equal((0, dedent_1.dedent) `
      Syntax Error: Unexpected character: "~".

      foo.js:1:5
      1 |     ~
        |     ^
    `);
    });
    (0, mocha_1.it)('lexes strings', () => {
        (0, chai_1.expect)(lexOne('""')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 2,
            value: '',
        });
        (0, chai_1.expect)(lexOne('"simple"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 8,
            value: 'simple',
        });
        (0, chai_1.expect)(lexOne('" white space "')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 15,
            value: ' white space ',
        });
        (0, chai_1.expect)(lexOne('"quote \\""')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 10,
            value: 'quote "',
        });
        (0, chai_1.expect)(lexOne('"escaped \\n\\r\\b\\t\\f"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 20,
            value: 'escaped \n\r\b\t\f',
        });
        (0, chai_1.expect)(lexOne('"slashes \\\\ \\/"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 15,
            value: 'slashes \\ /',
        });
        (0, chai_1.expect)(lexOne('"unescaped unicode outside BMP \u{1f600}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 34,
            value: 'unescaped unicode outside BMP \u{1f600}',
        });
        (0, chai_1.expect)(lexOne('"unescaped maximal unicode outside BMP \u{10ffff}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 42,
            value: 'unescaped maximal unicode outside BMP \u{10ffff}',
        });
        (0, chai_1.expect)(lexOne('"unicode \\u1234\\u5678\\u90AB\\uCDEF"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 34,
            value: 'unicode \u1234\u5678\u90AB\uCDEF',
        });
        (0, chai_1.expect)(lexOne('"unicode \\u{1234}\\u{5678}\\u{90AB}\\u{CDEF}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 42,
            value: 'unicode \u1234\u5678\u90AB\uCDEF',
        });
        (0, chai_1.expect)(lexOne('"string with unicode escape outside BMP \\u{1F600}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 50,
            value: 'string with unicode escape outside BMP \u{1f600}',
        });
        (0, chai_1.expect)(lexOne('"string with minimal unicode escape \\u{0}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 42,
            value: 'string with minimal unicode escape \u{0}',
        });
        (0, chai_1.expect)(lexOne('"string with maximal unicode escape \\u{10FFFF}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 47,
            value: 'string with maximal unicode escape \u{10FFFF}',
        });
        (0, chai_1.expect)(lexOne('"string with maximal minimal unicode escape \\u{00000000}"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 57,
            value: 'string with maximal minimal unicode escape \u{0}',
        });
        (0, chai_1.expect)(lexOne('"string with unicode surrogate pair escape \\uD83D\\uDE00"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 56,
            value: 'string with unicode surrogate pair escape \u{1f600}',
        });
        (0, chai_1.expect)(lexOne('"string with minimal surrogate pair escape \\uD800\\uDC00"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 56,
            value: 'string with minimal surrogate pair escape \u{10000}',
        });
        (0, chai_1.expect)(lexOne('"string with maximal surrogate pair escape \\uDBFF\\uDFFF"')).to.contain({
            kind: tokenKind_1.TokenKind.STRING,
            start: 0,
            end: 56,
            value: 'string with maximal surrogate pair escape \u{10FFFF}',
        });
    });
    (0, mocha_1.it)('lex reports useful string errors', () => {
        expectSyntaxError('"').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('"""').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 4 }],
        });
        expectSyntaxError('""""').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 5 }],
        });
        expectSyntaxError('"no end quote').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 14 }],
        });
        expectSyntaxError("'single quotes'").to.deep.equal({
            message: 'Syntax Error: Unexpected single quote character (\'), did you mean to use a double quote (")?',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('"bad surrogate \uDEAD"').to.deep.equal({
            message: 'Syntax Error: Invalid character within String: U+DEAD.',
            locations: [{ line: 1, column: 16 }],
        });
        expectSyntaxError('"bad high surrogate pair \uDEAD\uDEAD"').to.deep.equal({
            message: 'Syntax Error: Invalid character within String: U+DEAD.',
            locations: [{ line: 1, column: 26 }],
        });
        expectSyntaxError('"bad low surrogate pair \uD800\uD800"').to.deep.equal({
            message: 'Syntax Error: Invalid character within String: U+D800.',
            locations: [{ line: 1, column: 25 }],
        });
        expectSyntaxError('"multi\nline"').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 7 }],
        });
        expectSyntaxError('"multi\rline"').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 7 }],
        });
        expectSyntaxError('"bad \\z esc"').to.deep.equal({
            message: 'Syntax Error: Invalid character escape sequence: "\\z".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\x esc"').to.deep.equal({
            message: 'Syntax Error: Invalid character escape sequence: "\\x".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u1 esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u1 es".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u0XX1 esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u0XX1".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\uXXXX esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uXXXX".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\uFXXX esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uFXXX".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\uXXXF esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uXXXF".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u{} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{}".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u{FXXX} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{FX".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u{FFFF esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{FFFF ".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"bad \\u{FFFF"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{FFFF"".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('"too high \\u{110000} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{110000}".',
            locations: [{ line: 1, column: 11 }],
        });
        expectSyntaxError('"way too high \\u{12345678} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{12345678}".',
            locations: [{ line: 1, column: 15 }],
        });
        expectSyntaxError('"too long \\u{000000000} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{000000000".',
            locations: [{ line: 1, column: 11 }],
        });
        expectSyntaxError('"bad surrogate \\uDEAD esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uDEAD".',
            locations: [{ line: 1, column: 16 }],
        });
        expectSyntaxError('"bad surrogate \\u{DEAD} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{DEAD}".',
            locations: [{ line: 1, column: 16 }],
        });
        expectSyntaxError('"cannot use braces for surrogate pair \\u{D83D}\\u{DE00} esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\u{D83D}".',
            locations: [{ line: 1, column: 39 }],
        });
        expectSyntaxError('"bad high surrogate pair \\uDEAD\\uDEAD esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uDEAD".',
            locations: [{ line: 1, column: 26 }],
        });
        expectSyntaxError('"bad low surrogate pair \\uD800\\uD800 esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uD800".',
            locations: [{ line: 1, column: 25 }],
        });
        expectSyntaxError('"cannot escape half a pair \uD83D\\uDE00 esc"').to.deep.equal({
            message: 'Syntax Error: Invalid character within String: U+D83D.',
            locations: [{ line: 1, column: 28 }],
        });
        expectSyntaxError('"cannot escape half a pair \\uD83D\uDE00 esc"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uD83D".',
            locations: [{ line: 1, column: 28 }],
        });
        expectSyntaxError('"bad \\uD83D\\not an escape"').to.deep.equal({
            message: 'Syntax Error: Invalid Unicode escape sequence: "\\uD83D".',
            locations: [{ line: 1, column: 6 }],
        });
    });
    (0, mocha_1.it)('lexes block strings', () => {
        (0, chai_1.expect)(lexOne('""""""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 6,
            line: 1,
            column: 1,
            value: '',
        });
        (0, chai_1.expect)(lexOne('"""simple"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 12,
            line: 1,
            column: 1,
            value: 'simple',
        });
        (0, chai_1.expect)(lexOne('""" white space """')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 19,
            line: 1,
            column: 1,
            value: ' white space ',
        });
        (0, chai_1.expect)(lexOne('"""contains " quote"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 22,
            line: 1,
            column: 1,
            value: 'contains " quote',
        });
        (0, chai_1.expect)(lexOne('"""contains \\""" triple quote"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 32,
            line: 1,
            column: 1,
            value: 'contains """ triple quote',
        });
        (0, chai_1.expect)(lexOne('"""multi\nline"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 16,
            line: 1,
            column: 1,
            value: 'multi\nline',
        });
        (0, chai_1.expect)(lexOne('"""multi\rline\r\nnormalized"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 28,
            line: 1,
            column: 1,
            value: 'multi\nline\nnormalized',
        });
        (0, chai_1.expect)(lexOne('"""unescaped \\n\\r\\b\\t\\f\\u1234"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 32,
            line: 1,
            column: 1,
            value: 'unescaped \\n\\r\\b\\t\\f\\u1234',
        });
        (0, chai_1.expect)(lexOne('"""unescaped unicode outside BMP \u{1f600}"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 38,
            line: 1,
            column: 1,
            value: 'unescaped unicode outside BMP \u{1f600}',
        });
        (0, chai_1.expect)(lexOne('"""slashes \\\\ \\/"""')).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 19,
            line: 1,
            column: 1,
            value: 'slashes \\\\ \\/',
        });
        (0, chai_1.expect)(lexOne(`"""

        spans
          multiple
            lines

        """`)).to.contain({
            kind: tokenKind_1.TokenKind.BLOCK_STRING,
            start: 0,
            end: 68,
            line: 1,
            column: 1,
            value: 'spans\n  multiple\n    lines',
        });
    });
    (0, mocha_1.it)('advance line after lexing multiline block string', () => {
        (0, chai_1.expect)(lexSecond(`"""

        spans
          multiple
            lines

        \n """ second_token`)).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 71,
            end: 83,
            line: 8,
            column: 6,
            value: 'second_token',
        });
        (0, chai_1.expect)(lexSecond([
            '""" \n',
            'spans \r\n',
            'multiple \n\r',
            'lines \n\n',
            '"""\n second_token',
        ].join(''))).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 37,
            end: 49,
            line: 8,
            column: 2,
            value: 'second_token',
        });
    });
    (0, mocha_1.it)('lex reports useful block string errors', () => {
        expectSyntaxError('"""').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 4 }],
        });
        expectSyntaxError('"""no end quote').to.deep.equal({
            message: 'Syntax Error: Unterminated string.',
            locations: [{ line: 1, column: 16 }],
        });
        expectSyntaxError('"""contains invalid surrogate \uDEAD"""').to.deep.equal({
            message: 'Syntax Error: Invalid character within String: U+DEAD.',
            locations: [{ line: 1, column: 31 }],
        });
    });
    (0, mocha_1.it)('lexes numbers', () => {
        (0, chai_1.expect)(lexOne('4')).to.contain({
            kind: tokenKind_1.TokenKind.INT,
            start: 0,
            end: 1,
            value: '4',
        });
        (0, chai_1.expect)(lexOne('4.123')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 5,
            value: '4.123',
        });
        (0, chai_1.expect)(lexOne('-4')).to.contain({
            kind: tokenKind_1.TokenKind.INT,
            start: 0,
            end: 2,
            value: '-4',
        });
        (0, chai_1.expect)(lexOne('9')).to.contain({
            kind: tokenKind_1.TokenKind.INT,
            start: 0,
            end: 1,
            value: '9',
        });
        (0, chai_1.expect)(lexOne('0')).to.contain({
            kind: tokenKind_1.TokenKind.INT,
            start: 0,
            end: 1,
            value: '0',
        });
        (0, chai_1.expect)(lexOne('-4.123')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 6,
            value: '-4.123',
        });
        (0, chai_1.expect)(lexOne('0.123')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 5,
            value: '0.123',
        });
        (0, chai_1.expect)(lexOne('123e4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 5,
            value: '123e4',
        });
        (0, chai_1.expect)(lexOne('123E4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 5,
            value: '123E4',
        });
        (0, chai_1.expect)(lexOne('123e-4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 6,
            value: '123e-4',
        });
        (0, chai_1.expect)(lexOne('123e+4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 6,
            value: '123e+4',
        });
        (0, chai_1.expect)(lexOne('-1.123e4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 8,
            value: '-1.123e4',
        });
        (0, chai_1.expect)(lexOne('-1.123E4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 8,
            value: '-1.123E4',
        });
        (0, chai_1.expect)(lexOne('-1.123e-4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 9,
            value: '-1.123e-4',
        });
        (0, chai_1.expect)(lexOne('-1.123e+4')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 9,
            value: '-1.123e+4',
        });
        (0, chai_1.expect)(lexOne('-1.123e4567')).to.contain({
            kind: tokenKind_1.TokenKind.FLOAT,
            start: 0,
            end: 11,
            value: '-1.123e4567',
        });
    });
    (0, mocha_1.it)('lex reports useful number errors', () => {
        expectSyntaxError('00').to.deep.equal({
            message: 'Syntax Error: Invalid number, unexpected digit after 0: "0".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('01').to.deep.equal({
            message: 'Syntax Error: Invalid number, unexpected digit after 0: "1".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('01.23').to.deep.equal({
            message: 'Syntax Error: Invalid number, unexpected digit after 0: "1".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('+1').to.deep.equal({
            message: 'Syntax Error: Unexpected character: "+".',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('1.').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: <EOF>.',
            locations: [{ line: 1, column: 3 }],
        });
        expectSyntaxError('1e').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: <EOF>.',
            locations: [{ line: 1, column: 3 }],
        });
        expectSyntaxError('1E').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: <EOF>.',
            locations: [{ line: 1, column: 3 }],
        });
        expectSyntaxError('1.e1').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "e".',
            locations: [{ line: 1, column: 3 }],
        });
        expectSyntaxError('.123').to.deep.equal({
            message: 'Syntax Error: Unexpected character: ".".',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('1.A').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "A".',
            locations: [{ line: 1, column: 3 }],
        });
        expectSyntaxError('-A').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "A".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('1.0e').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: <EOF>.',
            locations: [{ line: 1, column: 5 }],
        });
        expectSyntaxError('1.0eA').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "A".',
            locations: [{ line: 1, column: 5 }],
        });
        expectSyntaxError('1.0e"').to.deep.equal({
            message: "Syntax Error: Invalid number, expected digit but got: '\"'.",
            locations: [{ line: 1, column: 5 }],
        });
        expectSyntaxError('1.2e3e').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "e".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('1.2e3.4').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: ".".',
            locations: [{ line: 1, column: 6 }],
        });
        expectSyntaxError('1.23.4').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: ".".',
            locations: [{ line: 1, column: 5 }],
        });
    });
    (0, mocha_1.it)('lex does not allow name-start after a number', () => {
        expectSyntaxError('0xF1').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "x".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('0b10').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "b".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('123abc').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "a".',
            locations: [{ line: 1, column: 4 }],
        });
        expectSyntaxError('1_234').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "_".',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('1\u00DF').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+00DF.',
            locations: [{ line: 1, column: 2 }],
        });
        expectSyntaxError('1.23f').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "f".',
            locations: [{ line: 1, column: 5 }],
        });
        expectSyntaxError('1.234_5').to.deep.equal({
            message: 'Syntax Error: Invalid number, expected digit but got: "_".',
            locations: [{ line: 1, column: 6 }],
        });
    });
    (0, mocha_1.it)('lexes punctuation', () => {
        (0, chai_1.expect)(lexOne('!')).to.contain({
            kind: tokenKind_1.TokenKind.BANG,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('$')).to.contain({
            kind: tokenKind_1.TokenKind.DOLLAR,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('(')).to.contain({
            kind: tokenKind_1.TokenKind.PAREN_L,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne(')')).to.contain({
            kind: tokenKind_1.TokenKind.PAREN_R,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('...')).to.contain({
            kind: tokenKind_1.TokenKind.SPREAD,
            start: 0,
            end: 3,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne(':')).to.contain({
            kind: tokenKind_1.TokenKind.COLON,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('=')).to.contain({
            kind: tokenKind_1.TokenKind.EQUALS,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('@')).to.contain({
            kind: tokenKind_1.TokenKind.AT,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('[')).to.contain({
            kind: tokenKind_1.TokenKind.BRACKET_L,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne(']')).to.contain({
            kind: tokenKind_1.TokenKind.BRACKET_R,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('{')).to.contain({
            kind: tokenKind_1.TokenKind.BRACE_L,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('|')).to.contain({
            kind: tokenKind_1.TokenKind.PIPE,
            start: 0,
            end: 1,
            value: undefined,
        });
        (0, chai_1.expect)(lexOne('}')).to.contain({
            kind: tokenKind_1.TokenKind.BRACE_R,
            start: 0,
            end: 1,
            value: undefined,
        });
    });
    (0, mocha_1.it)('lex reports useful unknown character error', () => {
        expectSyntaxError('..').to.deep.equal({
            message: 'Syntax Error: Unexpected character: ".".',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('~').to.deep.equal({
            message: 'Syntax Error: Unexpected character: "~".',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\x00').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+0000.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\b').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+0008.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\u00AA').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+00AA.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\u0AAA').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+0AAA.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\u203B').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+203B.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\u{1f600}').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+1F600.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\uD83D\uDE00').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+1F600.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\uD800\uDC00').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+10000.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\uDBFF\uDFFF').to.deep.equal({
            message: 'Syntax Error: Unexpected character: U+10FFFF.',
            locations: [{ line: 1, column: 1 }],
        });
        expectSyntaxError('\uDEAD').to.deep.equal({
            message: 'Syntax Error: Invalid character: U+DEAD.',
            locations: [{ line: 1, column: 1 }],
        });
    });
    (0, mocha_1.it)('lex reports useful information for dashes in names', () => {
        const source = new source_1.Source('a-b');
        const lexer = new lexer_1.Lexer(source);
        const firstToken = lexer.advance();
        (0, chai_1.expect)(firstToken).to.contain({
            kind: tokenKind_1.TokenKind.NAME,
            start: 0,
            end: 1,
            value: 'a',
        });
        (0, chai_1.expect)(() => lexer.advance())
            .throw(GraphQLError_1.GraphQLError)
            .that.deep.include({
            message: 'Syntax Error: Invalid number, expected digit but got: "b".',
            locations: [{ line: 1, column: 3 }],
        });
    });
    (0, mocha_1.it)('produces double linked list of tokens, including comments', () => {
        const source = new source_1.Source(`
      {
        #comment
        field
      }
    `);
        const lexer = new lexer_1.Lexer(source);
        const startToken = lexer.token;
        let endToken;
        do {
            endToken = lexer.advance();
            // Lexer advances over ignored comment tokens to make writing parsers
            // easier, but will include them in the linked list result.
            (0, chai_1.expect)(endToken.kind).to.not.equal(tokenKind_1.TokenKind.COMMENT);
        } while (endToken.kind !== tokenKind_1.TokenKind.EOF);
        (0, chai_1.expect)(startToken.prev).to.equal(null);
        (0, chai_1.expect)(endToken.next).to.equal(null);
        const tokens = [];
        for (let tok = startToken; tok; tok = tok.next) {
            if (tokens.length) {
                // Tokens are double-linked, prev should point to last seen token.
                (0, chai_1.expect)(tok.prev).to.equal(tokens[tokens.length - 1]);
            }
            tokens.push(tok);
        }
        (0, chai_1.expect)(tokens.map((tok) => tok.kind)).to.deep.equal([
            tokenKind_1.TokenKind.SOF,
            tokenKind_1.TokenKind.BRACE_L,
            tokenKind_1.TokenKind.COMMENT,
            tokenKind_1.TokenKind.NAME,
            tokenKind_1.TokenKind.BRACE_R,
            tokenKind_1.TokenKind.EOF,
        ]);
    });
    (0, mocha_1.it)('lexes comments', () => {
        (0, chai_1.expect)(lexOne('# Comment').prev).to.contain({
            kind: tokenKind_1.TokenKind.COMMENT,
            start: 0,
            end: 9,
            value: ' Comment',
        });
        (0, chai_1.expect)(lexOne('# Comment\nAnother line').prev).to.contain({
            kind: tokenKind_1.TokenKind.COMMENT,
            start: 0,
            end: 9,
            value: ' Comment',
        });
        (0, chai_1.expect)(lexOne('# Comment\r\nAnother line').prev).to.contain({
            kind: tokenKind_1.TokenKind.COMMENT,
            start: 0,
            end: 9,
            value: ' Comment',
        });
        (0, chai_1.expect)(lexOne('# Comment \u{1f600}').prev).to.contain({
            kind: tokenKind_1.TokenKind.COMMENT,
            start: 0,
            end: 12,
            value: ' Comment \u{1f600}',
        });
        expectSyntaxError('# Invalid surrogate \uDEAD').to.deep.equal({
            message: 'Syntax Error: Invalid character: U+DEAD.',
            locations: [{ line: 1, column: 21 }],
        });
    });
});
(0, mocha_1.describe)('isPunctuatorTokenKind', () => {
    function isPunctuatorToken(text) {
        return (0, lexer_1.isPunctuatorTokenKind)(lexOne(text).kind);
    }
    (0, mocha_1.it)('returns true for punctuator tokens', () => {
        (0, chai_1.expect)(isPunctuatorToken('!')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('$')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('&')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('(')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken(')')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('...')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken(':')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('=')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('@')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('[')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken(']')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('{')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('|')).to.equal(true);
        (0, chai_1.expect)(isPunctuatorToken('}')).to.equal(true);
    });
    (0, mocha_1.it)('returns false for non-punctuator tokens', () => {
        (0, chai_1.expect)(isPunctuatorToken('')).to.equal(false);
        (0, chai_1.expect)(isPunctuatorToken('name')).to.equal(false);
        (0, chai_1.expect)(isPunctuatorToken('1')).to.equal(false);
        (0, chai_1.expect)(isPunctuatorToken('3.14')).to.equal(false);
        (0, chai_1.expect)(isPunctuatorToken('"str"')).to.equal(false);
        (0, chai_1.expect)(isPunctuatorToken('"""str"""')).to.equal(false);
    });
});
//# sourceMappingURL=lexer-test.js.map