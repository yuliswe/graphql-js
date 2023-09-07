"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const NoUnusedVariablesRule_1 = require("../rules/NoUnusedVariablesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(NoUnusedVariablesRule_1.NoUnusedVariablesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: No unused variables', () => {
    (0, mocha_1.it)('uses all variables', () => {
        expectValid(`
      query ($a: String, $b: String, $c: String) {
        field(a: $a, b: $b, c: $c)
      }
    `);
    });
    (0, mocha_1.it)('uses all variables deeply', () => {
        expectValid(`
      query Foo($a: String, $b: String, $c: String) {
        field(a: $a) {
          field(b: $b) {
            field(c: $c)
          }
        }
      }
    `);
    });
    (0, mocha_1.it)('uses all variables deeply in inline fragments', () => {
        expectValid(`
      query Foo($a: String, $b: String, $c: String) {
        ... on Type {
          field(a: $a) {
            field(b: $b) {
              ... on Type {
                field(c: $c)
              }
            }
          }
        }
      }
    `);
    });
    (0, mocha_1.it)('uses all variables in fragments', () => {
        expectValid(`
      query Foo($a: String, $b: String, $c: String) {
        ...FragA
      }
      fragment FragA on Type {
        field(a: $a) {
          ...FragB
        }
      }
      fragment FragB on Type {
        field(b: $b) {
          ...FragC
        }
      }
      fragment FragC on Type {
        field(c: $c)
      }
    `);
    });
    (0, mocha_1.it)('variable used by fragment in multiple operations', () => {
        expectValid(`
      query Foo($a: String) {
        ...FragA
      }
      query Bar($b: String) {
        ...FragB
      }
      fragment FragA on Type {
        field(a: $a)
      }
      fragment FragB on Type {
        field(b: $b)
      }
    `);
    });
    (0, mocha_1.it)('variable used by recursive fragment', () => {
        expectValid(`
      query Foo($a: String) {
        ...FragA
      }
      fragment FragA on Type {
        field(a: $a) {
          ...FragA
        }
      }
    `);
    });
    (0, mocha_1.it)('variable not used', () => {
        expectErrors(`
      query ($a: String, $b: String, $c: String) {
        field(a: $a, b: $b)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$c" is never used.',
                locations: [{ line: 2, column: 38 }],
            },
        ]);
    });
    (0, mocha_1.it)('multiple variables not used', () => {
        expectErrors(`
      query Foo($a: String, $b: String, $c: String) {
        field(b: $b)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$a" is never used in operation "Foo".',
                locations: [{ line: 2, column: 17 }],
            },
            {
                message: 'Variable "$c" is never used in operation "Foo".',
                locations: [{ line: 2, column: 41 }],
            },
        ]);
    });
    (0, mocha_1.it)('variable not used in fragments', () => {
        expectErrors(`
      query Foo($a: String, $b: String, $c: String) {
        ...FragA
      }
      fragment FragA on Type {
        field(a: $a) {
          ...FragB
        }
      }
      fragment FragB on Type {
        field(b: $b) {
          ...FragC
        }
      }
      fragment FragC on Type {
        field
      }
    `).toDeepEqual([
            {
                message: 'Variable "$c" is never used in operation "Foo".',
                locations: [{ line: 2, column: 41 }],
            },
        ]);
    });
    (0, mocha_1.it)('multiple variables not used in fragments', () => {
        expectErrors(`
      query Foo($a: String, $b: String, $c: String) {
        ...FragA
      }
      fragment FragA on Type {
        field {
          ...FragB
        }
      }
      fragment FragB on Type {
        field(b: $b) {
          ...FragC
        }
      }
      fragment FragC on Type {
        field
      }
    `).toDeepEqual([
            {
                message: 'Variable "$a" is never used in operation "Foo".',
                locations: [{ line: 2, column: 17 }],
            },
            {
                message: 'Variable "$c" is never used in operation "Foo".',
                locations: [{ line: 2, column: 41 }],
            },
        ]);
    });
    (0, mocha_1.it)('variable not used by unreferenced fragment', () => {
        expectErrors(`
      query Foo($b: String) {
        ...FragA
      }
      fragment FragA on Type {
        field(a: $a)
      }
      fragment FragB on Type {
        field(b: $b)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$b" is never used in operation "Foo".',
                locations: [{ line: 2, column: 17 }],
            },
        ]);
    });
    (0, mocha_1.it)('variable not used by fragment used by other operation', () => {
        expectErrors(`
      query Foo($b: String) {
        ...FragA
      }
      query Bar($a: String) {
        ...FragB
      }
      fragment FragA on Type {
        field(a: $a)
      }
      fragment FragB on Type {
        field(b: $b)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$b" is never used in operation "Foo".',
                locations: [{ line: 2, column: 17 }],
            },
            {
                message: 'Variable "$a" is never used in operation "Bar".',
                locations: [{ line: 5, column: 17 }],
            },
        ]);
    });
});
//# sourceMappingURL=NoUnusedVariablesRule-test.js.map