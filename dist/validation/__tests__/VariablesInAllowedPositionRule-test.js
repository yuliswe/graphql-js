"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const VariablesInAllowedPositionRule_1 = require("../rules/VariablesInAllowedPositionRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(VariablesInAllowedPositionRule_1.VariablesInAllowedPositionRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Variables are in allowed positions', () => {
    (0, mocha_1.it)('Boolean => Boolean', () => {
        expectValid(`
      query Query($booleanArg: Boolean)
      {
        complicatedArgs {
          booleanArgField(booleanArg: $booleanArg)
        }
      }
    `);
    });
    (0, mocha_1.it)('Boolean => Boolean within fragment', () => {
        expectValid(`
      fragment booleanArgFrag on ComplicatedArgs {
        booleanArgField(booleanArg: $booleanArg)
      }
      query Query($booleanArg: Boolean)
      {
        complicatedArgs {
          ...booleanArgFrag
        }
      }
    `);
        expectValid(`
      query Query($booleanArg: Boolean)
      {
        complicatedArgs {
          ...booleanArgFrag
        }
      }
      fragment booleanArgFrag on ComplicatedArgs {
        booleanArgField(booleanArg: $booleanArg)
      }
    `);
    });
    (0, mocha_1.it)('Boolean! => Boolean', () => {
        expectValid(`
      query Query($nonNullBooleanArg: Boolean!)
      {
        complicatedArgs {
          booleanArgField(booleanArg: $nonNullBooleanArg)
        }
      }
    `);
    });
    (0, mocha_1.it)('Boolean! => Boolean within fragment', () => {
        expectValid(`
      fragment booleanArgFrag on ComplicatedArgs {
        booleanArgField(booleanArg: $nonNullBooleanArg)
      }

      query Query($nonNullBooleanArg: Boolean!)
      {
        complicatedArgs {
          ...booleanArgFrag
        }
      }
    `);
    });
    (0, mocha_1.it)('[String] => [String]', () => {
        expectValid(`
      query Query($stringListVar: [String])
      {
        complicatedArgs {
          stringListArgField(stringListArg: $stringListVar)
        }
      }
    `);
    });
    (0, mocha_1.it)('[String!] => [String]', () => {
        expectValid(`
      query Query($stringListVar: [String!])
      {
        complicatedArgs {
          stringListArgField(stringListArg: $stringListVar)
        }
      }
    `);
    });
    (0, mocha_1.it)('String => [String] in item position', () => {
        expectValid(`
      query Query($stringVar: String)
      {
        complicatedArgs {
          stringListArgField(stringListArg: [$stringVar])
        }
      }
    `);
    });
    (0, mocha_1.it)('String! => [String] in item position', () => {
        expectValid(`
      query Query($stringVar: String!)
      {
        complicatedArgs {
          stringListArgField(stringListArg: [$stringVar])
        }
      }
    `);
    });
    (0, mocha_1.it)('ComplexInput => ComplexInput', () => {
        expectValid(`
      query Query($complexVar: ComplexInput)
      {
        complicatedArgs {
          complexArgField(complexArg: $complexVar)
        }
      }
    `);
    });
    (0, mocha_1.it)('ComplexInput => ComplexInput in field position', () => {
        expectValid(`
      query Query($boolVar: Boolean = false)
      {
        complicatedArgs {
          complexArgField(complexArg: {requiredArg: $boolVar})
        }
      }
    `);
    });
    (0, mocha_1.it)('Boolean! => Boolean! in directive', () => {
        expectValid(`
      query Query($boolVar: Boolean!)
      {
        dog @include(if: $boolVar)
      }
    `);
    });
    (0, mocha_1.it)('Int => Int!', () => {
        expectErrors(`
      query Query($intArg: Int) {
        complicatedArgs {
          nonNullIntArgField(nonNullIntArg: $intArg)
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$intArg" of type "Int" used in position expecting type "Int!".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 4, column: 45 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('Int => Int! within fragment', () => {
        expectErrors(`
      fragment nonNullIntArgFieldFrag on ComplicatedArgs {
        nonNullIntArgField(nonNullIntArg: $intArg)
      }

      query Query($intArg: Int) {
        complicatedArgs {
          ...nonNullIntArgFieldFrag
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$intArg" of type "Int" used in position expecting type "Int!".',
                locations: [
                    { line: 6, column: 19 },
                    { line: 3, column: 43 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('Int => Int! within nested fragment', () => {
        expectErrors(`
      fragment outerFrag on ComplicatedArgs {
        ...nonNullIntArgFieldFrag
      }

      fragment nonNullIntArgFieldFrag on ComplicatedArgs {
        nonNullIntArgField(nonNullIntArg: $intArg)
      }

      query Query($intArg: Int) {
        complicatedArgs {
          ...outerFrag
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$intArg" of type "Int" used in position expecting type "Int!".',
                locations: [
                    { line: 10, column: 19 },
                    { line: 7, column: 43 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('String over Boolean', () => {
        expectErrors(`
      query Query($stringVar: String) {
        complicatedArgs {
          booleanArgField(booleanArg: $stringVar)
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$stringVar" of type "String" used in position expecting type "Boolean".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 4, column: 39 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('String => [String]', () => {
        expectErrors(`
      query Query($stringVar: String) {
        complicatedArgs {
          stringListArgField(stringListArg: $stringVar)
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$stringVar" of type "String" used in position expecting type "[String]".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 4, column: 45 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('Boolean => Boolean! in directive', () => {
        expectErrors(`
      query Query($boolVar: Boolean) {
        dog @include(if: $boolVar)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$boolVar" of type "Boolean" used in position expecting type "Boolean!".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 3, column: 26 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('String => Boolean! in directive', () => {
        expectErrors(`
      query Query($stringVar: String) {
        dog @include(if: $stringVar)
      }
    `).toDeepEqual([
            {
                message: 'Variable "$stringVar" of type "String" used in position expecting type "Boolean!".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 3, column: 26 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('[String] => [String!]', () => {
        expectErrors(`
      query Query($stringListVar: [String])
      {
        complicatedArgs {
          stringListNonNullArgField(stringListNonNullArg: $stringListVar)
        }
      }
    `).toDeepEqual([
            {
                message: 'Variable "$stringListVar" of type "[String]" used in position expecting type "[String!]".',
                locations: [
                    { line: 2, column: 19 },
                    { line: 5, column: 59 },
                ],
            },
        ]);
    });
    (0, mocha_1.describe)('Allows optional (nullable) variables with default values', () => {
        (0, mocha_1.it)('Int => Int! fails when variable provides null default value', () => {
            expectErrors(`
        query Query($intVar: Int = null) {
          complicatedArgs {
            nonNullIntArgField(nonNullIntArg: $intVar)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Variable "$intVar" of type "Int" used in position expecting type "Int!".',
                    locations: [
                        { line: 2, column: 21 },
                        { line: 4, column: 47 },
                    ],
                },
            ]);
        });
        (0, mocha_1.it)('Int => Int! when variable provides non-null default value', () => {
            expectValid(`
        query Query($intVar: Int = 1) {
          complicatedArgs {
            nonNullIntArgField(nonNullIntArg: $intVar)
          }
        }`);
        });
        (0, mocha_1.it)('Int => Int! when optional argument provides default value', () => {
            expectValid(`
        query Query($intVar: Int) {
          complicatedArgs {
            nonNullFieldWithDefault(nonNullIntArg: $intVar)
          }
        }`);
        });
        (0, mocha_1.it)('Boolean => Boolean! in directive with default value with option', () => {
            expectValid(`
        query Query($boolVar: Boolean = false) {
          dog @include(if: $boolVar)
        }`);
        });
    });
});
//# sourceMappingURL=VariablesInAllowedPositionRule-test.js.map