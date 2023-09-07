"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const extendSchema_1 = require("../../utilities/extendSchema");
const UniqueDirectivesPerLocationRule_1 = require("../rules/UniqueDirectivesPerLocationRule");
const harness_1 = require("./harness");
const extensionSDL = `
  directive @directive on FIELD | FRAGMENT_DEFINITION
  directive @directiveA on FIELD | FRAGMENT_DEFINITION
  directive @directiveB on FIELD | FRAGMENT_DEFINITION
  directive @repeatable repeatable on FIELD | FRAGMENT_DEFINITION
`;
const schemaWithDirectives = (0, extendSchema_1.extendSchema)(harness_1.testSchema, (0, parser_1.parse)(extensionSDL));
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrorsWithSchema)(schemaWithDirectives, UniqueDirectivesPerLocationRule_1.UniqueDirectivesPerLocationRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueDirectivesPerLocationRule_1.UniqueDirectivesPerLocationRule, sdlStr);
}
(0, mocha_1.describe)('Validate: Directives Are Unique Per Location', () => {
    (0, mocha_1.it)('no directives', () => {
        expectValid(`
      fragment Test on Type {
        field
      }
    `);
    });
    (0, mocha_1.it)('unique directives in different locations', () => {
        expectValid(`
      fragment Test on Type @directiveA {
        field @directiveB
      }
    `);
    });
    (0, mocha_1.it)('unique directives in same locations', () => {
        expectValid(`
      fragment Test on Type @directiveA @directiveB {
        field @directiveA @directiveB
      }
    `);
    });
    (0, mocha_1.it)('same directives in different locations', () => {
        expectValid(`
      fragment Test on Type @directiveA {
        field @directiveA
      }
    `);
    });
    (0, mocha_1.it)('same directives in similar locations', () => {
        expectValid(`
      fragment Test on Type {
        field @directive
        field @directive
      }
    `);
    });
    (0, mocha_1.it)('repeatable directives in same location', () => {
        expectValid(`
      fragment Test on Type @repeatable @repeatable {
        field @repeatable @repeatable
      }
    `);
    });
    (0, mocha_1.it)('unknown directives must be ignored', () => {
        expectValid(`
      type Test @unknown @unknown {
        field: String! @unknown @unknown
      }

      extend type Test @unknown {
        anotherField: String!
      }
    `);
    });
    (0, mocha_1.it)('duplicate directives in one location', () => {
        expectErrors(`
      fragment Test on Type {
        field @directive @directive
      }
    `).toDeepEqual([
            {
                message: 'The directive "@directive" can only be used once at this location.',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 26 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('many duplicate directives in one location', () => {
        expectErrors(`
      fragment Test on Type {
        field @directive @directive @directive
      }
    `).toDeepEqual([
            {
                message: 'The directive "@directive" can only be used once at this location.',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 26 },
                ],
            },
            {
                message: 'The directive "@directive" can only be used once at this location.',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 37 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('different duplicate directives in one location', () => {
        expectErrors(`
      fragment Test on Type {
        field @directiveA @directiveB @directiveA @directiveB
      }
    `).toDeepEqual([
            {
                message: 'The directive "@directiveA" can only be used once at this location.',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 39 },
                ],
            },
            {
                message: 'The directive "@directiveB" can only be used once at this location.',
                locations: [
                    { line: 3, column: 27 },
                    { line: 3, column: 51 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate directives in many locations', () => {
        expectErrors(`
      fragment Test on Type @directive @directive {
        field @directive @directive
      }
    `).toDeepEqual([
            {
                message: 'The directive "@directive" can only be used once at this location.',
                locations: [
                    { line: 2, column: 29 },
                    { line: 2, column: 40 },
                ],
            },
            {
                message: 'The directive "@directive" can only be used once at this location.',
                locations: [
                    { line: 3, column: 15 },
                    { line: 3, column: 26 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate directives on SDL definitions', () => {
        expectSDLErrors(`
      directive @nonRepeatable on
        SCHEMA | SCALAR | OBJECT | INTERFACE | UNION | INPUT_OBJECT

      schema @nonRepeatable @nonRepeatable { query: Dummy }

      scalar TestScalar @nonRepeatable @nonRepeatable
      type TestObject @nonRepeatable @nonRepeatable
      interface TestInterface @nonRepeatable @nonRepeatable
      union TestUnion @nonRepeatable @nonRepeatable
      input TestInput @nonRepeatable @nonRepeatable
    `).toDeepEqual([
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 5, column: 14 },
                    { line: 5, column: 29 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 7, column: 25 },
                    { line: 7, column: 40 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 8, column: 23 },
                    { line: 8, column: 38 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 9, column: 31 },
                    { line: 9, column: 46 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 10, column: 23 },
                    { line: 10, column: 38 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 11, column: 23 },
                    { line: 11, column: 38 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate directives on SDL extensions', () => {
        expectSDLErrors(`
      directive @nonRepeatable on
        SCHEMA | SCALAR | OBJECT | INTERFACE | UNION | INPUT_OBJECT

      extend schema @nonRepeatable @nonRepeatable

      extend scalar TestScalar @nonRepeatable @nonRepeatable
      extend type TestObject @nonRepeatable @nonRepeatable
      extend interface TestInterface @nonRepeatable @nonRepeatable
      extend union TestUnion @nonRepeatable @nonRepeatable
      extend input TestInput @nonRepeatable @nonRepeatable
    `).toDeepEqual([
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 5, column: 21 },
                    { line: 5, column: 36 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 7, column: 32 },
                    { line: 7, column: 47 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 8, column: 30 },
                    { line: 8, column: 45 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 9, column: 38 },
                    { line: 9, column: 53 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 10, column: 30 },
                    { line: 10, column: 45 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 11, column: 30 },
                    { line: 11, column: 45 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate directives between SDL definitions and extensions', () => {
        expectSDLErrors(`
      directive @nonRepeatable on SCHEMA

      schema @nonRepeatable { query: Dummy }
      extend schema @nonRepeatable
    `).toDeepEqual([
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 4, column: 14 },
                    { line: 5, column: 21 },
                ],
            },
        ]);
        expectSDLErrors(`
      directive @nonRepeatable on SCALAR

      scalar TestScalar @nonRepeatable
      extend scalar TestScalar @nonRepeatable
      scalar TestScalar @nonRepeatable
    `).toDeepEqual([
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 4, column: 25 },
                    { line: 5, column: 32 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 4, column: 25 },
                    { line: 6, column: 25 },
                ],
            },
        ]);
        expectSDLErrors(`
      directive @nonRepeatable on OBJECT

      extend type TestObject @nonRepeatable
      type TestObject @nonRepeatable
      extend type TestObject @nonRepeatable
    `).toDeepEqual([
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 4, column: 30 },
                    { line: 5, column: 23 },
                ],
            },
            {
                message: 'The directive "@nonRepeatable" can only be used once at this location.',
                locations: [
                    { line: 4, column: 30 },
                    { line: 6, column: 30 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueDirectivesPerLocationRule-test.js.map