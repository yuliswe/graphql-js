"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const UniqueOperationTypesRule_1 = require("../rules/UniqueOperationTypesRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, UniqueOperationTypesRule_1.UniqueOperationTypesRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Unique operation types', () => {
    (0, mocha_1.it)('no schema definition', () => {
        expectValidSDL(`
      type Foo
    `);
    });
    (0, mocha_1.it)('schema definition with all types', () => {
        expectValidSDL(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `);
    });
    (0, mocha_1.it)('schema definition with single extension', () => {
        expectValidSDL(`
      type Foo

      schema { query: Foo }

      extend schema {
        mutation: Foo
        subscription: Foo
      }
    `);
    });
    (0, mocha_1.it)('schema definition with separate extensions', () => {
        expectValidSDL(`
      type Foo

      schema { query: Foo }
      extend schema { mutation: Foo }
      extend schema { subscription: Foo }
    `);
    });
    (0, mocha_1.it)('extend schema before definition', () => {
        expectValidSDL(`
      type Foo

      extend schema { mutation: Foo }
      extend schema { subscription: Foo }

      schema { query: Foo }
    `);
    });
    (0, mocha_1.it)('duplicate operation types inside single schema definition', () => {
        expectSDLErrors(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo

        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `).toDeepEqual([
            {
                message: 'There can be only one query type in schema.',
                locations: [
                    { line: 5, column: 9 },
                    { line: 9, column: 9 },
                ],
            },
            {
                message: 'There can be only one mutation type in schema.',
                locations: [
                    { line: 6, column: 9 },
                    { line: 10, column: 9 },
                ],
            },
            {
                message: 'There can be only one subscription type in schema.',
                locations: [
                    { line: 7, column: 9 },
                    { line: 11, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate operation types inside schema extension', () => {
        expectSDLErrors(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }

      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `).toDeepEqual([
            {
                message: 'There can be only one query type in schema.',
                locations: [
                    { line: 5, column: 9 },
                    { line: 11, column: 9 },
                ],
            },
            {
                message: 'There can be only one mutation type in schema.',
                locations: [
                    { line: 6, column: 9 },
                    { line: 12, column: 9 },
                ],
            },
            {
                message: 'There can be only one subscription type in schema.',
                locations: [
                    { line: 7, column: 9 },
                    { line: 13, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate operation types inside schema extension twice', () => {
        expectSDLErrors(`
      type Foo

      schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }

      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }

      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `).toDeepEqual([
            {
                message: 'There can be only one query type in schema.',
                locations: [
                    { line: 5, column: 9 },
                    { line: 11, column: 9 },
                ],
            },
            {
                message: 'There can be only one mutation type in schema.',
                locations: [
                    { line: 6, column: 9 },
                    { line: 12, column: 9 },
                ],
            },
            {
                message: 'There can be only one subscription type in schema.',
                locations: [
                    { line: 7, column: 9 },
                    { line: 13, column: 9 },
                ],
            },
            {
                message: 'There can be only one query type in schema.',
                locations: [
                    { line: 5, column: 9 },
                    { line: 17, column: 9 },
                ],
            },
            {
                message: 'There can be only one mutation type in schema.',
                locations: [
                    { line: 6, column: 9 },
                    { line: 18, column: 9 },
                ],
            },
            {
                message: 'There can be only one subscription type in schema.',
                locations: [
                    { line: 7, column: 9 },
                    { line: 19, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('duplicate operation types inside second schema extension', () => {
        expectSDLErrors(`
      type Foo

      schema {
        query: Foo
      }

      extend schema {
        mutation: Foo
        subscription: Foo
      }

      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `).toDeepEqual([
            {
                message: 'There can be only one query type in schema.',
                locations: [
                    { line: 5, column: 9 },
                    { line: 14, column: 9 },
                ],
            },
            {
                message: 'There can be only one mutation type in schema.',
                locations: [
                    { line: 9, column: 9 },
                    { line: 15, column: 9 },
                ],
            },
            {
                message: 'There can be only one subscription type in schema.',
                locations: [
                    { line: 10, column: 9 },
                    { line: 16, column: 9 },
                ],
            },
        ]);
    });
    (0, mocha_1.it)('define schema inside extension SDL', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Foo');
        const sdl = `
      schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('define and extend schema inside extension SDL', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Foo');
        const sdl = `
      schema { query: Foo }
      extend schema { mutation: Foo }
      extend schema { subscription: Foo }
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('adding new operation types to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        const sdl = `
      extend schema { mutation: Foo }
      extend schema { subscription: Foo }
    `;
        expectValidSDL(sdl, schema);
    });
    (0, mocha_1.it)('adding conflicting operation types to existing schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query
      type Mutation
      type Subscription

      type Foo
    `);
        const sdl = `
      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Type for query already defined in the schema. It cannot be redefined.',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'Type for mutation already defined in the schema. It cannot be redefined.',
                locations: [{ line: 4, column: 9 }],
            },
            {
                message: 'Type for subscription already defined in the schema. It cannot be redefined.',
                locations: [{ line: 5, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('adding conflicting operation types to existing schema twice', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query
      type Mutation
      type Subscription
    `);
        const sdl = `
      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }

      extend schema {
        query: Foo
        mutation: Foo
        subscription: Foo
      }
    `;
        expectSDLErrors(sdl, schema).toDeepEqual([
            {
                message: 'Type for query already defined in the schema. It cannot be redefined.',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'Type for mutation already defined in the schema. It cannot be redefined.',
                locations: [{ line: 4, column: 9 }],
            },
            {
                message: 'Type for subscription already defined in the schema. It cannot be redefined.',
                locations: [{ line: 5, column: 9 }],
            },
            {
                message: 'Type for query already defined in the schema. It cannot be redefined.',
                locations: [{ line: 9, column: 9 }],
            },
            {
                message: 'Type for mutation already defined in the schema. It cannot be redefined.',
                locations: [{ line: 10, column: 9 }],
            },
            {
                message: 'Type for subscription already defined in the schema. It cannot be redefined.',
                locations: [{ line: 11, column: 9 }],
            },
        ]);
    });
});
//# sourceMappingURL=UniqueOperationTypesRule-test.js.map