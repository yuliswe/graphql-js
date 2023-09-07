"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StarWarsSchema = void 0;
const definition_1 = require("../type/definition");
const scalars_1 = require("../type/scalars");
const schema_1 = require("../type/schema");
const starWarsData_1 = require("./starWarsData");
/**
 * This is designed to be an end-to-end test, demonstrating
 * the full GraphQL stack.
 *
 * We will create a GraphQL schema that describes the major
 * characters in the original Star Wars trilogy.
 *
 * NOTE: This may contain spoilers for the original Star
 * Wars trilogy.
 */
/**
 * Using our shorthand to describe type systems, the type system for our
 * Star Wars example is:
 *
 * ```graphql
 * enum Episode { NEW_HOPE, EMPIRE, JEDI }
 *
 * interface Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 * }
 *
 * type Human implements Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   homePlanet: String
 * }
 *
 * type Droid implements Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   primaryFunction: String
 * }
 *
 * type Query {
 *   hero(episode: Episode): Character
 *   human(id: String!): Human
 *   droid(id: String!): Droid
 * }
 * ```
 *
 * We begin by setting up our schema.
 */
/**
 * The original trilogy consists of three movies.
 *
 * This implements the following type system shorthand:
 * ```graphql
 * enum Episode { NEW_HOPE, EMPIRE, JEDI }
 * ```
 */
const episodeEnum = new definition_1.GraphQLEnumType({
    name: 'Episode',
    description: 'One of the films in the Star Wars Trilogy',
    values: {
        NEW_HOPE: {
            value: 4,
            description: 'Released in 1977.',
        },
        EMPIRE: {
            value: 5,
            description: 'Released in 1980.',
        },
        JEDI: {
            value: 6,
            description: 'Released in 1983.',
        },
    },
});
/**
 * Characters in the Star Wars trilogy are either humans or droids.
 *
 * This implements the following type system shorthand:
 * ```graphql
 * interface Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   secretBackstory: String
 * }
 * ```
 */
const characterInterface = new definition_1.GraphQLInterfaceType({
    name: 'Character',
    description: 'A character in the Star Wars Trilogy',
    fields: () => ({
        id: {
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            description: 'The id of the character.',
        },
        name: {
            type: scalars_1.GraphQLString,
            description: 'The name of the character.',
        },
        friends: {
            type: new definition_1.GraphQLList(characterInterface),
            description: 'The friends of the character, or an empty list if they have none.',
        },
        appearsIn: {
            type: new definition_1.GraphQLList(episodeEnum),
            description: 'Which movies they appear in.',
        },
        secretBackstory: {
            type: scalars_1.GraphQLString,
            description: 'All secrets about their past.',
        },
    }),
    resolveType(character) {
        switch (character.type) {
            case 'Human':
                return humanType.name;
            case 'Droid':
                return droidType.name;
        }
    },
});
/**
 * We define our human type, which implements the character interface.
 *
 * This implements the following type system shorthand:
 * ```graphql
 * type Human : Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   secretBackstory: String
 * }
 * ```
 */
const humanType = new definition_1.GraphQLObjectType({
    name: 'Human',
    description: 'A humanoid creature in the Star Wars universe.',
    fields: () => ({
        id: {
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            description: 'The id of the human.',
        },
        name: {
            type: scalars_1.GraphQLString,
            description: 'The name of the human.',
        },
        friends: {
            type: new definition_1.GraphQLList(characterInterface),
            description: 'The friends of the human, or an empty list if they have none.',
            resolve: (human) => (0, starWarsData_1.getFriends)(human),
        },
        appearsIn: {
            type: new definition_1.GraphQLList(episodeEnum),
            description: 'Which movies they appear in.',
        },
        homePlanet: {
            type: scalars_1.GraphQLString,
            description: 'The home planet of the human, or null if unknown.',
        },
        secretBackstory: {
            type: scalars_1.GraphQLString,
            description: 'Where are they from and how they came to be who they are.',
            resolve() {
                throw new Error('secretBackstory is secret.');
            },
        },
    }),
    interfaces: [characterInterface],
});
/**
 * The other type of character in Star Wars is a droid.
 *
 * This implements the following type system shorthand:
 * ```graphql
 * type Droid : Character {
 *   id: String!
 *   name: String
 *   friends: [Character]
 *   appearsIn: [Episode]
 *   secretBackstory: String
 *   primaryFunction: String
 * }
 * ```
 */
const droidType = new definition_1.GraphQLObjectType({
    name: 'Droid',
    description: 'A mechanical creature in the Star Wars universe.',
    fields: () => ({
        id: {
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            description: 'The id of the droid.',
        },
        name: {
            type: scalars_1.GraphQLString,
            description: 'The name of the droid.',
        },
        friends: {
            type: new definition_1.GraphQLList(characterInterface),
            description: 'The friends of the droid, or an empty list if they have none.',
            resolve: (droid) => (0, starWarsData_1.getFriends)(droid),
        },
        appearsIn: {
            type: new definition_1.GraphQLList(episodeEnum),
            description: 'Which movies they appear in.',
        },
        secretBackstory: {
            type: scalars_1.GraphQLString,
            description: 'Construction date and the name of the designer.',
            resolve() {
                throw new Error('secretBackstory is secret.');
            },
        },
        primaryFunction: {
            type: scalars_1.GraphQLString,
            description: 'The primary function of the droid.',
        },
    }),
    interfaces: [characterInterface],
});
/**
 * This is the type that will be the root of our query, and the
 * entry point into our schema. It gives us the ability to fetch
 * objects by their IDs, as well as to fetch the undisputed hero
 * of the Star Wars trilogy, R2-D2, directly.
 *
 * This implements the following type system shorthand:
 * ```graphql
 * type Query {
 *   hero(episode: Episode): Character
 *   human(id: String!): Human
 *   droid(id: String!): Droid
 * }
 * ```
 */
const queryType = new definition_1.GraphQLObjectType({
    name: 'Query',
    fields: () => ({
        hero: {
            type: characterInterface,
            args: {
                episode: {
                    description: 'If omitted, returns the hero of the whole saga. If provided, returns the hero of that particular episode.',
                    type: episodeEnum,
                },
            },
            resolve: (_source, { episode }) => (0, starWarsData_1.getHero)(episode),
        },
        human: {
            type: humanType,
            args: {
                id: {
                    description: 'id of the human',
                    type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                },
            },
            resolve: (_source, { id }) => (0, starWarsData_1.getHuman)(id),
        },
        droid: {
            type: droidType,
            args: {
                id: {
                    description: 'id of the droid',
                    type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                },
            },
            resolve: (_source, { id }) => (0, starWarsData_1.getDroid)(id),
        },
    }),
});
/**
 * Finally, we construct our schema (whose starting query type is the query
 * type we defined above) and export it.
 */
exports.StarWarsSchema = new schema_1.GraphQLSchema({
    query: queryType,
    types: [humanType, droidType],
});
//# sourceMappingURL=starWarsSchema.js.map