"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const LoneSchemaDefinitionRule_1 = require("../rules/LoneSchemaDefinitionRule");
const harness_1 = require("./harness");
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, LoneSchemaDefinitionRule_1.LoneSchemaDefinitionRule, sdlStr);
}
function expectValidSDL(sdlStr, schema) {
    expectSDLErrors(sdlStr, schema).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Schema definition should be alone', () => {
    (0, mocha_1.it)('no schema', () => {
        expectValidSDL(`
      type Query {
        foo: String
      }
    `);
    });
    (0, mocha_1.it)('one schema definition', () => {
        expectValidSDL(`
      schema {
        query: Foo
      }

      type Foo {
        foo: String
      }
    `);
    });
    (0, mocha_1.it)('multiple schema definitions', () => {
        expectSDLErrors(`
      schema {
        query: Foo
      }

      type Foo {
        foo: String
      }

      schema {
        mutation: Foo
      }

      schema {
        subscription: Foo
      }
    `).toDeepEqual([
            {
                message: 'Must provide only one schema definition.',
                locations: [{ line: 10, column: 7 }],
            },
            {
                message: 'Must provide only one schema definition.',
                locations: [{ line: 14, column: 7 }],
            },
        ]);
    });
    (0, mocha_1.it)('define schema in schema extension', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Foo {
        foo: String
      }
    `);
        expectSDLErrors(`
        schema {
          query: Foo
        }
      `, schema).toDeepEqual([]);
    });
    (0, mocha_1.it)('redefine schema in schema extension', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      schema {
        query: Foo
      }

      type Foo {
        foo: String
      }
    `);
        expectSDLErrors(`
        schema {
          mutation: Foo
        }
      `, schema).toDeepEqual([
            {
                message: 'Cannot define a new schema within a schema extension.',
                locations: [{ line: 2, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('redefine implicit schema in schema extension', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        fooField: Foo
      }

      type Foo {
        foo: String
      }
    `);
        expectSDLErrors(`
        schema {
          mutation: Foo
        }
      `, schema).toDeepEqual([
            {
                message: 'Cannot define a new schema within a schema extension.',
                locations: [{ line: 2, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('extend schema in schema extension', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        fooField: Foo
      }

      type Foo {
        foo: String
      }
    `);
        expectValidSDL(`
        extend schema {
          mutation: Foo
        }
      `, schema);
    });
});
//# sourceMappingURL=LoneSchemaDefinitionRule-test.js.map