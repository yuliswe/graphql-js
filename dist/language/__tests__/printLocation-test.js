"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const printLocation_1 = require("../printLocation");
const source_1 = require("../source");
(0, mocha_1.describe)('printSourceLocation', () => {
    (0, mocha_1.it)('prints minified documents', () => {
        const minifiedSource = new source_1.Source('query SomeMinifiedQueryWithErrorInside($foo:String!=FIRST_ERROR_HERE$bar:String){someField(foo:$foo bar:$bar baz:SECOND_ERROR_HERE){fieldA fieldB{fieldC fieldD...on THIRD_ERROR_HERE}}}');
        const firstLocation = (0, printLocation_1.printSourceLocation)(minifiedSource, {
            line: 1,
            column: minifiedSource.body.indexOf('FIRST_ERROR_HERE') + 1,
        });
        (0, chai_1.expect)(firstLocation).to.equal((0, dedent_1.dedent) `
      GraphQL request:1:53
      1 | query SomeMinifiedQueryWithErrorInside($foo:String!=FIRST_ERROR_HERE$bar:String)
        |                                                     ^
        | {someField(foo:$foo bar:$bar baz:SECOND_ERROR_HERE){fieldA fieldB{fieldC fieldD.
    `);
        const secondLocation = (0, printLocation_1.printSourceLocation)(minifiedSource, {
            line: 1,
            column: minifiedSource.body.indexOf('SECOND_ERROR_HERE') + 1,
        });
        (0, chai_1.expect)(secondLocation).to.equal((0, dedent_1.dedent) `
      GraphQL request:1:114
      1 | query SomeMinifiedQueryWithErrorInside($foo:String!=FIRST_ERROR_HERE$bar:String)
        | {someField(foo:$foo bar:$bar baz:SECOND_ERROR_HERE){fieldA fieldB{fieldC fieldD.
        |                                  ^
        | ..on THIRD_ERROR_HERE}}}
    `);
        const thirdLocation = (0, printLocation_1.printSourceLocation)(minifiedSource, {
            line: 1,
            column: minifiedSource.body.indexOf('THIRD_ERROR_HERE') + 1,
        });
        (0, chai_1.expect)(thirdLocation).to.equal((0, dedent_1.dedent) `
      GraphQL request:1:166
      1 | query SomeMinifiedQueryWithErrorInside($foo:String!=FIRST_ERROR_HERE$bar:String)
        | {someField(foo:$foo bar:$bar baz:SECOND_ERROR_HERE){fieldA fieldB{fieldC fieldD.
        | ..on THIRD_ERROR_HERE}}}
        |      ^
    `);
    });
    (0, mocha_1.it)('prints single digit line number with no padding', () => {
        const result = (0, printLocation_1.printSourceLocation)(new source_1.Source('*', 'Test', { line: 9, column: 1 }), { line: 1, column: 1 });
        (0, chai_1.expect)(result).to.equal((0, dedent_1.dedent) `
      Test:9:1
      9 | *
        | ^
    `);
    });
    (0, mocha_1.it)('prints an line numbers with correct padding', () => {
        const result = (0, printLocation_1.printSourceLocation)(new source_1.Source('*\n', 'Test', { line: 9, column: 1 }), { line: 1, column: 1 });
        (0, chai_1.expect)(result).to.equal((0, dedent_1.dedent) `
      Test:9:1
       9 | *
         | ^
      10 |
    `);
    });
});
//# sourceMappingURL=printLocation-test.js.map