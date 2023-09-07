"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const GraphQLError_1 = require("../../error/GraphQLError");
const parser_1 = require("../../language/parser");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const TypeInfo_1 = require("../../utilities/TypeInfo");
const validate_1 = require("../validate");
const harness_1 = require("./harness");
(0, mocha_1.describe)('Validate: Supports full validation', () => {
    (0, mocha_1.it)('rejects invalid documents', () => {
        // @ts-expect-error (expects a DocumentNode as a second parameter)
        (0, chai_1.expect)(() => (0, validate_1.validate)(harness_1.testSchema, null)).to.throw('Must provide document.');
    });
    (0, mocha_1.it)('validates queries', () => {
        const doc = (0, parser_1.parse)(`
      query {
        human {
          pets {
            ... on Cat {
              meowsVolume
            }
            ... on Dog {
              barkVolume
            }
          }
        }
      }
    `);
        const errors = (0, validate_1.validate)(harness_1.testSchema, doc);
        (0, expectJSON_1.expectJSON)(errors).toDeepEqual([]);
    });
    (0, mocha_1.it)('detects unknown fields', () => {
        const doc = (0, parser_1.parse)(`
      {
        unknown
      }
    `);
        const errors = (0, validate_1.validate)(harness_1.testSchema, doc);
        (0, expectJSON_1.expectJSON)(errors).toDeepEqual([
            {
                locations: [{ line: 3, column: 9 }],
                message: 'Cannot query field "unknown" on type "QueryRoot".',
            },
        ]);
    });
    (0, mocha_1.it)('Deprecated: validates using a custom TypeInfo', () => {
        // This TypeInfo will never return a valid field.
        const typeInfo = new TypeInfo_1.TypeInfo(harness_1.testSchema, null, () => null);
        const doc = (0, parser_1.parse)(`
      query {
        human {
          pets {
            ... on Cat {
              meowsVolume
            }
            ... on Dog {
              barkVolume
            }
          }
        }
      }
    `);
        const errors = (0, validate_1.validate)(harness_1.testSchema, doc, undefined, undefined, typeInfo);
        const errorMessages = errors.map((error) => error.message);
        (0, chai_1.expect)(errorMessages).to.deep.equal([
            'Cannot query field "human" on type "QueryRoot". Did you mean "human"?',
            'Cannot query field "meowsVolume" on type "Cat". Did you mean "meowsVolume"?',
            'Cannot query field "barkVolume" on type "Dog". Did you mean "barkVolume"?',
        ]);
    });
    (0, mocha_1.it)('validates using a custom rule', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      directive @custom(arg: String) on FIELD

      type Query {
        foo: String
      }
    `);
        const doc = (0, parser_1.parse)(`
      query {
        name @custom
      }
    `);
        function customRule(context) {
            return {
                Directive(node) {
                    const directiveDef = context.getDirective();
                    const error = new GraphQLError_1.GraphQLError('Reporting directive: ' + String(directiveDef), { nodes: node });
                    context.reportError(error);
                },
            };
        }
        const errors = (0, validate_1.validate)(schema, doc, [customRule]);
        (0, expectJSON_1.expectJSON)(errors).toDeepEqual([
            {
                message: 'Reporting directive: @custom',
                locations: [{ line: 3, column: 14 }],
            },
        ]);
    });
});
(0, mocha_1.describe)('Validate: Limit maximum number of validation errors', () => {
    const query = `
    {
      firstUnknownField
      secondUnknownField
      thirdUnknownField
    }
  `;
    const doc = (0, parser_1.parse)(query, { noLocation: true });
    function validateDocument(options) {
        return (0, validate_1.validate)(harness_1.testSchema, doc, undefined, options);
    }
    function invalidFieldError(fieldName) {
        return {
            message: `Cannot query field "${fieldName}" on type "QueryRoot".`,
        };
    }
    (0, mocha_1.it)('when maxErrors is equal to number of errors', () => {
        const errors = validateDocument({ maxErrors: 3 });
        (0, expectJSON_1.expectJSON)(errors).toDeepEqual([
            invalidFieldError('firstUnknownField'),
            invalidFieldError('secondUnknownField'),
            invalidFieldError('thirdUnknownField'),
        ]);
    });
    (0, mocha_1.it)('when maxErrors is less than number of errors', () => {
        const errors = validateDocument({ maxErrors: 2 });
        (0, expectJSON_1.expectJSON)(errors).toDeepEqual([
            invalidFieldError('firstUnknownField'),
            invalidFieldError('secondUnknownField'),
            {
                message: 'Too many validation errors, error limit reached. Validation aborted.',
            },
        ]);
    });
    (0, mocha_1.it)('passthrough exceptions from rules', () => {
        function customRule() {
            return {
                Field() {
                    throw new Error('Error from custom rule!');
                },
            };
        }
        (0, chai_1.expect)(() => (0, validate_1.validate)(harness_1.testSchema, doc, [customRule], { maxErrors: 1 })).to.throw(/^Error from custom rule!$/);
    });
});
//# sourceMappingURL=validation-test.js.map