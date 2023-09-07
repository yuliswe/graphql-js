"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const UniqueTypeNamesRule_1 = require("../rules/UniqueTypeNamesRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueTypeNamesRule_1.UniqueTypeNamesRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique type names', () => {
    (0, mocha_1.it)('no types', () => {
        expectValidSDL(`
      directive @test on SCHEMA
    `);
    });
    (0, mocha_1.it)('one type', () => {
        expectValidSDL(`
      type Foo
    `);
    });
    (0, mocha_1.it)('many types', () => {
        expectValidSDL(`
      type Foo
      type Bar
      type Baz
    `);
    });
    (0, mocha_1.it)('type and non-type definitions named the same', () => {
        expectValidSDL(`
      query Foo { __typename }
      fragment Foo on Query { __typename }
      directive @Foo on SCHEMA

      type Foo
    `);
    });
    (0, mocha_1.it)('types named the same', () => {
        expectSDLErrors(`
      type Foo

      scalar Foo
      type Foo
      interface Foo
      union Foo
      enum Foo
      input Foo
    `).toDeepEqual([
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 4, column: 14 },
                ],
            },
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 5, column: 12 },
                ],
            },
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 6, column: 17 },
                ],
            },
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 7, column: 13 },
                ],
            },
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 8, column: 12 },
                ],
            },
            {
                message: 'There can be only one type named "Foo".',
                locations: [
                    { line: 2, column: 12 },
                    { line: 9, column: 13 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('adding new type to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Foo');
        expectValidSDL('type Bar', schema);
    });
    (0, mocha_1.it)('adding new type to existing schema with same-named directive', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('directive @Foo on SCHEMA');
        expectValidSDL('type Foo', schema);
    });
    (0, mocha_1.it)('adding conflicting types to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Foo');
        const sdl = `
      scalar Foo
      type Foo
      interface Foo
      union Foo
      enum Foo
      input Foo
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 2, column: 14 }],
            },
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 3, column: 12 }],
            },
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 4, column: 17 }],
            },
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 5, column: 13 }],
            },
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 6, column: 12 }],
            },
            {
                message: 'Type "Foo" already exists in the schema. It cannot also be defined in this type definition.',
                locations: [{ line: 7, column: 13 }],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueTypeNamesRule-test.js.map