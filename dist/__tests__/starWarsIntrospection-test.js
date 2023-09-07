"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const graphql_1 = require("../graphql");
const starWarsSchema_1 = require("./starWarsSchema");
function queryStarWars(source) {
    const result = (0, graphql_1.graphqlSync)({ schema: starWarsSchema_1.StarWarsSchema, source });
    (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['data']);
    return result.data;
}
(0, mocha_1.describe)('Star Wars Introspection Tests', () => {
    (0, mocha_1.describe)('Basic Introspection', () => {
        (0, mocha_1.it)('Allows querying the schema for types', () => {
            const data = queryStarWars(`
        {
          __schema {
            types {
              name
            }
          }
        }
      `);
            // Include all types used by StarWars schema, introspection types and
            // standard directives. For example, `Boolean` is used in `@skip`,
            // `@include` and also inside introspection types.
            (0, chai_1.expect)(data).to.deep.equal({
                __schema: {
                    types: [
                        { name: 'Human' },
                        { name: 'Character' },
                        { name: 'String' },
                        { name: 'Episode' },
                        { name: 'Droid' },
                        { name: 'Query' },
                        { name: 'Boolean' },
                        { name: '__Schema' },
                        { name: '__Type' },
                        { name: '__TypeKind' },
                        { name: '__Field' },
                        { name: '__InputValue' },
                        { name: '__EnumValue' },
                        { name: '__Directive' },
                        { name: '__DirectiveLocation' },
                    ],
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for query type', () => {
            const data = queryStarWars(`
        {
          __schema {
            queryType {
              name
            }
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __schema: {
                    queryType: {
                        name: 'Query',
                    },
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for a specific type', () => {
            const data = queryStarWars(`
        {
          __type(name: "Droid") {
            name
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Droid',
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for an object kind', () => {
            const data = queryStarWars(`
        {
          __type(name: "Droid") {
            name
            kind
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Droid',
                    kind: 'OBJECT',
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for an interface kind', () => {
            const data = queryStarWars(`
        {
          __type(name: "Character") {
            name
            kind
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Character',
                    kind: 'INTERFACE',
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for object fields', () => {
            const data = queryStarWars(`
        {
          __type(name: "Droid") {
            name
            fields {
              name
              type {
                name
                kind
              }
            }
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Droid',
                    fields: [
                        {
                            name: 'id',
                            type: { name: null, kind: 'NON_NULL' },
                        },
                        {
                            name: 'name',
                            type: { name: 'String', kind: 'SCALAR' },
                        },
                        {
                            name: 'friends',
                            type: { name: null, kind: 'LIST' },
                        },
                        {
                            name: 'appearsIn',
                            type: { name: null, kind: 'LIST' },
                        },
                        {
                            name: 'secretBackstory',
                            type: { name: 'String', kind: 'SCALAR' },
                        },
                        {
                            name: 'primaryFunction',
                            type: { name: 'String', kind: 'SCALAR' },
                        },
                    ],
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for nested object fields', () => {
            const data = queryStarWars(`
        {
          __type(name: "Droid") {
            name
            fields {
              name
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Droid',
                    fields: [
                        {
                            name: 'id',
                            type: {
                                name: null,
                                kind: 'NON_NULL',
                                ofType: {
                                    name: 'String',
                                    kind: 'SCALAR',
                                },
                            },
                        },
                        {
                            name: 'name',
                            type: {
                                name: 'String',
                                kind: 'SCALAR',
                                ofType: null,
                            },
                        },
                        {
                            name: 'friends',
                            type: {
                                name: null,
                                kind: 'LIST',
                                ofType: {
                                    name: 'Character',
                                    kind: 'INTERFACE',
                                },
                            },
                        },
                        {
                            name: 'appearsIn',
                            type: {
                                name: null,
                                kind: 'LIST',
                                ofType: {
                                    name: 'Episode',
                                    kind: 'ENUM',
                                },
                            },
                        },
                        {
                            name: 'secretBackstory',
                            type: {
                                name: 'String',
                                kind: 'SCALAR',
                                ofType: null,
                            },
                        },
                        {
                            name: 'primaryFunction',
                            type: {
                                name: 'String',
                                kind: 'SCALAR',
                                ofType: null,
                            },
                        },
                    ],
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for field args', () => {
            const data = queryStarWars(`
        {
          __schema {
            queryType {
              fields {
                name
                args {
                  name
                  description
                  type {
                    name
                    kind
                    ofType {
                      name
                      kind
                    }
                  }
                  defaultValue
                }
              }
            }
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __schema: {
                    queryType: {
                        fields: [
                            {
                                name: 'hero',
                                args: [
                                    {
                                        defaultValue: null,
                                        description: 'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
                                        name: 'episode',
                                        type: {
                                            kind: 'ENUM',
                                            name: 'Episode',
                                            ofType: null,
                                        },
                                    },
                                ],
                            },
                            {
                                name: 'human',
                                args: [
                                    {
                                        name: 'id',
                                        description: 'id of the human',
                                        type: {
                                            kind: 'NON_NULL',
                                            name: null,
                                            ofType: {
                                                kind: 'SCALAR',
                                                name: 'String',
                                            },
                                        },
                                        defaultValue: null,
                                    },
                                ],
                            },
                            {
                                name: 'droid',
                                args: [
                                    {
                                        name: 'id',
                                        description: 'id of the droid',
                                        type: {
                                            kind: 'NON_NULL',
                                            name: null,
                                            ofType: {
                                                kind: 'SCALAR',
                                                name: 'String',
                                            },
                                        },
                                        defaultValue: null,
                                    },
                                ],
                            },
                        ],
                    },
                },
            });
        });
        (0, mocha_1.it)('Allows querying the schema for documentation', () => {
            const data = queryStarWars(`
        {
          __type(name: "Droid") {
            name
            description
          }
        }
      `);
            (0, chai_1.expect)(data).to.deep.equal({
                __type: {
                    name: 'Droid',
                    description: 'A mechanical creature in the Star Wars universe.',
                },
            });
        });
    });
});
//# sourceMappingURL=starWarsIntrospection-test.js.map