"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
class Dog {
    constructor(name, barks) {
        this.name = name;
        this.barks = barks;
        this.progeny = [];
    }
}
class Cat {
    constructor(name, meows) {
        this.name = name;
        this.meows = meows;
        this.progeny = [];
    }
}
class Person {
    constructor(name, pets, friends) {
        this.name = name;
        this.pets = pets;
        this.friends = friends;
    }
}
const NamedType = new definition_1.GraphQLInterfaceType({
    name: 'Named',
    fields: {
        name: { type: scalars_1.GraphQLString },
    },
});
const LifeType = new definition_1.GraphQLInterfaceType({
    name: 'Life',
    fields: () => ({
        progeny: { type: new definition_1.GraphQLList(LifeType) },
    }),
});
const MammalType = new definition_1.GraphQLInterfaceType({
    name: 'Mammal',
    interfaces: [LifeType],
    fields: () => ({
        progeny: { type: new definition_1.GraphQLList(MammalType) },
        mother: { type: MammalType },
        father: { type: MammalType },
    }),
});
const DogType = new definition_1.GraphQLObjectType({
    name: 'Dog',
    interfaces: [MammalType, LifeType, NamedType],
    fields: () => ({
        name: { type: scalars_1.GraphQLString },
        barks: { type: scalars_1.GraphQLBoolean },
        progeny: { type: new definition_1.GraphQLList(DogType) },
        mother: { type: DogType },
        father: { type: DogType },
    }),
    isTypeOf: (value) => value instanceof Dog,
});
const CatType = new definition_1.GraphQLObjectType({
    name: 'Cat',
    interfaces: [MammalType, LifeType, NamedType],
    fields: () => ({
        name: { type: scalars_1.GraphQLString },
        meows: { type: scalars_1.GraphQLBoolean },
        progeny: { type: new definition_1.GraphQLList(CatType) },
        mother: { type: CatType },
        father: { type: CatType },
    }),
    isTypeOf: (value) => value instanceof Cat,
});
const PetType = new definition_1.GraphQLUnionType({
    name: 'Pet',
    types: [DogType, CatType],
    resolveType(value) {
        if (value instanceof Dog) {
            return DogType.name;
        }
        if (value instanceof Cat) {
            return CatType.name;
        }
        /* c8 ignore next 3 */
        // Not reachable, all possible types have been considered.
        chai_1.expect.fail('Not reachable');
    },
});
const PersonType = new definition_1.GraphQLObjectType({
    name: 'Person',
    interfaces: [NamedType, MammalType, LifeType],
    fields: () => ({
        name: { type: scalars_1.GraphQLString },
        pets: { type: new definition_1.GraphQLList(PetType) },
        friends: { type: new definition_1.GraphQLList(NamedType) },
        progeny: { type: new definition_1.GraphQLList(PersonType) },
        mother: { type: PersonType },
        father: { type: PersonType },
    }),
    isTypeOf: (value) => value instanceof Person,
});
const schema = new schema_1.GraphQLSchema({
    query: PersonType,
    types: [PetType],
});
const garfield = new Cat('Garfield', false);
garfield.mother = new Cat("Garfield's Mom", false);
garfield.mother.progeny = [garfield];
const odie = new Dog('Odie', true);
odie.mother = new Dog("Odie's Mom", true);
odie.mother.progeny = [odie];
const liz = new Person('Liz');
const john = new Person('John', [garfield, odie], [liz, odie]);
(0, mocha_1.describe)('Execute: Union and intersection types', () => {
    (0, mocha_1.it)('can introspect on union and intersection types', () => {
        const document = (0, parser_1.parse)(`
      {
        Named: __type(name: "Named") {
          kind
          name
          fields { name }
          interfaces { name }
          possibleTypes { name }
          enumValues { name }
          inputFields { name }
        }
        Mammal: __type(name: "Mammal") {
          kind
          name
          fields { name }
          interfaces { name }
          possibleTypes { name }
          enumValues { name }
          inputFields { name }
        }
        Pet: __type(name: "Pet") {
          kind
          name
          fields { name }
          interfaces { name }
          possibleTypes { name }
          enumValues { name }
          inputFields { name }
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document })).to.deep.equal({
            data: {
                Named: {
                    kind: 'INTERFACE',
                    name: 'Named',
                    fields: [{ name: 'name' }],
                    interfaces: [],
                    possibleTypes: [{ name: 'Dog' }, { name: 'Cat' }, { name: 'Person' }],
                    enumValues: null,
                    inputFields: null,
                },
                Mammal: {
                    kind: 'INTERFACE',
                    name: 'Mammal',
                    fields: [{ name: 'progeny' }, { name: 'mother' }, { name: 'father' }],
                    interfaces: [{ name: 'Life' }],
                    possibleTypes: [{ name: 'Dog' }, { name: 'Cat' }, { name: 'Person' }],
                    enumValues: null,
                    inputFields: null,
                },
                Pet: {
                    kind: 'UNION',
                    name: 'Pet',
                    fields: null,
                    interfaces: null,
                    possibleTypes: [{ name: 'Dog' }, { name: 'Cat' }],
                    enumValues: null,
                    inputFields: null,
                },
            },
        });
    });
    (0, mocha_1.it)('executes using union types', () => {
        // NOTE: This is an *invalid* query, but it should be an *executable* query.
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        pets {
          __typename
          name
          barks
          meows
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                pets: [
                    {
                        __typename: 'Cat',
                        name: 'Garfield',
                        meows: false,
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('executes union types with inline fragments', () => {
        // This is the valid version of the query in the above test.
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        pets {
          __typename
          ... on Dog {
            name
            barks
          }
          ... on Cat {
            name
            meows
          }
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                pets: [
                    {
                        __typename: 'Cat',
                        name: 'Garfield',
                        meows: false,
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('executes using interface types', () => {
        // NOTE: This is an *invalid* query, but it should be an *executable* query.
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        friends {
          __typename
          name
          barks
          meows
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                friends: [
                    { __typename: 'Person', name: 'Liz' },
                    { __typename: 'Dog', name: 'Odie', barks: true },
                ],
            },
        });
    });
    (0, mocha_1.it)('executes interface types with inline fragments', () => {
        // This is the valid version of the query in the above test.
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        friends {
          __typename
          name
          ... on Dog {
            barks
          }
          ... on Cat {
            meows
          }

          ... on Mammal {
            mother {
              __typename
              ... on Dog {
                name
                barks
              }
              ... on Cat {
                name
                meows
              }
            }
          }
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                friends: [
                    {
                        __typename: 'Person',
                        name: 'Liz',
                        mother: null,
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                        mother: { __typename: 'Dog', name: "Odie's Mom", barks: true },
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('executes interface types with named fragments', () => {
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        friends {
          __typename
          name
          ...DogBarks
          ...CatMeows
        }
      }

      fragment  DogBarks on Dog {
        barks
      }

      fragment  CatMeows on Cat {
        meows
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                friends: [
                    {
                        __typename: 'Person',
                        name: 'Liz',
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('allows fragment conditions to be abstract types', () => {
        const document = (0, parser_1.parse)(`
      {
        __typename
        name
        pets {
          ...PetFields,
          ...on Mammal {
            mother {
              ...ProgenyFields
            }
          }
        }
        friends { ...FriendFields }
      }

      fragment PetFields on Pet {
        __typename
        ... on Dog {
          name
          barks
        }
        ... on Cat {
          name
          meows
        }
      }

      fragment FriendFields on Named {
        __typename
        name
        ... on Dog {
          barks
        }
        ... on Cat {
          meows
        }
      }

      fragment ProgenyFields on Life {
        progeny {
          __typename
        }
      }
    `);
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema, document, rootValue: john })).to.deep.equal({
            data: {
                __typename: 'Person',
                name: 'John',
                pets: [
                    {
                        __typename: 'Cat',
                        name: 'Garfield',
                        meows: false,
                        mother: { progeny: [{ __typename: 'Cat' }] },
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                        mother: { progeny: [{ __typename: 'Dog' }] },
                    },
                ],
                friends: [
                    {
                        __typename: 'Person',
                        name: 'Liz',
                    },
                    {
                        __typename: 'Dog',
                        name: 'Odie',
                        barks: true,
                    },
                ],
            },
        });
    });
    (0, mocha_1.it)('gets execution info in resolver', () => {
        let encounteredContext;
        let encounteredSchema;
        let encounteredRootValue;
        const NamedType2 = new definition_1.GraphQLInterfaceType({
            name: 'Named',
            fields: {
                name: { type: scalars_1.GraphQLString },
            },
            resolveType(_source, context, info) {
                encounteredContext = context;
                encounteredSchema = info.schema;
                encounteredRootValue = info.rootValue;
                return PersonType2.name;
            },
        });
        const PersonType2 = new definition_1.GraphQLObjectType({
            name: 'Person',
            interfaces: [NamedType2],
            fields: {
                name: { type: scalars_1.GraphQLString },
                friends: { type: new definition_1.GraphQLList(NamedType2) },
            },
        });
        const schema2 = new schema_1.GraphQLSchema({ query: PersonType2 });
        const document = (0, parser_1.parse)('{ name, friends { name } }');
        const rootValue = new Person('John', [], [liz]);
        const contextValue = { authToken: '123abc' };
        const result = (0, execute_1.executeSync)({
            schema: schema2,
            document,
            rootValue,
            contextValue,
        });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                name: 'John',
                friends: [{ name: 'Liz' }],
            },
        });
        (0, chai_1.expect)(encounteredSchema).to.equal(schema2);
        (0, chai_1.expect)(encounteredRootValue).to.equal(rootValue);
        (0, chai_1.expect)(encounteredContext).to.equal(contextValue);
    });
});
//# sourceMappingURL=union-interface-test.js.map