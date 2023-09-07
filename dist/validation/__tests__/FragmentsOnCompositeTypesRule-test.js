"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const FragmentsOnCompositeTypesRule_1 = require("../rules/FragmentsOnCompositeTypesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(FragmentsOnCompositeTypesRule_1.FragmentsOnCompositeTypesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Fragments on composite types', () => {
    (0, mocha_1.it)('object is valid fragment type', () => {
        expectValid(`
      fragment validFragment on Dog {
        barks
      }
    `);
    });
    (0, mocha_1.it)('interface is valid fragment type', () => {
        expectValid(`
      fragment validFragment on Pet {
        name
      }
    `);
    });
    (0, mocha_1.it)('object is valid inline fragment type', () => {
        expectValid(`
      fragment validFragment on Pet {
        ... on Dog {
          barks
        }
      }
    `);
    });
    (0, mocha_1.it)('interface is valid inline fragment type', () => {
        expectValid(`
      fragment validFragment on Mammal {
        ... on Canine {
          name
        }
      }
    `);
    });
    (0, mocha_1.it)('inline fragment without type is valid', () => {
        expectValid(`
      fragment validFragment on Pet {
        ... {
          name
        }
      }
    `);
    });
    (0, mocha_1.it)('union is valid fragment type', () => {
        expectValid(`
      fragment validFragment on CatOrDog {
        __typename
      }
    `);
    });
    (0, mocha_1.it)('scalar is invalid fragment type', () => {
        expectErrors(`
      fragment scalarFragment on Boolean {
        bad
      }
    `).toDeepEqual([
            {
                message: 'Fragment "scalarFragment" cannot condition on non composite type "Boolean".',
                locations: [{ line: 2, column: 34 }],
            },
        ]);
    });
    (0, mocha_1.it)('enum is invalid fragment type', () => {
        expectErrors(`
      fragment scalarFragment on FurColor {
        bad
      }
    `).toDeepEqual([
            {
                message: 'Fragment "scalarFragment" cannot condition on non composite type "FurColor".',
                locations: [{ line: 2, column: 34 }],
            },
        ]);
    });
    (0, mocha_1.it)('input object is invalid fragment type', () => {
        expectErrors(`
      fragment inputFragment on ComplexInput {
        stringField
      }
    `).toDeepEqual([
            {
                message: 'Fragment "inputFragment" cannot condition on non composite type "ComplexInput".',
                locations: [{ line: 2, column: 33 }],
            },
        ]);
    });
    (0, mocha_1.it)('scalar is invalid inline fragment type', () => {
        expectErrors(`
      fragment invalidFragment on Pet {
        ... on String {
          barks
        }
      }
    `).toDeepEqual([
            {
                message: 'Fragment cannot condition on non composite type "String".',
                locations: [{ line: 3, column: 16 }],
            },
        ]);
    });
});
//# sourceMappingURL=FragmentsOnCompositeTypesRule-test.js.map