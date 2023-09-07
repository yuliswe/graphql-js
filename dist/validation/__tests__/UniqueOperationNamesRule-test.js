"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const UniqueOperationNamesRule_1 = require("../rules/UniqueOperationNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(UniqueOperationNamesRule_1.UniqueOperationNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique operation names', () => {
    (0, mocha_1.it)('no operations', () => {
        expectValid(`
      fragment fragA on Type {
        field
      }
    `);
    });
    (0, mocha_1.it)('one anon operation', () => {
        expectValid(`
      {
        field
      }
    `);
    });
    (0, mocha_1.it)('one named operation', () => {
        expectValid(`
      query Foo {
        field
      }
    `);
    });
    (0, mocha_1.it)('multiple operations', () => {
        expectValid(`
      query Foo {
        field
      }

      query Bar {
        field
      }
    `);
    });
    (0, mocha_1.it)('multiple operations of different types', () => {
        expectValid(`
      query Foo {
        field
      }

      mutation Bar {
        field
      }

      subscription Baz {
        field
      }
    `);
    });
    (0, mocha_1.it)('fragment and operation named the same', () => {
        expectValid(`
      query Foo {
        ...Foo
      }
      fragment Foo on Type {
        field
      }
    `);
    });
    (0, mocha_1.it)('multiple operations of same name', () => {
        expectErrors(`
      query Foo {
        fieldA
      }
      query Foo {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'There can be only one operation named "Foo".',
                locations: [
                    { line: 2, column: 13 },
                    { line: 5, column: 13 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('multiple ops of same name of different types (mutation)', () => {
        expectErrors(`
      query Foo {
        fieldA
      }
      mutation Foo {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'There can be only one operation named "Foo".',
                locations: [
                    { line: 2, column: 13 },
                    { line: 5, column: 16 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('multiple ops of same name of different types (subscription)', () => {
        expectErrors(`
      query Foo {
        fieldA
      }
      subscription Foo {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'There can be only one operation named "Foo".',
                locations: [
                    { line: 2, column: 13 },
                    { line: 5, column: 20 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueOperationNamesRule-test.js.map