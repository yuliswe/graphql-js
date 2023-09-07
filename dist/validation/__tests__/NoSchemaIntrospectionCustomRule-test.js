"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const NoSchemaIntrospectionCustomRule_1 = require("../rules/custom/NoSchemaIntrospectionCustomRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrorsWithSchema)(schema, NoSchemaIntrospectionCustomRule_1.NoSchemaIntrospectionCustomRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
const schema = (0, buildASTSchema_1.buildSchema)(`
  type Query {
    someQuery: SomeType
  }

  type SomeType {
    someField: String
    introspectionField: __EnumValue
  }
`);
(0, mocha_1.describe)('Validate: Prohibit introspection queries', () => {
    (0, mocha_1.it)('ignores valid fields including __typename', () => {
        expectValid(`
      {
        someQuery {
          __typename
          someField
        }
      }
    `);
    });
    (0, mocha_1.it)('ignores fields not in the schema', () => {
        expectValid(`
      {
        __introspect
      }
    `);
    });
    (0, mocha_1.it)('reports error when a field with an introspection type is requested', () => {
        expectErrors(`
      {
        __schema {
          queryType {
            name
          }
        }
      }
    `).toDeepEqual([
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "__schema".',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "queryType".',
                locations: [{ line: 4, column: 11 }],
            },
        ]);
    });
    (0, mocha_1.it)('reports error when a field with an introspection type is requested and aliased', () => {
        expectErrors(`
      {
        s: __schema {
          queryType {
            name
          }
        }
      }
      `).toDeepEqual([
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "__schema".',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "queryType".',
                locations: [{ line: 4, column: 11 }],
            },
        ]);
    });
    (0, mocha_1.it)('reports error when using a fragment with a field with an introspection type', () => {
        expectErrors(`
      {
        ...QueryFragment
      }

      fragment QueryFragment on Query {
        __schema {
          queryType {
            name
          }
        }
      }
    `).toDeepEqual([
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "__schema".',
                locations: [{ line: 7, column: 9 }],
            },
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "queryType".',
                locations: [{ line: 8, column: 11 }],
            },
        ]);
    });
    (0, mocha_1.it)('reports error for non-standard introspection fields', () => {
        expectErrors(`
      {
        someQuery {
          introspectionField
        }
      }
    `).toDeepEqual([
            {
                message: 'GraphQL introspection has been disabled, but the requested query contained the field "introspectionField".',
                locations: [{ line: 4, column: 11 }],
            },
        ]);
    });
});
//# sourceMappingURL=NoSchemaIntrospectionCustomRule-test.js.map