"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const LoneAnonymousOperationRule_1 = require("../rules/LoneAnonymousOperationRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(LoneAnonymousOperationRule_1.LoneAnonymousOperationRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Anonymous operation must be alone', () => {
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
    (0, mocha_1.it)('multiple named operations', () => {
        expectValid(`
      query Foo {
        field
      }

      query Bar {
        field
      }
    `);
    });
    (0, mocha_1.it)('anon operation with fragment', () => {
        expectValid(`
      {
        ...Foo
      }
      fragment Foo on Type {
        field
      }
    `);
    });
    (0, mocha_1.it)('multiple anon operations', () => {
        expectErrors(`
      {
        fieldA
      }
      {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'This anonymous operation must be the only defined operation.',
                locations: [{ line: 2, column: 7 }],
            },
            {
                message: 'This anonymous operation must be the only defined operation.',
                locations: [{ line: 5, column: 7 }],
            },
        ]);
    });
    (0, mocha_1.it)('anon operation with a mutation', () => {
        expectErrors(`
      {
        fieldA
      }
      mutation Foo {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'This anonymous operation must be the only defined operation.',
                locations: [{ line: 2, column: 7 }],
            },
        ]);
    });
    (0, mocha_1.it)('anon operation with a subscription', () => {
        expectErrors(`
      {
        fieldA
      }
      subscription Foo {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'This anonymous operation must be the only defined operation.',
                locations: [{ line: 2, column: 7 }],
            },
        ]);
    });
});
//# sourceMappingURL=LoneAnonymousOperationRule-test.js.map