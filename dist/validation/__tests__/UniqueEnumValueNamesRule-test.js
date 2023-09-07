"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const UniqueEnumValueNamesRule_1 = require("../rules/UniqueEnumValueNamesRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueEnumValueNamesRule_1.UniqueEnumValueNamesRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique enum value names', () => {
    (0, mocha_1.it)('no values', () => {
        expectValidSDL(`
      enum SomeEnum
    `);
    });
    (0, mocha_1.it)('one value', () => {
        expectValidSDL(`
      enum SomeEnum {
        FOO
      }
    `);
    });
    (0, mocha_1.it)('multiple values', () => {
        expectValidSDL(`
      enum SomeEnum {
        FOO
        BAR
      }
    `);
    });
    (0, mocha_1.it)('duplicate values inside the same enum definition', () => {
        expectSDLErrors(`
      enum SomeEnum {
        FOO
        BAR
        FOO
      }
    `).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 5, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('extend enum with new value', () => {
        expectValidSDL(`
      enum SomeEnum {
        FOO
      }
      extend enum SomeEnum {
        BAR
      }
      extend enum SomeEnum {
        BAZ
      }
    `);
    });
    (0, mocha_1.it)('extend enum with duplicate value', () => {
        expectSDLErrors(`
      extend enum SomeEnum {
        FOO
      }
      enum SomeEnum {
        FOO
      }
    `).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate value inside extension', () => {
        expectSDLErrors(`
      enum SomeEnum
      extend enum SomeEnum {
        FOO
        BAR
        FOO
      }
    `).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" can only be defined once.',
                locations: [
                    { line: 4, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate value inside different extensions', () => {
        expectSDLErrors(`
      enum SomeEnum
      extend enum SomeEnum {
        FOO
      }
      extend enum SomeEnum {
        FOO
      }
    `).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" can only be defined once.',
                locations: [
                    { line: 4, column: 9 },
                    { line: 7, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('adding new value to the type inside existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('enum SomeEnum');
        const sdl = `
      extend enum SomeEnum {
        FOO
      }
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('adding conflicting value to existing schema twice', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      enum SomeEnum {
        FOO
      }
    `);
        const sdl = `
      extend enum SomeEnum {
        FOO
      }
      extend enum SomeEnum {
        FOO
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'Enum value "SomeEnum.FOO" already exists in the schema. It cannot also be defined in this type extension.',
                locations: [{ line: 6, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('adding enum values to existing schema twice', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('enum SomeEnum');
        const sdl = `
      extend enum SomeEnum {
        FOO
      }
      extend enum SomeEnum {
        FOO
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Enum value "SomeEnum.FOO" can only be defined once.',
                locations: [
                    { line: 3, column: 9 },
                    { line: 6, column: 9 },
                ],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueEnumValueNamesRule-test.js.map