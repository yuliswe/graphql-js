"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const UniqueVariableNamesRule_1 = require("../rules/UniqueVariableNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(UniqueVariableNamesRule_1.UniqueVariableNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique variable names', () => {
    (0, mocha_1.it)('unique variable names', () => {
        expectValid(`
      query A($x: Int, $y: String) { __typename }
      query B($x: String, $y: Int) { __typename }
    `);
    });
    (0, mocha_1.it)('duplicate variable names', () => {
        expectErrors(`
      query A($x: Int, $x: Int, $x: String) { __typename }
      query B($x: String, $x: Int) { __typename }
      query C($x: Int, $x: Int) { __typename }
    `).toDeepEqual([
            {
                message: 'There can be only one variable named "$x".',
                locations: [
                    { line: 2, column: 16 },
                    { line: 2, column: 25 },
                    { line: 2, column: 34 },
                ],
            },
            {
                message: 'There can be only one variable named "$x".',
                locations: [
                    { line: 3, column: 16 },
                    { line: 3, column: 28 },
                ],
            },
            {
                message: 'There can be only one variable named "$x".',
                locations: [
                    { line: 4, column: 16 },
                    { line: 4, column: 25 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueVariableNamesRule-test.js.map