"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const NoDeprecatedCustomRule_1 = require("../rules/custom/NoDeprecatedCustomRule");
const harness_1 = require("./harness");
function buildAssertion(sdlStr) {
    const schema = (0, buildASTSchema_1.buildSchema)(sdlStr);
    return { expectErrors, expectValid };
    function expectErrors(queryStr) {
        return (0, harness_1.expectValidationErrorsWithSchema)(schema, NoDeprecatedCustomRule_1.NoDeprecatedCustomRule, queryStr);
    }
    function expectValid(queryStr) {
        expectErrors(queryStr).toDeepEqual([]);
    }
}
(0, mocha_1.describe)('Validate: no deprecated', () => {
    (0, mocha_1.describe)('no deprecated fields', () => {
        const { expectValid, expectErrors } = buildAssertion(`
      type Query {
        normalField: String
        deprecatedField: String @deprecated(reason: "Some field reason.")
      }
    `);
        (0, mocha_1.it)('ignores fields that are not deprecated', () => {
            expectValid(`
        {
          normalField
        }
      `);
        });
        (0, mocha_1.it)('ignores unknown fields', () => {
            expectValid(`
        {
          unknownField
        }

        fragment UnknownFragment on UnknownType {
          deprecatedField
        }
      `);
        });
        (0, mocha_1.it)('reports error when a deprecated field is selected', () => {
            const message = 'The field Query.deprecatedField is deprecated. Some field reason.';
            expectErrors(`
        {
          deprecatedField
        }

        fragment QueryFragment on Query {
          deprecatedField
        }
      `).toDeepEqual([
                { message, locations: [{ line: 3, column: 11 }] },
                { message, locations: [{ line: 7, column: 11 }] },
            ]);
        });
    });
    (0, mocha_1.describe)('no deprecated arguments on fields', () => {
        const { expectValid, expectErrors } = buildAssertion(`
      type Query {
        someField(
          normalArg: String,
          deprecatedArg: String @deprecated(reason: "Some arg reason."),
        ): String
      }
    `);
        (0, mocha_1.it)('ignores arguments that are not deprecated', () => {
            expectValid(`
        {
          normalField(normalArg: "")
        }
      `);
        });
        (0, mocha_1.it)('ignores unknown arguments', () => {
            expectValid(`
        {
          someField(unknownArg: "")
          unknownField(deprecatedArg: "")
        }
      `);
        });
        (0, mocha_1.it)('reports error when a deprecated argument is used', () => {
            expectErrors(`
        {
          someField(deprecatedArg: "")
        }
      `).toDeepEqual([
                {
                    message: 'Field "Query.someField" argument "deprecatedArg" is deprecated. Some arg reason.',
                    locations: [{ line: 3, column: 21 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('no deprecated arguments on directives', () => {
        const { expectValid, expectErrors } = buildAssertion(`
      type Query {
        someField: String
      }

      directive @someDirective(
        normalArg: String,
        deprecatedArg: String @deprecated(reason: "Some arg reason."),
      ) on FIELD
    `);
        (0, mocha_1.it)('ignores arguments that are not deprecated', () => {
            expectValid(`
        {
          someField @someDirective(normalArg: "")
        }
      `);
        });
        (0, mocha_1.it)('ignores unknown arguments', () => {
            expectValid(`
        {
          someField @someDirective(unknownArg: "")
          someField @unknownDirective(deprecatedArg: "")
        }
      `);
        });
        (0, mocha_1.it)('reports error when a deprecated argument is used', () => {
            expectErrors(`
        {
          someField @someDirective(deprecatedArg: "")
        }
      `).toDeepEqual([
                {
                    message: 'Directive "@someDirective" argument "deprecatedArg" is deprecated. Some arg reason.',
                    locations: [{ line: 3, column: 36 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('no deprecated input fields', () => {
        const { expectValid, expectErrors } = buildAssertion(`
      input InputType {
        normalField: String
        deprecatedField: String @deprecated(reason: "Some input field reason.")
      }

      type Query {
        someField(someArg: InputType): String
      }

      directive @someDirective(someArg: InputType) on FIELD
    `);
        (0, mocha_1.it)('ignores input fields that are not deprecated', () => {
            expectValid(`
        {
          someField(
            someArg: { normalField: "" }
          ) @someDirective(someArg: { normalField: "" })
        }
      `);
        });
        (0, mocha_1.it)('ignores unknown input fields', () => {
            expectValid(`
        {
          someField(
            someArg: { unknownField: "" }
          )

          someField(
            unknownArg: { unknownField: "" }
          )

          unknownField(
            unknownArg: { unknownField: "" }
          )
        }
      `);
        });
        (0, mocha_1.it)('reports error when a deprecated input field is used', () => {
            const message = 'The input field InputType.deprecatedField is deprecated. Some input field reason.';
            expectErrors(`
        {
          someField(
            someArg: { deprecatedField: "" }
          ) @someDirective(someArg: { deprecatedField: "" })
        }
      `).toDeepEqual([
                { message, locations: [{ line: 4, column: 24 }] },
                { message, locations: [{ line: 5, column: 39 }] },
            ]);
        });
    });
    (0, mocha_1.describe)('no deprecated enum values', () => {
        const { expectValid, expectErrors } = buildAssertion(`
      enum EnumType {
        NORMAL_VALUE
        DEPRECATED_VALUE @deprecated(reason: "Some enum reason.")
      }

      type Query {
        someField(enumArg: EnumType): String
      }
    `);
        (0, mocha_1.it)('ignores enum values that are not deprecated', () => {
            expectValid(`
        {
          normalField(enumArg: NORMAL_VALUE)
        }
      `);
        });
        (0, mocha_1.it)('ignores unknown enum values', () => {
            expectValid(`
        query (
          $unknownValue: EnumType = UNKNOWN_VALUE
          $unknownType: UnknownType = UNKNOWN_VALUE
        ) {
          someField(enumArg: UNKNOWN_VALUE)
          someField(unknownArg: UNKNOWN_VALUE)
          unknownField(unknownArg: UNKNOWN_VALUE)
        }

        fragment SomeFragment on Query {
          someField(enumArg: UNKNOWN_VALUE)
        }
      `);
        });
        (0, mocha_1.it)('reports error when a deprecated enum value is used', () => {
            const message = 'The enum value "EnumType.DEPRECATED_VALUE" is deprecated. Some enum reason.';
            expectErrors(`
        query (
          $variable: EnumType = DEPRECATED_VALUE
        ) {
          someField(enumArg: DEPRECATED_VALUE)
        }
      `).toDeepEqual([
                { message, locations: [{ line: 3, column: 33 }] },
                { message, locations: [{ line: 5, column: 30 }] },
            ]);
        });
    });
});
//# sourceMappingURL=NoDeprecatedCustomRule-test.js.map