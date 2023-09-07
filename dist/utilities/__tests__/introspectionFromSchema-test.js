"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const buildClientSchema_1 = require("../buildClientSchema");
const introspectionFromSchema_1 = require("../introspectionFromSchema");
const printSchema_1 = require("../printSchema");
function introspectionToSDL(introspection) {
    return (0, printSchema_1.printSchema)((0, buildClientSchema_1.buildClientSchema)(introspection));
}
(0, mocha_1.describe)('introspectionFromSchema', () => {
    const schema = new schema_1.GraphQLSchema({
        description: 'This is a simple schema',
        query: new definition_1.GraphQLObjectType({
            name: 'Simple',
            description: 'This is a simple type',
            fields: {
                string: {
                    type: scalars_1.GraphQLString,
                    description: 'This is a string field',
                },
            },
        }),
    });
    (0, mocha_1.it)('converts a simple schema', () => {
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        (0, chai_1.expect)(introspectionToSDL(introspection)).to.deep.equal((0, dedent_1.dedent) `
      """This is a simple schema"""
      schema {
        query: Simple
      }

      """This is a simple type"""
      type Simple {
        """This is a string field"""
        string: String
      }
    `);
    });
    (0, mocha_1.it)('converts a simple schema without descriptions', () => {
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema, {
            descriptions: false,
        });
        (0, chai_1.expect)(introspectionToSDL(introspection)).to.deep.equal((0, dedent_1.dedent) `
      schema {
        query: Simple
      }

      type Simple {
        string: String
      }
    `);
    });
});
//# sourceMappingURL=introspectionFromSchema-test.js.map