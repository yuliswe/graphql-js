"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const blockString_1 = require("../blockString");
function joinLines(...args) {
    return args.join('\n');
}
(0, mocha_1.describe)('dedentBlockStringLines', () => {
    function expectDedent(lines) {
        return (0, chai_1.expect)((0, blockString_1.dedentBlockStringLines)(lines));
    }
    (0, mocha_1.it)('handles empty string', () => {
        expectDedent(['']).to.deep.equal([]);
    });
    (0, mocha_1.it)('does not dedent first line', () => {
        expectDedent(['  a']).to.deep.equal(['  a']);
        expectDedent([' a', '  b']).to.deep.equal([' a', 'b']);
    });
    (0, mocha_1.it)('removes minimal indentation length', () => {
        expectDedent(['', ' a', '  b']).to.deep.equal(['a', ' b']);
        expectDedent(['', '  a', ' b']).to.deep.equal([' a', 'b']);
        expectDedent(['', '  a', ' b', 'c']).to.deep.equal(['  a', ' b', 'c']);
    });
    (0, mocha_1.it)('dedent both tab and space as single character', () => {
        expectDedent(['', '\ta', '          b']).to.deep.equal(['a', '         b']);
        expectDedent(['', '\t a', '          b']).to.deep.equal(['a', '        b']);
        expectDedent(['', ' \t a', '          b']).to.deep.equal(['a', '       b']);
    });
    (0, mocha_1.it)('dedent do not take empty lines into account', () => {
        expectDedent(['a', '', ' b']).to.deep.equal(['a', '', 'b']);
        expectDedent(['a', ' ', '  b']).to.deep.equal(['a', '', 'b']);
    });
    (0, mocha_1.it)('removes uniform indentation from a string', () => {
        const lines = [
            '',
            '    Hello,',
            '      World!',
            '',
            '    Yours,',
            '      GraphQL.',
        ];
        expectDedent(lines).to.deep.equal([
            'Hello,',
            '  World!',
            '',
            'Yours,',
            '  GraphQL.',
        ]);
    });
    (0, mocha_1.it)('removes empty leading and trailing lines', () => {
        const lines = [
            '',
            '',
            '    Hello,',
            '      World!',
            '',
            '    Yours,',
            '      GraphQL.',
            '',
            '',
        ];
        expectDedent(lines).to.deep.equal([
            'Hello,',
            '  World!',
            '',
            'Yours,',
            '  GraphQL.',
        ]);
    });
    (0, mocha_1.it)('removes blank leading and trailing lines', () => {
        const lines = [
            '  ',
            '        ',
            '    Hello,',
            '      World!',
            '',
            '    Yours,',
            '      GraphQL.',
            '        ',
            '  ',
        ];
        expectDedent(lines).to.deep.equal([
            'Hello,',
            '  World!',
            '',
            'Yours,',
            '  GraphQL.',
        ]);
    });
    (0, mocha_1.it)('retains indentation from first line', () => {
        const lines = [
            '    Hello,',
            '      World!',
            '',
            '    Yours,',
            '      GraphQL.',
        ];
        expectDedent(lines).to.deep.equal([
            '    Hello,',
            '  World!',
            '',
            'Yours,',
            '  GraphQL.',
        ]);
    });
    (0, mocha_1.it)('does not alter trailing spaces', () => {
        const lines = [
            '               ',
            '    Hello,     ',
            '      World!   ',
            '               ',
            '    Yours,     ',
            '      GraphQL. ',
            '               ',
        ];
        expectDedent(lines).to.deep.equal([
            'Hello,     ',
            '  World!   ',
            '           ',
            'Yours,     ',
            '  GraphQL. ',
        ]);
    });
});
(0, mocha_1.describe)('isPrintableAsBlockString', () => {
    function expectPrintable(str) {
        return (0, chai_1.expect)((0, blockString_1.isPrintableAsBlockString)(str)).to.equal(true);
    }
    function expectNonPrintable(str) {
        return (0, chai_1.expect)((0, blockString_1.isPrintableAsBlockString)(str)).to.equal(false);
    }
    (0, mocha_1.it)('accepts valid strings', () => {
        expectPrintable('');
        expectPrintable(' a');
        expectPrintable('\t"\n"');
        expectNonPrintable('\t"\n \n\t"');
    });
    (0, mocha_1.it)('rejects strings with only whitespace', () => {
        expectNonPrintable(' ');
        expectNonPrintable('\t');
        expectNonPrintable('\t ');
        expectNonPrintable(' \t');
    });
    (0, mocha_1.it)('rejects strings with non-printable characters', () => {
        expectNonPrintable('\x00');
        expectNonPrintable('a\x00b');
    });
    (0, mocha_1.it)('rejects strings with only empty lines', () => {
        expectNonPrintable('\n');
        expectNonPrintable('\n\n');
        expectNonPrintable('\n\n\n');
        expectNonPrintable(' \n  \n');
        expectNonPrintable('\t\n\t\t\n');
    });
    (0, mocha_1.it)('rejects strings with carriage return', () => {
        expectNonPrintable('\r');
        expectNonPrintable('\n\r');
        expectNonPrintable('\r\n');
        expectNonPrintable('a\rb');
    });
    (0, mocha_1.it)('rejects strings with leading empty lines', () => {
        expectNonPrintable('\na');
        expectNonPrintable(' \na');
        expectNonPrintable('\t\na');
        expectNonPrintable('\n\na');
    });
    (0, mocha_1.it)('rejects strings with trailing empty lines', () => {
        expectNonPrintable('a\n');
        expectNonPrintable('a\n ');
        expectNonPrintable('a\n\t');
        expectNonPrintable('a\n\n');
    });
});
(0, mocha_1.describe)('printBlockString', () => {
    function expectBlockString(str) {
        return {
            toEqual(expected) {
                const { readable, minimize } = typeof expected === 'string'
                    ? { readable: expected, minimize: expected }
                    : expected;
                (0, chai_1.expect)((0, blockString_1.printBlockString)(str)).to.equal(readable);
                (0, chai_1.expect)((0, blockString_1.printBlockString)(str, { minimize: true })).to.equal(minimize);
            },
        };
    }
    (0, mocha_1.it)('does not escape characters', () => {
        const str = '" \\ / \b \f \n \r \t';
        expectBlockString(str).toEqual({
            readable: '"""\n' + str + '\n"""',
            minimize: '"""\n' + str + '"""',
        });
    });
    (0, mocha_1.it)('by default print block strings as single line', () => {
        const str = 'one liner';
        expectBlockString(str).toEqual('"""one liner"""');
    });
    (0, mocha_1.it)('by default print block strings ending with triple quotation as multi-line', () => {
        const str = 'triple quotation """';
        expectBlockString(str).toEqual({
            readable: '"""\ntriple quotation \\"""\n"""',
            minimize: '"""triple quotation \\""""""',
        });
    });
    (0, mocha_1.it)('correctly prints single-line with leading space', () => {
        const str = '    space-led string';
        expectBlockString(str).toEqual('"""    space-led string"""');
    });
    (0, mocha_1.it)('correctly prints single-line with leading space and trailing quotation', () => {
        const str = '    space-led value "quoted string"';
        expectBlockString(str).toEqual('"""    space-led value "quoted string"\n"""');
    });
    (0, mocha_1.it)('correctly prints single-line with trailing backslash', () => {
        const str = 'backslash \\';
        expectBlockString(str).toEqual({
            readable: '"""\nbackslash \\\n"""',
            minimize: '"""backslash \\\n"""',
        });
    });
    (0, mocha_1.it)('correctly prints multi-line with internal indent', () => {
        const str = 'no indent\n with indent';
        expectBlockString(str).toEqual({
            readable: '"""\nno indent\n with indent\n"""',
            minimize: '"""\nno indent\n with indent"""',
        });
    });
    (0, mocha_1.it)('correctly prints string with a first line indentation', () => {
        const str = joinLines('    first  ', '  line     ', 'indentation', '     string');
        expectBlockString(str).toEqual({
            readable: joinLines('"""', '    first  ', '  line     ', 'indentation', '     string', '"""'),
            minimize: joinLines('"""    first  ', '  line     ', 'indentation', '     string"""'),
        });
    });
});
//# sourceMappingURL=blockString-test.js.map