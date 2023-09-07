"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const UniqueArgumentNamesRule_1 = require("../rules/UniqueArgumentNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(UniqueArgumentNamesRule_1.UniqueArgumentNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique argument names', () => {
    (0, mocha_1.it)('no arguments on field', () => {
        expectValid(`
      {
        field
      }
    `);
    });
    (0, mocha_1.it)('no arguments on directive', () => {
        expectValid(`
      {
        field @directive
      }
    `);
    });
    (0, mocha_1.it)('argument on field', () => {
        expectValid(`
      {
        field(arg: "value")
      }
    `);
    });
    (0, mocha_1.it)('argument on directive', () => {
        expectValid(`
      {
        field @directive(arg: "value")
      }
    `);
    });
    (0, mocha_1.it)('same argument on two fields', () => {
        expectValid(`
      {
        one: field(arg: "value")
        two: field(arg: "value")
      }
    `);
    });
    (0, mocha_1.it)('same argument on field and directive', () => {
        expectValid(`
      {
        field(arg: "value") @directive(arg: "value")
      }
    `);
    });
    (0, mocha_1.it)('same argument on two directives', () => {
        expectValid(`
      {
        field @directive1(arg: "value") @directive2(arg: "value")
      }
    `);
    });
    (0, mocha_1.it)('multiple field arguments', () => {
        expectValid(`
      {
        field(arg1: "value", arg2: "value", arg3: "value")
      }
    `);
    });
    (0, mocha_1.it)('multiple directive arguments', () => {
        expectValid(`
      {
        field @directive(arg1: "value", arg2: "value", arg3: "value")
      }
    `);
    });
    (0, mocha_1.it)('duplicate field arguments', () => {
        expectErrors(`
      {
        field(arg1: "value", arg1: "value")
      }
    `).toDeepEqual([
            {
                message: 'There can be only one argument named "arg1".',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 30 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('many duplicate field arguments', () => {
        expectErrors(`
      {
        field(arg1: "value", arg1: "value", arg1: "value")
      }
    `).toDeepEqual([
            {
                message: 'There can be only one argument named "arg1".',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 30 },
                    { line: 3, column: 45 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate directive arguments', () => {
        expectErrors(`
      {
        field @directive(arg1: "value", arg1: "value")
      }
    `).toDeepEqual([
            {
                message: 'There can be only one argument named "arg1".',
                locations: [
                    { line: 3, column: 26 },
                    { line: 3, column: 41 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('many duplicate directive arguments', () => {
        expectErrors(`
      {
        field @directive(arg1: "value", arg1: "value", arg1: "value")
      }
    `).toDeepEqual([
            {
                message: 'There can be only one argument named "arg1".',
                locations: [
                    { line: 3, column: 26 },
                    { line: 3, column: 41 },
                    { line: 3, column: 56 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueArgumentNamesRule-test.js.map