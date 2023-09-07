"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const UniqueInputFieldNamesRule_1 = require("../rules/UniqueInputFieldNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(UniqueInputFieldNamesRule_1.UniqueInputFieldNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique input field names', () => {
    (0, mocha_1.it)('input object with fields', () => {
        expectValid(`
      {
        field(arg: { f: true })
      }
    `);
    });
    (0, mocha_1.it)('same input object within two args', () => {
        expectValid(`
      {
        field(arg1: { f: true }, arg2: { f: true })
      }
    `);
    });
    (0, mocha_1.it)('multiple input object fields', () => {
        expectValid(`
      {
        field(arg: { f1: "value", f2: "value", f3: "value" })
      }
    `);
    });
    (0, mocha_1.it)('allows for nested input objects with similar fields', () => {
        expectValid(`
      {
        field(arg: {
          deep: {
            deep: {
              id: 1
            }
            id: 1
          }
          id: 1
        })
      }
    `);
    });
    (0, mocha_1.it)('duplicate input object fields', () => {
        expectErrors(`
      {
        field(arg: { f1: "value", f1: "value" })
      }
    `).toDeepEqual([
            {
                message: 'There can be only one input field named "f1".',
                locations: [
                    { line: 3, column: 22 },
                    { line: 3, column: 35 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('many duplicate input object fields', () => {
        expectErrors(`
      {
        field(arg: { f1: "value", f1: "value", f1: "value" })
      }
    `).toDeepEqual([
            {
                message: 'There can be only one input field named "f1".',
                locations: [
                    { line: 3, column: 22 },
                    { line: 3, column: 35 },
                ],
            },
            {
                message: 'There can be only one input field named "f1".',
                locations: [
                    { line: 3, column: 22 },
                    { line: 3, column: 48 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('nested duplicate input object fields', () => {
        expectErrors(`
      {
        field(arg: { f1: {f2: "value", f2: "value" }})
      }
    `).toDeepEqual([
            {
                message: 'There can be only one input field named "f2".',
                locations: [
                    { line: 3, column: 27 },
                    { line: 3, column: 40 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueInputFieldNamesRule-test.js.map