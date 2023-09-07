"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const UniqueDirectiveNamesRule_1 = require("../rules/UniqueDirectiveNamesRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueDirectiveNamesRule_1.UniqueDirectiveNamesRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique directive names', () => {
    (0, mocha_1.it)('no directive', () => {
        expectValidSDL(`
      type Foo
    `);
    });
    (0, mocha_1.it)('one directive', () => {
        expectValidSDL(`
      directive @foo on SCHEMA
    `);
    });
    (0, mocha_1.it)('many directives', () => {
        expectValidSDL(`
      directive @foo on SCHEMA
      directive @bar on SCHEMA
      directive @baz on SCHEMA
    `);
    });
    (0, mocha_1.it)('directive and non-directive definitions named the same', () => {
        expectValidSDL(`
      query foo { __typename }
      fragment foo on foo { __typename }
      type foo

      directive @foo on SCHEMA
    `);
    });
    (0, mocha_1.it)('directives named the same', () => {
        expectSDLErrors(`
      directive @foo on SCHEMA

      directive @foo on SCHEMA
    `).toDeepEqual([
            {
                message: 'There can be only one directive named "@foo".',
                locations: [
                    { line: 2, column: 18 },
                    { line: 4, column: 18 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('adding new directive to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('directive @foo on SCHEMA');
        expectValidSDL('directive @bar on SCHEMA', schema);
    });
    (0, mocha_1.it)('adding new directive with standard name to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type foo');
        expectSDLErrors('directive @skip on SCHEMA', schema).toDeepEqual([
            {
                message: 'Directive "@skip" already exists in the schema. It cannot be redefined.',
                locations: [{ line: 1, column: 12 }],
            },
        ]);
    });
    (0, mocha_1.it)('adding new directive to existing schema with same-named type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type foo');
        expectValidSDL('directive @foo on SCHEMA', schema);
    });
    (0, mocha_1.it)('adding conflicting directives to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('directive @foo on SCHEMA');
        expectSDLErrors('directive @foo on SCHEMA', schema).toDeepEqual([
            {
                message: 'Directive "@foo" already exists in the schema. It cannot be redefined.',
                locations: [{ line: 1, column: 12 }],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueDirectiveNamesRule-test.js.map