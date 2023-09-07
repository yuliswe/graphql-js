"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const VariablesAreInputTypesRule_1 = require("../rules/VariablesAreInputTypesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(VariablesAreInputTypesRule_1.VariablesAreInputTypesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Variables are input types', () => {
    (0, mocha_1.it)('unknown types are ignored', () => {
        expectValid(`
      query Foo($a: Unknown, $b: [[Unknown!]]!) {
        field(a: $a, b: $b)
      }
    `);
    });
    (0, mocha_1.it)('input types are valid', () => {
        expectValid(`
      query Foo($a: String, $b: [Boolean!]!, $c: ComplexInput) {
        field(a: $a, b: $b, c: $c)
      }
    `);
    });
    (0, mocha_1.it)('output types are invalid', () => {
        expectErrors(`
      query Foo($a: Dog, $b: [[CatOrDog!]]!, $c: Pet) {
        field(a: $a, b: $b, c: $c)
      }
    `).toDeepEqual([
            {
                locations: [{ line: 2, column: 21 }],
                message: 'Variable "$a" cannot be non-input type "Dog".',
            },
            {
                locations: [{ line: 2, column: 30 }],
                message: 'Variable "$b" cannot be non-input type "[[CatOrDog!]]!".',
            },
            {
                locations: [{ line: 2, column: 50 }],
                message: 'Variable "$c" cannot be non-input type "Pet".',
            },
        ]);
    });
});
//# sourceMappingURL=VariablesAreInputTypesRule-test.js.map