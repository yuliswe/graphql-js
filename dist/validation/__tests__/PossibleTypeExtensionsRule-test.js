"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const PossibleTypeExtensionsRule_1 = require("../rules/PossibleTypeExtensionsRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, PossibleTypeExtensionsRule_1.PossibleTypeExtensionsRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Possible type extensions', () => {
    (0, mocha_1.it)('no extensions', () => {
        expectValidSDL(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject
    `);
    });
    (0, mocha_1.it)('one extension per type', () => {
        expectValidSDL(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject

      extend scalar FooScalar @dummy
      extend type FooObject @dummy
      extend interface FooInterface @dummy
      extend union FooUnion @dummy
      extend enum FooEnum @dummy
      extend input FooInputObject @dummy
    `);
    });
    (0, mocha_1.it)('many extensions per type', () => {
        expectValidSDL(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject

      extend scalar FooScalar @dummy
      extend type FooObject @dummy
      extend interface FooInterface @dummy
      extend union FooUnion @dummy
      extend enum FooEnum @dummy
      extend input FooInputObject @dummy

      extend scalar FooScalar @dummy
      extend type FooObject @dummy
      extend interface FooInterface @dummy
      extend union FooUnion @dummy
      extend enum FooEnum @dummy
      extend input FooInputObject @dummy
    `);
    });
    (0, mocha_1.it)('extending unknown type', () => {
        const message = 'Cannot extend type "Unknown" because it is not defined. Did you mean "Known"?';
        expectSDLErrors(`
      type Known

      extend scalar Unknown @dummy
      extend type Unknown @dummy
      extend interface Unknown @dummy
      extend union Unknown @dummy
      extend enum Unknown @dummy
      extend input Unknown @dummy
    `).toDeepEqual([
            { message, locations: [{ line: 4, column: 21 }] },
            { message, locations: [{ line: 5, column: 19 }] },
            { message, locations: [{ line: 6, column: 24 }] },
            { message, locations: [{ line: 7, column: 20 }] },
            { message, locations: [{ line: 8, column: 19 }] },
            { message, locations: [{ line: 9, column: 20 }] },
        ]);
    });
    (0, mocha_1.it)('does not consider non-type definitions', () => {
        const message = 'Cannot extend type "Foo" because it is not defined.';
        expectSDLErrors(`
      query Foo { __typename }
      fragment Foo on Query { __typename }
      directive @Foo on SCHEMA

      extend scalar Foo @dummy
      extend type Foo @dummy
      extend interface Foo @dummy
      extend union Foo @dummy
      extend enum Foo @dummy
      extend input Foo @dummy
    `).toDeepEqual([
            { message, locations: [{ line: 6, column: 21 }] },
            { message, locations: [{ line: 7, column: 19 }] },
            { message, locations: [{ line: 8, column: 24 }] },
            { message, locations: [{ line: 9, column: 20 }] },
            { message, locations: [{ line: 10, column: 19 }] },
            { message, locations: [{ line: 11, column: 20 }] },
        ]);
    });
    (0, mocha_1.it)('extending with different kinds', () => {
        expectSDLErrors(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject

      extend type FooScalar @dummy
      extend interface FooObject @dummy
      extend union FooInterface @dummy
      extend enum FooUnion @dummy
      extend input FooEnum @dummy
      extend scalar FooInputObject @dummy
    `).toDeepEqual([
            {
                message: 'Cannot extend non-object type "FooScalar".',
                locations: [
                    { line: 2, column: 7 },
                    { line: 9, column: 7 },
                ],
            },
            {
                message: 'Cannot extend non-interface type "FooObject".',
                locations: [
                    { line: 3, column: 7 },
                    { line: 10, column: 7 },
                ],
            },
            {
                message: 'Cannot extend non-union type "FooInterface".',
                locations: [
                    { line: 4, column: 7 },
                    { line: 11, column: 7 },
                ],
            },
            {
                message: 'Cannot extend non-enum type "FooUnion".',
                locations: [
                    { line: 5, column: 7 },
                    { line: 12, column: 7 },
                ],
            },
            {
                message: 'Cannot extend non-input object type "FooEnum".',
                locations: [
                    { line: 6, column: 7 },
                    { line: 13, column: 7 },
                ],
            },
            {
                message: 'Cannot extend non-scalar type "FooInputObject".',
                locations: [
                    { line: 7, column: 7 },
                    { line: 14, column: 7 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('extending types within existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject
    `);
        const sdl = `
      extend scalar FooScalar @dummy
      extend type FooObject @dummy
      extend interface FooInterface @dummy
      extend union FooUnion @dummy
      extend enum FooEnum @dummy
      extend input FooInputObject @dummy
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('extending unknown types within existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Known');
        const sdl = `
      extend scalar Unknown @dummy
      extend type Unknown @dummy
      extend interface Unknown @dummy
      extend union Unknown @dummy
      extend enum Unknown @dummy
      extend input Unknown @dummy
    `;
        const message = 'Cannot extend type "Unknown" because it is not defined. Did you mean "Known"?';
        expectSDLErrors(sdl, schema).toDeepEqual([
            { message, locations: [{ line: 2, column: 21 }] },
            { message, locations: [{ line: 3, column: 19 }] },
            { message, locations: [{ line: 4, column: 24 }] },
            { message, locations: [{ line: 5, column: 20 }] },
            { message, locations: [{ line: 6, column: 19 }] },
            { message, locations: [{ line: 7, column: 20 }] },
        ]);
    });
    (0, mocha_1.it)('extending types with different kinds within existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      scalar FooScalar
      type FooObject
      interface FooInterface
      union FooUnion
      enum FooEnum
      input FooInputObject
    `);
        const sdl = `
      extend type FooScalar @dummy
      extend interface FooObject @dummy
      extend union FooInterface @dummy
      extend enum FooUnion @dummy
      extend input FooEnum @dummy
      extend scalar FooInputObject @dummy
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Cannot extend non-object type "FooScalar".',
                locations: [{ line: 2, column: 7 }],
            },
            {
                message: 'Cannot extend non-interface type "FooObject".',
                locations: [{ line: 3, column: 7 }],
            },
            {
                message: 'Cannot extend non-union type "FooInterface".',
                locations: [{ line: 4, column: 7 }],
            },
            {
                message: 'Cannot extend non-enum type "FooUnion".',
                locations: [{ line: 5, column: 7 }],
            },
            {
                message: 'Cannot extend non-input object type "FooEnum".',
                locations: [{ line: 6, column: 7 }],
            },
            {
                message: 'Cannot extend non-scalar type "FooInputObject".',
                locations: [{ line: 7, column: 7 }],
            },
        ]);
    });
});
//# sourceMappingURL=PossibleTypeExtensionsRule-test.js.map