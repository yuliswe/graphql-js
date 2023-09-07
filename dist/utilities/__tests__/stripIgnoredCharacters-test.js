"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const inspectStr_1 = require("../../__testUtils__/inspectStr");
const kitchenSinkQuery_1 = require("../../__testUtils__/kitchenSinkQuery");
const kitchenSinkSDL_1 = require("../../__testUtils__/kitchenSinkSDL");
const invariant_1 = require("../../jsutils/invariant");
const lexer_1 = require("../../language/lexer");
const parser_1 = require("../../language/parser");
const source_1 = require("../../language/source");
const stripIgnoredCharacters_1 = require("../stripIgnoredCharacters");
const ignoredTokens = [
    // UnicodeBOM ::
    '\uFEFF',
    // WhiteSpace ::
    '\t',
    ' ',
    // LineTerminator ::
    '\n',
    '\r',
    '\r\n',
    // Comment ::
    '# "Comment" string\n',
    // Comma ::
    ',', // ,
];
const punctuatorTokens = [
    '!',
    '$',
    '(',
    ')',
    '...',
    ':',
    '=',
    '@',
    '[',
    ']',
    '{',
    '|',
    '}',
];
const nonPunctuatorTokens = [
    'name_token',
    '1',
    '3.14',
    '"some string value"',
    '"""block\nstring\nvalue"""', // StringValue(BlockString)
];
function lexValue(str) {
    const lexer = new lexer_1.Lexer(new source_1.Source(str));
    const value = lexer.advance().value;
    (0, invariant_1.invariant)(lexer.advance().kind === '<EOF>', 'Expected EOF');
    return value;
}
function expectStripped(docString) {
    return {
        toEqual(expected) {
            const stripped = (0, stripIgnoredCharacters_1.stripIgnoredCharacters)(docString);
            (0, invariant_1.invariant)(stripped === expected, (0, dedent_1.dedent) `
          Expected stripIgnoredCharacters(${(0, inspectStr_1.inspectStr)(docString)})
            to equal ${(0, inspectStr_1.inspectStr)(expected)}
            but got  ${(0, inspectStr_1.inspectStr)(stripped)}
        `);
            const strippedTwice = (0, stripIgnoredCharacters_1.stripIgnoredCharacters)(stripped);
            (0, invariant_1.invariant)(stripped === strippedTwice, (0, dedent_1.dedent) `
          Expected stripIgnoredCharacters(${(0, inspectStr_1.inspectStr)(stripped)})
            to equal ${(0, inspectStr_1.inspectStr)(stripped)}
            but got  ${(0, inspectStr_1.inspectStr)(strippedTwice)}
        `);
        },
        toStayTheSame() {
            this.toEqual(docString);
        },
    };
}
(0, mocha_1.describe)('stripIgnoredCharacters', () => {
    (0, mocha_1.it)('strips ignored characters from GraphQL query document', () => {
        const query = (0, dedent_1.dedent) `
      query SomeQuery($foo: String!, $bar: String) {
        someField(foo: $foo, bar: $bar) {
          a
          b {
            c
            d
          }
        }
      }
    `;
        (0, chai_1.expect)((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(query)).to.equal('query SomeQuery($foo:String!$bar:String){someField(foo:$foo bar:$bar){a b{c d}}}');
    });
    (0, mocha_1.it)('accepts Source object', () => {
        (0, chai_1.expect)((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(new source_1.Source('{ a }'))).to.equal('{a}');
    });
    (0, mocha_1.it)('strips ignored characters from GraphQL SDL document', () => {
        const sdl = (0, dedent_1.dedent) `
      """
      Type description
      """
      type Foo {
        """
        Field description
        """
        bar: String
      }
    `;
        (0, chai_1.expect)((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(sdl)).to.equal('"""Type description""" type Foo{"""Field description""" bar:String}');
    });
    (0, mocha_1.it)('report document with invalid token', () => {
        let caughtError;
        try {
            (0, stripIgnoredCharacters_1.stripIgnoredCharacters)('{ foo(arg: "\n"');
        }
        catch (e) {
            caughtError = e;
        }
        (0, chai_1.expect)(String(caughtError)).to.equal((0, dedent_1.dedent) `
      Syntax Error: Unterminated string.

      GraphQL request:1:13
      1 | { foo(arg: "
        |             ^
      2 | "
    `);
    });
    (0, mocha_1.it)('strips non-parsable document', () => {
        expectStripped('{ foo(arg: "str"').toEqual('{foo(arg:"str"');
    });
    (0, mocha_1.it)('strips documents with only ignored characters', () => {
        expectStripped('\n').toEqual('');
        expectStripped(',').toEqual('');
        expectStripped(',,').toEqual('');
        expectStripped('#comment\n, \n').toEqual('');
        for (const ignored of ignoredTokens) {
            expectStripped(ignored).toEqual('');
            for (const anotherIgnored of ignoredTokens) {
                expectStripped(ignored + anotherIgnored).toEqual('');
            }
        }
        expectStripped(ignoredTokens.join('')).toEqual('');
    });
    (0, mocha_1.it)('strips leading and trailing ignored tokens', () => {
        expectStripped('\n1').toEqual('1');
        expectStripped(',1').toEqual('1');
        expectStripped(',,1').toEqual('1');
        expectStripped('#comment\n, \n1').toEqual('1');
        expectStripped('1\n').toEqual('1');
        expectStripped('1,').toEqual('1');
        expectStripped('1,,').toEqual('1');
        expectStripped('1#comment\n, \n').toEqual('1');
        for (const token of [...punctuatorTokens, ...nonPunctuatorTokens]) {
            for (const ignored of ignoredTokens) {
                expectStripped(ignored + token).toEqual(token);
                expectStripped(token + ignored).toEqual(token);
                for (const anotherIgnored of ignoredTokens) {
                    expectStripped(token + ignored + ignored).toEqual(token);
                    expectStripped(ignored + anotherIgnored + token).toEqual(token);
                }
            }
            expectStripped(ignoredTokens.join('') + token).toEqual(token);
            expectStripped(token + ignoredTokens.join('')).toEqual(token);
        }
    });
    (0, mocha_1.it)('strips ignored tokens between punctuator tokens', () => {
        expectStripped('[,)').toEqual('[)');
        expectStripped('[\r)').toEqual('[)');
        expectStripped('[\r\r)').toEqual('[)');
        expectStripped('[\r,)').toEqual('[)');
        expectStripped('[,\n)').toEqual('[)');
        for (const left of punctuatorTokens) {
            for (const right of punctuatorTokens) {
                for (const ignored of ignoredTokens) {
                    expectStripped(left + ignored + right).toEqual(left + right);
                    for (const anotherIgnored of ignoredTokens) {
                        expectStripped(left + ignored + anotherIgnored + right).toEqual(left + right);
                    }
                }
                expectStripped(left + ignoredTokens.join('') + right).toEqual(left + right);
            }
        }
    });
    (0, mocha_1.it)('strips ignored tokens between punctuator and non-punctuator tokens', () => {
        expectStripped('[,1').toEqual('[1');
        expectStripped('[\r1').toEqual('[1');
        expectStripped('[\r\r1').toEqual('[1');
        expectStripped('[\r,1').toEqual('[1');
        expectStripped('[,\n1').toEqual('[1');
        for (const nonPunctuator of nonPunctuatorTokens) {
            for (const punctuator of punctuatorTokens) {
                for (const ignored of ignoredTokens) {
                    expectStripped(punctuator + ignored + nonPunctuator).toEqual(punctuator + nonPunctuator);
                    for (const anotherIgnored of ignoredTokens) {
                        expectStripped(punctuator + ignored + anotherIgnored + nonPunctuator).toEqual(punctuator + nonPunctuator);
                    }
                }
                expectStripped(punctuator + ignoredTokens.join('') + nonPunctuator).toEqual(punctuator + nonPunctuator);
            }
        }
    });
    (0, mocha_1.it)('strips ignored tokens between non-punctuator and punctuator tokens', () => {
        expectStripped('1,[').toEqual('1[');
        expectStripped('1\r[').toEqual('1[');
        expectStripped('1\r\r[').toEqual('1[');
        expectStripped('1\r,[').toEqual('1[');
        expectStripped('1,\n[').toEqual('1[');
        for (const nonPunctuator of nonPunctuatorTokens) {
            for (const punctuator of punctuatorTokens) {
                // Special case for that is handled in the below test
                if (punctuator === '...') {
                    continue;
                }
                for (const ignored of ignoredTokens) {
                    expectStripped(nonPunctuator + ignored + punctuator).toEqual(nonPunctuator + punctuator);
                    for (const anotherIgnored of ignoredTokens) {
                        expectStripped(nonPunctuator + ignored + anotherIgnored + punctuator).toEqual(nonPunctuator + punctuator);
                    }
                }
                expectStripped(nonPunctuator + ignoredTokens.join('') + punctuator).toEqual(nonPunctuator + punctuator);
            }
        }
    });
    (0, mocha_1.it)('replace ignored tokens between non-punctuator tokens and spread with space', () => {
        expectStripped('a ...').toEqual('a ...');
        expectStripped('1 ...').toEqual('1 ...');
        expectStripped('1 ... ...').toEqual('1 ......');
        for (const nonPunctuator of nonPunctuatorTokens) {
            for (const ignored of ignoredTokens) {
                expectStripped(nonPunctuator + ignored + '...').toEqual(nonPunctuator + ' ...');
                for (const anotherIgnored of ignoredTokens) {
                    expectStripped(nonPunctuator + ignored + anotherIgnored + ' ...').toEqual(nonPunctuator + ' ...');
                }
            }
            expectStripped(nonPunctuator + ignoredTokens.join('') + '...').toEqual(nonPunctuator + ' ...');
        }
    });
    (0, mocha_1.it)('replace ignored tokens between non-punctuator tokens with space', () => {
        expectStripped('1 2').toStayTheSame();
        expectStripped('"" ""').toStayTheSame();
        expectStripped('a b').toStayTheSame();
        expectStripped('a,1').toEqual('a 1');
        expectStripped('a,,1').toEqual('a 1');
        expectStripped('a  1').toEqual('a 1');
        expectStripped('a \t 1').toEqual('a 1');
        for (const left of nonPunctuatorTokens) {
            for (const right of nonPunctuatorTokens) {
                for (const ignored of ignoredTokens) {
                    expectStripped(left + ignored + right).toEqual(left + ' ' + right);
                    for (const anotherIgnored of ignoredTokens) {
                        expectStripped(left + ignored + anotherIgnored + right).toEqual(left + ' ' + right);
                    }
                }
                expectStripped(left + ignoredTokens.join('') + right).toEqual(left + ' ' + right);
            }
        }
    });
    (0, mocha_1.it)('does not strip ignored tokens embedded in the string', () => {
        expectStripped('" "').toStayTheSame();
        expectStripped('","').toStayTheSame();
        expectStripped('",,"').toStayTheSame();
        expectStripped('",|"').toStayTheSame();
        for (const ignored of ignoredTokens) {
            expectStripped(JSON.stringify(ignored)).toStayTheSame();
            for (const anotherIgnored of ignoredTokens) {
                expectStripped(JSON.stringify(ignored + anotherIgnored)).toStayTheSame();
            }
        }
        expectStripped(JSON.stringify(ignoredTokens.join(''))).toStayTheSame();
    });
    (0, mocha_1.it)('does not strip ignored tokens embedded in the block string', () => {
        expectStripped('""","""').toStayTheSame();
        expectStripped('""",,"""').toStayTheSame();
        expectStripped('""",|"""').toStayTheSame();
        const ignoredTokensWithoutFormatting = ignoredTokens.filter((token) => !['\n', '\r', '\r\n', '\t', ' '].includes(token));
        for (const ignored of ignoredTokensWithoutFormatting) {
            expectStripped('"""|' + ignored + '|"""').toStayTheSame();
            for (const anotherIgnored of ignoredTokensWithoutFormatting) {
                expectStripped('"""|' + ignored + anotherIgnored + '|"""').toStayTheSame();
            }
        }
        expectStripped('"""|' + ignoredTokensWithoutFormatting.join('') + '|"""').toStayTheSame();
    });
    (0, mocha_1.it)('strips ignored characters inside block strings', () => {
        function expectStrippedString(blockStr) {
            const originalValue = lexValue(blockStr);
            const strippedValue = lexValue((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(blockStr));
            (0, invariant_1.invariant)(originalValue === strippedValue, (0, dedent_1.dedent) `
          Expected lexValue(stripIgnoredCharacters(${(0, inspectStr_1.inspectStr)(blockStr)}))
            to equal ${(0, inspectStr_1.inspectStr)(originalValue)}
            but got  ${(0, inspectStr_1.inspectStr)(strippedValue)}
        `);
            return expectStripped(blockStr);
        }
        expectStrippedString('""""""').toStayTheSame();
        expectStrippedString('""" """').toEqual('""""""');
        expectStrippedString('"""a"""').toStayTheSame();
        expectStrippedString('""" a"""').toEqual('""" a"""');
        expectStrippedString('""" a """').toEqual('""" a """');
        expectStrippedString('"""\n"""').toEqual('""""""');
        expectStrippedString('"""a\nb"""').toEqual('"""a\nb"""');
        expectStrippedString('"""a\rb"""').toEqual('"""a\nb"""');
        expectStrippedString('"""a\r\nb"""').toEqual('"""a\nb"""');
        expectStrippedString('"""a\r\n\nb"""').toEqual('"""a\n\nb"""');
        expectStrippedString('"""\\\n"""').toStayTheSame();
        expectStrippedString('""""\n"""').toStayTheSame();
        expectStrippedString('"""\\"""\n"""').toEqual('"""\\""""""');
        expectStrippedString('"""\na\n b"""').toStayTheSame();
        expectStrippedString('"""\n a\n b"""').toEqual('"""a\nb"""');
        expectStrippedString('"""\na\n b\nc"""').toEqual('"""a\n b\nc"""');
    });
    (0, mocha_1.it)('strips kitchen sink query but maintains the exact same AST', () => {
        const strippedQuery = (0, stripIgnoredCharacters_1.stripIgnoredCharacters)(kitchenSinkQuery_1.kitchenSinkQuery);
        (0, chai_1.expect)((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(strippedQuery)).to.equal(strippedQuery);
        const queryAST = (0, parser_1.parse)(kitchenSinkQuery_1.kitchenSinkQuery, { noLocation: true });
        const strippedAST = (0, parser_1.parse)(strippedQuery, { noLocation: true });
        (0, chai_1.expect)(strippedAST).to.deep.equal(queryAST);
    });
    (0, mocha_1.it)('strips kitchen sink SDL but maintains the exact same AST', () => {
        const strippedSDL = (0, stripIgnoredCharacters_1.stripIgnoredCharacters)(kitchenSinkSDL_1.kitchenSinkSDL);
        (0, chai_1.expect)((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(strippedSDL)).to.equal(strippedSDL);
        const sdlAST = (0, parser_1.parse)(kitchenSinkSDL_1.kitchenSinkSDL, { noLocation: true });
        const strippedAST = (0, parser_1.parse)(strippedSDL, { noLocation: true });
        (0, chai_1.expect)(strippedAST).to.deep.equal(sdlAST);
    });
});
//# sourceMappingURL=stripIgnoredCharacters-test.js.map