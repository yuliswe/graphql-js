"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const execute_1 = require("../execute");
async function executeQuery(args) {
    const { schema, query, rootValue } = args;
    const document = (0, parser_1.parse)(query);
    const result = (0, execute_1.executeSync)({
        schema,
        document,
        rootValue,
        contextValue: { async: false },
    });
    const asyncResult = await (0, execute_1.execute)({
        schema,
        document,
        rootValue,
        contextValue: { async: true },
    });
    (0, expectJSON_1.expectJSON)(result).toDeepEqual(asyncResult);
    return result;
}
class Dog {
    constructor(name, woofs) {
        this.name = name;
        this.woofs = woofs;
    }
}
class Cat {
    constructor(name, meows) {
        this.name = name;
        this.meows = meows;
    }
}
(0, mocha_1.describe)('Execute: Handles execution of abstract types', () => {
    (0, mocha_1.it)('isTypeOf used to resolve runtime type for Interface', async () => {
        const PetType = new definition_1.GraphQLInterfaceType({
            name: 'Pet',
            fields: {
                name: { type: scalars_1.GraphQLString },
            },
        });
        const DogType = new definition_1.GraphQLObjectType({
            name: 'Dog',
            interfaces: [PetType],
            isTypeOf(obj, context) {
                const isDog = obj instanceof Dog;
                return context.async ? Promise.resolve(isDog) : isDog;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                woofs: { type: scalars_1.GraphQLBoolean },
            },
        });
        const CatType = new definition_1.GraphQLObjectType({
            name: 'Cat',
            interfaces: [PetType],
            isTypeOf(obj, context) {
                const isCat = obj instanceof Cat;
                return context.async ? Promise.resolve(isCat) : isCat;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                meows: { type: scalars_1.GraphQLBoolean },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    pets: {
                        type: new definition_1.GraphQLList(PetType),
                        resolve() {
                            return [new Dog('Odie', true), new Cat('Garfield', false)];
                        },
                    },
                },
            }),
            types: [CatType, DogType],
        });
        const query = `
      {
        pets {
          name
          ... on Dog {
            woofs
          }
          ... on Cat {
            meows
          }
        }
      }
    `;
        (0, chai_1.expect)(await executeQuery({ schema, query })).to.deep.equal({
            data: {
                pets: [
                    {
                        name: 'Odie',
                        woofs: true,
                    },
                    {
                        name: 'Garfield',
                        meows: false,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('isTypeOf can throw', async () => {
        const PetType = new definition_1.GraphQLInterfaceType({
            name: 'Pet',
            fields: {
                name: { type: scalars_1.GraphQLString },
            },
        });
        const DogType = new definition_1.GraphQLObjectType({
            name: 'Dog',
            interfaces: [PetType],
            isTypeOf(_source, context) {
                const error = new Error('We are testing this error');
                if (context.async) {
                    return Promise.reject(error);
                }
                throw error;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                woofs: { type: scalars_1.GraphQLBoolean },
            },
        });
        const CatType = new definition_1.GraphQLObjectType({
            name: 'Cat',
            interfaces: [PetType],
            isTypeOf: undefined,
            fields: {
                name: { type: scalars_1.GraphQLString },
                meows: { type: scalars_1.GraphQLBoolean },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    pets: {
                        type: new definition_1.GraphQLList(PetType),
                        resolve() {
                            return [new Dog('Odie', true), new Cat('Garfield', false)];
                        },
                    },
                },
            }),
            types: [DogType, CatType],
        });
        const query = `
      {
        pets {
          name
          ... on Dog {
            woofs
          }
          ... on Cat {
            meows
          }
        }
      }
    `;
        (0, expectJSON_1.expectJSON)(await executeQuery({ schema, query })).toDeepEqual({
            data: {
                pets: [null, null],
            },
            errors: [
                {
                    message: 'We are testing this error',
                    locations: [{ line: 3, column: 9 }],
                    path: ['pets', 0],
                },
                {
                    message: 'We are testing this error',
                    locations: [{ line: 3, column: 9 }],
                    path: ['pets', 1],
                },
            ],
        });
    });
    (0, mocha_1.it)('isTypeOf can return false', async () => {
        const PetType = new definition_1.GraphQLInterfaceType({
            name: 'Pet',
            fields: {
                name: { type: scalars_1.GraphQLString },
            },
        });
        const DogType = new definition_1.GraphQLObjectType({
            name: 'Dog',
            interfaces: [PetType],
            isTypeOf(_source, context) {
                return context.async ? Promise.resolve(false) : false;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                woofs: { type: scalars_1.GraphQLBoolean },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    pet: {
                        type: PetType,
                        resolve: () => ({}),
                    },
                },
            }),
            types: [DogType],
        });
        const query = `
      {
        pet {
          name
        }
      }
    `;
        (0, expectJSON_1.expectJSON)(await executeQuery({ schema, query })).toDeepEqual({
            data: { pet: null },
            errors: [
                {
                    message: 'Abstract type "Pet" must resolve to an Object type at runtime for field "Query.pet". Either the "Pet" type should provide a "resolveType" function or each possible type should provide an "isTypeOf" function.',
                    locations: [{ line: 3, column: 9 }],
                    path: ['pet'],
                },
            ],
        });
    });
    (0, mocha_1.it)('isTypeOf used to resolve runtime type for Union', async () => {
        const DogType = new definition_1.GraphQLObjectType({
            name: 'Dog',
            isTypeOf(obj, context) {
                const isDog = obj instanceof Dog;
                return context.async ? Promise.resolve(isDog) : isDog;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                woofs: { type: scalars_1.GraphQLBoolean },
            },
        });
        const CatType = new definition_1.GraphQLObjectType({
            name: 'Cat',
            isTypeOf(obj, context) {
                const isCat = obj instanceof Cat;
                return context.async ? Promise.resolve(isCat) : isCat;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
                meows: { type: scalars_1.GraphQLBoolean },
            },
        });
        const PetType = new definition_1.GraphQLUnionType({
            name: 'Pet',
            types: [DogType, CatType],
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    pets: {
                        type: new definition_1.GraphQLList(PetType),
                        resolve() {
                            return [new Dog('Odie', true), new Cat('Garfield', false)];
                        },
                    },
                },
            }),
        });
        const query = `{
      pets {
        ... on Dog {
          name
          woofs
        }
        ... on Cat {
          name
          meows
        }
      }
    }`;
        (0, chai_1.expect)(await executeQuery({ schema, query })).to.deep.equal({
            data: {
                pets: [
                    {
                        name: 'Odie',
                        woofs: true,
                    },
                    {
                        name: 'Garfield',
                        meows: false,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('resolveType can throw', async () => {
        const PetType = new definition_1.GraphQLInterfaceType({
            name: 'Pet',
            resolveType(_source, context) {
                const error = new Error('We are testing this error');
                if (context.async) {
                    return Promise.reject(error);
                }
                throw error;
            },
            fields: {
                name: { type: scalars_1.GraphQLString },
            },
        });
        const DogType = new definition_1.GraphQLObjectType({
            name: 'Dog',
            interfaces: [PetType],
            fields: {
                name: { type: scalars_1.GraphQLString },
                woofs: { type: scalars_1.GraphQLBoolean },
            },
        });
        const CatType = new definition_1.GraphQLObjectType({
            name: 'Cat',
            interfaces: [PetType],
            fields: {
                name: { type: scalars_1.GraphQLString },
                meows: { type: scalars_1.GraphQLBoolean },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    pets: {
                        type: new definition_1.GraphQLList(PetType),
                        resolve() {
                            return [new Dog('Odie', true), new Cat('Garfield', false)];
                        },
                    },
                },
            }),
            types: [CatType, DogType],
        });
        const query = `
      {
        pets {
          name
          ... on Dog {
            woofs
          }
          ... on Cat {
            meows
          }
        }
      }
    `;
        (0, expectJSON_1.expectJSON)(await executeQuery({ schema, query })).toDeepEqual({
            data: {
                pets: [null, null],
            },
            errors: [
                {
                    message: 'We are testing this error',
                    locations: [{ line: 3, column: 9 }],
                    path: ['pets', 0],
                },
                {
                    message: 'We are testing this error',
                    locations: [{ line: 3, column: 9 }],
                    path: ['pets', 1],
                },
            ],
        });
    });
    (0, mocha_1.it)('resolve Union type using __typename on source object', async () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        pets: [Pet]
      }

      union Pet = Cat | Dog

      type Cat {
        name: String
        meows: Boolean
      }

      type Dog {
        name: String
        woofs: Boolean
      }
    `);
        const query = `
      {
        pets {
          name
          ... on Dog {
            woofs
          }
          ... on Cat {
            meows
          }
        }
      }
    `;
        const rootValue = {
            pets: [
                {
                    __typename: 'Dog',
                    name: 'Odie',
                    woofs: true,
                },
                {
                    __typename: 'Cat',
                    name: 'Garfield',
                    meows: false,
                },
            ],
        };
        (0, chai_1.expect)(await executeQuery({ schema, query, rootValue })).to.deep.equal({
            data: {
                pets: [
                    {
                        name: 'Odie',
                        woofs: true,
                    },
                    {
                        name: 'Garfield',
                        meows: false,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('resolve Interface type using __typename on source object', async () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        pets: [Pet]
      }

      interface Pet {
        name: String
        }

      type Cat implements Pet {
        name: String
        meows: Boolean
      }

      type Dog implements Pet {
        name: String
        woofs: Boolean
      }
    `);
        const query = `
      {
        pets {
          name
          ... on Dog {
            woofs
          }
          ... on Cat {
            meows
          }
        }
      }
    `;
        const rootValue = {
            pets: [
                {
                    __typename: 'Dog',
                    name: 'Odie',
                    woofs: true,
                },
                {
                    __typename: 'Cat',
                    name: 'Garfield',
                    meows: false,
                },
            ],
        };
        (0, chai_1.expect)(await executeQuery({ schema, query, rootValue })).to.deep.equal({
            data: {
                pets: [
                    {
                        name: 'Odie',
                        woofs: true,
                    },
                    {
                        name: 'Garfield',
                        meows: false,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('resolveType on Interface yields useful error', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        pet: Pet
      }

      interface Pet {
        name: String
      }

      type Cat implements Pet {
        name: String
      }

      type Dog implements Pet {
        name: String
      }
    `);
        const document = (0, parser_1.parse)(`
      {
        pet {
          name
        }
      }
    `);
        function expectError({ forTypeName }) {
            const rootValue = { pet: { __typename: forTypeName } };
            const result = (0, execute_1.executeSync)({ schema, document, rootValue });
            return {
                toEqual(message) {
                    (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                        data: { pet: null },
                        errors: [
                            {
                                message,
                                locations: [{ line: 3, column: 9 }],
                                path: ['pet'],
                            },
                        ],
                    });
                },
            };
        }
        expectError({ forTypeName: undefined }).toEqual('Abstract type "Pet" must resolve to an Object type at runtime for field "Query.pet". Either the "Pet" type should provide a "resolveType" function or each possible type should provide an "isTypeOf" function.');
        expectError({ forTypeName: 'Human' }).toEqual('Abstract type "Pet" was resolved to a type "Human" that does not exist inside the schema.');
        expectError({ forTypeName: 'String' }).toEqual('Abstract type "Pet" was resolved to a non-object type "String".');
        expectError({ forTypeName: '__Schema' }).toEqual('Runtime Object type "__Schema" is not a possible type for "Pet".');
        // FIXME: workaround since we can't inject resolveType into SDL
        // @ts-expect-error
        (0, definition_1.assertInterfaceType)(schema.getType('Pet')).resolveType = () => [];
        expectError({ forTypeName: undefined }).toEqual('Abstract type "Pet" must resolve to an Object type at runtime for field "Query.pet" with value { __typename: undefined }, received "[]".');
        // FIXME: workaround since we can't inject resolveType into SDL
        // @ts-expect-error
        (0, definition_1.assertInterfaceType)(schema.getType('Pet')).resolveType = () => schema.getType('Cat');
        expectError({ forTypeName: undefined }).toEqual('Support for returning GraphQLObjectType from resolveType was removed in graphql-js@16.0.0 please return type name instead.');
    });
});
//# sourceMappingURL=abstract-test.js.map