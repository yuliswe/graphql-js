"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const UniqueFragmentNamesRule_1 = require("../rules/UniqueFragmentNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(UniqueFragmentNamesRule_1.UniqueFragmentNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique fragment names', () => {
    (0, mocha_1.it)('no fragments', () => {
        expectValid(`
      {
        field
      }
    `);
    });
    (0, mocha_1.it)('one fragment', () => {
        expectValid(`
      {
        ...fragA
      }

      fragment fragA on Type {
        field
      }
    `);
    });
    (0, mocha_1.it)('many fragments', () => {
        expectValid(`
      {
        ...fragA
        ...fragB
        ...fragC
      }
      fragment fragA on Type {
        fieldA
      }
      fragment fragB on Type {
        fieldB
      }
      fragment fragC on Type {
        fieldC
      }
    `);
    });
    (0, mocha_1.it)('inline fragments are always unique', () => {
        expectValid(`
      {
        ...on Type {
          fieldA
        }
        ...on Type {
          fieldB
        }
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
    (0, mocha_1.it)('fragments named the same', () => {
        expectErrors(`
      {
        ...fragA
      }
      fragment fragA on Type {
        fieldA
      }
      fragment fragA on Type {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'There can be only one fragment named "fragA".',
                locations: [
                    { line: 5, column: 16 },
                    { line: 8, column: 16 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('fragments named the same without being referenced', () => {
        expectErrors(`
      fragment fragA on Type {
        fieldA
      }
      fragment fragA on Type {
        fieldB
      }
    `).toDeepEqual([
            {
                message: 'There can be only one fragment named "fragA".',
                locations: [
                    { line: 2, column: 16 },
                    { line: 5, column: 16 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueFragmentNamesRule-test.js.map