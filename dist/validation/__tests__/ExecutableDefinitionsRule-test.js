"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const ExecutableDefinitionsRule_1 = require("../rules/ExecutableDefinitionsRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(ExecutableDefinitionsRule_1.ExecutableDefinitionsRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Executable definitions', () => {
    (0, mocha_1.it)('with only operation', () => {
        expectValid(`
      query Foo {
        dog {
          name
        }
      }
    `);
    });
    (0, mocha_1.it)('with operation and fragment', () => {
        expectValid(`
      query Foo {
        dog {
          name
          ...Frag
        }
      }

      fragment Frag on Dog {
        name
      }
    `);
    });
    (0, mocha_1.it)('with type definition', () => {
        expectErrors(`
      query Foo {
        dog {
          name
        }
      }

      type Cow {
        name: String
      }

      extend type Dog {
        color: String
      }
    `).toDeepEqual([
            {
                message: 'The "Cow" definition is not executable.',
                locations: [{ line: 8, column: 7 }],
            },
            {
                message: 'The "Dog" definition is not executable.',
                locations: [{ line: 12, column: 7 }],
            },
        ]);
    });
    (0, mocha_1.it)('with schema definition', () => {
        expectErrors(`
      schema {
        query: Query
      }

      type Query {
        test: String
      }

      extend schema @directive
    `).toDeepEqual([
            {
                message: 'The schema definition is not executable.',
                locations: [{ line: 2, column: 7 }],
            },
            {
                message: 'The "Query" definition is not executable.',
                locations: [{ line: 6, column: 7 }],
            },
            {
                message: 'The schema definition is not executable.',
                locations: [{ line: 10, column: 7 }],
            },
        ]);
    });
});
//# sourceMappingURL=ExecutableDefinitionsRule-test.js.map