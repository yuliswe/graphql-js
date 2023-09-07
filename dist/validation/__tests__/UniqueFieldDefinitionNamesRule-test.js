"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const UniqueFieldDefinitionNamesRule_1 = require("../rules/UniqueFieldDefinitionNamesRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueFieldDefinitionNamesRule_1.UniqueFieldDefinitionNamesRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique field definition names', () => {
    (0, mocha_1.it)('no fields', () => {
        expectValidSDL(`
      type SomeObject
      interface SomeInterface
      input SomeInputObject
    `);
    });
    (0, mocha_1.it)('one field', () => {
        expectValidSDL(`
      type SomeObject {
        foo: String
      }

      interface SomeInterface {
        foo: String
      }

      input SomeInputObject {
        foo: String
      }
    `);
    });
    (0, mocha_1.it)('multiple fields', () => {
        expectValidSDL(`
      type SomeObject {
        foo: String
        bar: String
      }

      interface SomeInterface {
        foo: String
        bar: String
      }

      input SomeInputObject {
        foo: String
        bar: String
      }
    `);
    });
    (0, mocha_1.it)('duplicate fields inside the same type definition', () => {
        expectSDLErrors(`
      type SomeObject {
        foo: String
        bar: String
        foo: String
      }

      interface SomeInterface {
        foo: String
        bar: String
        foo: String
      }

      input SomeInputObject {
        foo: String
        bar: String
        foo: String
      }
    `).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 5, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInterface.foo" can only be defined once.',
                locations: [
                    { line: 9, column: 9 },
                    { line: 11, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInputObject.foo" can only be defined once.',
                locations: [
                    { line: 15, column: 9 },
                    { line: 17, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('extend type with new field', () => {
        expectValidSDL(`
      type SomeObject {
        foo: String
      }
      extend type SomeObject {
        bar: String
      }
      extend type SomeObject {
        baz: String
      }

      interface SomeInterface {
        foo: String
      }
      extend interface SomeInterface {
        bar: String
      }
      extend interface SomeInterface {
        baz: String
      }

      input SomeInputObject {
        foo: String
      }
      extend input SomeInputObject {
        bar: String
      }
      extend input SomeInputObject {
        baz: String
      }
    `);
    });
    (0, mocha_1.it)('extend type with duplicate field', () => {
        expectSDLErrors(`
      extend type SomeObject {
        foo: String
      }
      type SomeObject {
        foo: String
      }

      extend interface SomeInterface {
        foo: String
      }
      interface SomeInterface {
        foo: String
      }

      extend input SomeInputObject {
        foo: String
      }
      input SomeInputObject {
        foo: String
      }
    `).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInterface.foo" can only be defined once.',
                locations: [
                    { line: 10, column: 9 },
                    { line: 13, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInputObject.foo" can only be defined once.',
                locations: [
                    { line: 17, column: 9 },
                    { line: 20, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate field inside extension', () => {
        expectSDLErrors(`
      type SomeObject
      extend type SomeObject {
        foo: String
        bar: String
        foo: String
      }

      interface SomeInterface
      extend interface SomeInterface {
        foo: String
        bar: String
        foo: String
      }

      input SomeInputObject
      extend input SomeInputObject {
        foo: String
        bar: String
        foo: String
      }
    `).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" can only be defined once.',
                locations: [
                    { line: 4, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInterface.foo" can only be defined once.',
                locations: [
                    { line: 11, column: 9 },
                    { line: 13, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInputObject.foo" can only be defined once.',
                locations: [
                    { line: 18, column: 9 },
                    { line: 20, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate field inside different extensions', () => {
        expectSDLErrors(`
      type SomeObject
      extend type SomeObject {
        foo: String
      }
      extend type SomeObject {
        foo: String
      }

      interface SomeInterface
      extend interface SomeInterface {
        foo: String
      }
      extend interface SomeInterface {
        foo: String
      }

      input SomeInputObject
      extend input SomeInputObject {
        foo: String
      }
      extend input SomeInputObject {
        foo: String
      }
    `).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" can only be defined once.',
                locations: [
                    { line: 4, column: 9 },
                    { line: 7, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInterface.foo" can only be defined once.',
                locations: [
                    { line: 12, column: 9 },
                    { line: 15, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInputObject.foo" can only be defined once.',
                locations: [
                    { line: 20, column: 9 },
                    { line: 23, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('adding new field to the type inside existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type SomeObject
      interface SomeInterface
      input SomeInputObject
    `);
        const sdl = `
      extend type SomeObject {
        foo: String
      }

      extend interface SomeInterface {
        foo: String
      }

      extend input SomeInputObject {
        foo: String
      }
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('adding conflicting fields to existing schema twice', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type SomeObject {
        foo: String
      }

      interface SomeInterface {
        foo: String
      }

      input SomeInputObject {
        foo: String
      }
    `);
        const sdl = `
      extend type SomeObject {
        foo: String
      }
      extend interface SomeInterface {
        foo: String
      }
      extend input SomeInputObject {
        foo: String
      }

      extend type SomeObject {
        foo: String
      }
      extend interface SomeInterface {
        foo: String
      }
      extend input SomeInputObject {
        foo: String
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'Field "SomeInterface.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 6, column: 9 }],
            },
            {
                message: 'Field "SomeInputObject.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 9, column: 9 }],
            },
            {
                message: 'Field "SomeObject.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 13, column: 9 }],
            },
            {
                message: 'Field "SomeInterface.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 16, column: 9 }],
            },
            {
                message: 'Field "SomeInputObject.foo" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 19, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('adding fields to existing schema twice', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type SomeObject
      interface SomeInterface
      input SomeInputObject
    `);
        const sdl = `
      extend type SomeObject {
        foo: String
      }
      extend type SomeObject {
        foo: String
      }

      extend interface SomeInterface {
        foo: String
      }
      extend interface SomeInterface {
        foo: String
      }

      extend input SomeInputObject {
        foo: String
      }
      extend input SomeInputObject {
        foo: String
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Field "SomeObject.foo" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInterface.foo" can only be defined once.',
                locations: [
                    { line: 10, column: 9 },
                    { line: 13, column: 9 },
                ],
            },
            {
                message: 'Field "SomeInputObject.foo" can only be defined once.',
                locations: [
                    { line: 17, column: 9 },
                    { line: 20, column: 9 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueFieldDefinitionNamesRule-test.js.map