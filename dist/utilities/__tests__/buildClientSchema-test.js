"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const invariant_1 = require("../../jsutils/invariant");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const graphql_1 = require("../../graphql");
const buildASTSchema_1 = require("../buildASTSchema");
const buildClientSchema_1 = require("../buildClientSchema");
const introspectionFromSchema_1 = require("../introspectionFromSchema");
const printSchema_1 = require("../printSchema");
/**
 * This function does a full cycle of going from a string with the contents of
 * the SDL, build in-memory GraphQLSchema from it, produce a client-side
 * representation of the schema by using "buildClientSchema" and then
 * returns that schema printed as SDL.
 */
function cycleIntrospection(sdlString) {
    const serverSchema = (0, buildASTSchema_1.buildSchema)(sdlString);
    const initialIntrospection = (0, introspectionFromSchema_1.introspectionFromSchema)(serverSchema);
    const clientSchema = (0, buildClientSchema_1.buildClientSchema)(initialIntrospection);
    const secondIntrospection = (0, introspectionFromSchema_1.introspectionFromSchema)(clientSchema);
    /**
     * If the client then runs the introspection query against the client-side
     * schema, it should get a result identical to what was returned by the server
     */
    (0, chai_1.expect)(secondIntrospection).to.deep.equal(initialIntrospection);
    return (0, printSchema_1.printSchema)(clientSchema);
}
(0, mocha_1.describe)('Type System: build schema from introspection', () => {
    (0, mocha_1.it)('builds a simple schema', () => {
        const sdl = (0, dedent_1.dedent) `
      """Simple schema"""
      schema {
        query: Simple
      }

      """This is a simple type"""
      type Simple {
        """This is a string field"""
        string: String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema without the query type', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        foo: String
      }
    `;
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        // @ts-expect-error
        delete introspection.__schema.queryType;
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        (0, chai_1.expect)(clientSchema.getQueryType()).to.equal(null);
        (0, chai_1.expect)((0, printSchema_1.printSchema)(clientSchema)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a simple schema with all operation types', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: QueryType
        mutation: MutationType
        subscription: SubscriptionType
      }

      """This is a simple mutation type"""
      type MutationType {
        """Set the string field"""
        string: String
      }

      """This is a simple query type"""
      type QueryType {
        """This is a string field"""
        string: String
      }

      """This is a simple subscription type"""
      type SubscriptionType {
        """This is a string field"""
        string: String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('uses built-in scalars when possible', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar CustomScalar

      type Query {
        int: Int
        float: Float
        string: String
        boolean: Boolean
        id: ID
        custom: CustomScalar
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        // Built-ins are used
        (0, chai_1.expect)(clientSchema.getType('Int')).to.equal(scalars_1.GraphQLInt);
        (0, chai_1.expect)(clientSchema.getType('Float')).to.equal(scalars_1.GraphQLFloat);
        (0, chai_1.expect)(clientSchema.getType('String')).to.equal(scalars_1.GraphQLString);
        (0, chai_1.expect)(clientSchema.getType('Boolean')).to.equal(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)(clientSchema.getType('ID')).to.equal(scalars_1.GraphQLID);
        // Custom are built
        const customScalar = schema.getType('CustomScalar');
        (0, chai_1.expect)(clientSchema.getType('CustomScalar')).to.not.equal(customScalar);
    });
    (0, mocha_1.it)('includes standard types only if they are used', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        foo: String
      }
    `);
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        (0, chai_1.expect)(clientSchema.getType('Int')).to.equal(undefined);
        (0, chai_1.expect)(clientSchema.getType('Float')).to.equal(undefined);
        (0, chai_1.expect)(clientSchema.getType('ID')).to.equal(undefined);
    });
    (0, mocha_1.it)('builds a schema with a recursive type reference', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: Recur
      }

      type Recur {
        recur: Recur
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with a circular type reference', () => {
        const sdl = (0, dedent_1.dedent) `
      type Dog {
        bestFriend: Human
      }

      type Human {
        bestFriend: Dog
      }

      type Query {
        dog: Dog
        human: Human
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with an interface', () => {
        const sdl = (0, dedent_1.dedent) `
      type Dog implements Friendly {
        bestFriend: Friendly
      }

      interface Friendly {
        """The best friend of this friendly thing"""
        bestFriend: Friendly
      }

      type Human implements Friendly {
        bestFriend: Friendly
      }

      type Query {
        friendly: Friendly
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with an interface hierarchy', () => {
        const sdl = (0, dedent_1.dedent) `
      type Dog implements Friendly & Named {
        bestFriend: Friendly
        name: String
      }

      interface Friendly implements Named {
        """The best friend of this friendly thing"""
        bestFriend: Friendly
        name: String
      }

      type Human implements Friendly & Named {
        bestFriend: Friendly
        name: String
      }

      interface Named {
        name: String
      }

      type Query {
        friendly: Friendly
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with an implicit interface', () => {
        const sdl = (0, dedent_1.dedent) `
      type Dog implements Friendly {
        bestFriend: Friendly
      }

      interface Friendly {
        """The best friend of this friendly thing"""
        bestFriend: Friendly
      }

      type Query {
        dog: Dog
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with a union', () => {
        const sdl = (0, dedent_1.dedent) `
      type Dog {
        bestFriend: Friendly
      }

      union Friendly = Dog | Human

      type Human {
        bestFriend: Friendly
      }

      type Query {
        friendly: Friendly
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with complex field values', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        string: String
        listOfString: [String]
        nonNullString: String!
        nonNullListOfString: [String]!
        nonNullListOfNonNullString: [String!]!
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with field arguments', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        """A field with a single arg"""
        one(
          """This is an int arg"""
          intArg: Int
        ): String

        """A field with a two args"""
        two(
          """This is an list of int arg"""
          listArg: [Int]

          """This is a required arg"""
          requiredArg: Boolean!
        ): String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with default value on custom scalar field', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar CustomScalar

      type Query {
        testField(testArg: CustomScalar = "default"): String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with an enum', () => {
        const foodEnum = new definition_1.GraphQLEnumType({
            name: 'Food',
            description: 'Varieties of food stuffs',
            values: {
                VEGETABLES: {
                    description: 'Foods that are vegetables.',
                    value: 1,
                },
                FRUITS: {
                    value: 2,
                },
                OILS: {
                    value: 3,
                    deprecationReason: 'Too fatty',
                },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'EnumFields',
                fields: {
                    food: {
                        description: 'Repeats the arg you give it',
                        type: foodEnum,
                        args: {
                            kind: {
                                description: 'what kind of food?',
                                type: foodEnum,
                            },
                        },
                    },
                },
            }),
        });
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        const secondIntrospection = (0, introspectionFromSchema_1.introspectionFromSchema)(clientSchema);
        (0, chai_1.expect)(secondIntrospection).to.deep.equal(introspection);
        // It's also an Enum type on the client.
        const clientFoodEnum = (0, definition_1.assertEnumType)(clientSchema.getType('Food'));
        // Client types do not get server-only values, so `value` mirrors `name`,
        // rather than using the integers defined in the "server" schema.
        (0, chai_1.expect)(clientFoodEnum.getValues()).to.deep.equal([
            {
                name: 'VEGETABLES',
                description: 'Foods that are vegetables.',
                value: 'VEGETABLES',
                deprecationReason: null,
                extensions: {},
                astNode: undefined,
            },
            {
                name: 'FRUITS',
                description: null,
                value: 'FRUITS',
                deprecationReason: null,
                extensions: {},
                astNode: undefined,
            },
            {
                name: 'OILS',
                description: null,
                value: 'OILS',
                deprecationReason: 'Too fatty',
                extensions: {},
                astNode: undefined,
            },
        ]);
    });
    (0, mocha_1.it)('builds a schema with an input object', () => {
        const sdl = (0, dedent_1.dedent) `
      """An input address"""
      input Address {
        """What street is this address?"""
        street: String!

        """The city the address is within?"""
        city: String!

        """The country (blank will assume USA)."""
        country: String = "USA"
      }

      type Query {
        """Get a geocode from an address"""
        geocode(
          """The address to lookup"""
          address: Address
        ): String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with field arguments with default values', () => {
        const sdl = (0, dedent_1.dedent) `
      input Geo {
        lat: Float
        lon: Float
      }

      type Query {
        defaultInt(intArg: Int = 30): String
        defaultList(listArg: [Int] = [1, 2, 3]): String
        defaultObject(objArg: Geo = {lat: 37.485, lon: -122.148}): String
        defaultNull(intArg: Int = null): String
        noDefault(intArg: Int): String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with custom directives', () => {
        const sdl = (0, dedent_1.dedent) `
      """This is a custom directive"""
      directive @customDirective repeatable on FIELD

      type Query {
        string: String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema without directives', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        string: String
      }
    `;
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        // @ts-expect-error
        delete introspection.__schema.directives;
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        (0, chai_1.expect)(schema.getDirectives()).to.have.lengthOf.above(0);
        (0, chai_1.expect)(clientSchema.getDirectives()).to.deep.equal([]);
        (0, chai_1.expect)((0, printSchema_1.printSchema)(clientSchema)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema aware of deprecation', () => {
        const sdl = (0, dedent_1.dedent) `
      directive @someDirective(
        """This is a shiny new argument"""
        shinyArg: SomeInputObject

        """This was our design mistake :("""
        oldArg: String @deprecated(reason: "Use shinyArg")
      ) on QUERY

      enum Color {
        """So rosy"""
        RED

        """So grassy"""
        GREEN

        """So calming"""
        BLUE

        """So sickening"""
        MAUVE @deprecated(reason: "No longer in fashion")
      }

      input SomeInputObject {
        """Nothing special about it, just deprecated for some unknown reason"""
        oldField: String @deprecated(reason: "Don't use it, use newField instead!")

        """Same field but with a new name"""
        newField: String
      }

      type Query {
        """This is a shiny string field"""
        shinyString: String

        """This is a deprecated string field"""
        deprecatedString: String @deprecated(reason: "Use shinyString")

        """Color of a week"""
        color: Color

        """Some random field"""
        someField(
          """This is a shiny new argument"""
          shinyArg: SomeInputObject

          """This was our design mistake :("""
          oldArg: String @deprecated(reason: "Use shinyArg")
        ): String
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with empty deprecation reasons', () => {
        const sdl = (0, dedent_1.dedent) `
      directive @someDirective(someArg: SomeInputObject @deprecated(reason: "")) on QUERY

      type Query {
        someField(someArg: SomeInputObject @deprecated(reason: "")): SomeEnum @deprecated(reason: "")
      }

      input SomeInputObject {
        someInputField: String @deprecated(reason: "")
      }

      enum SomeEnum {
        SOME_VALUE @deprecated(reason: "")
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('builds a schema with specifiedBy url', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar Foo @specifiedBy(url: "https://example.com/foo_spec")

      type Query {
        foo: Foo
      }
    `;
        (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('can use client schema for limited execution', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      scalar CustomScalar

      type Query {
        foo(custom1: CustomScalar, custom2: CustomScalar): String
      }
    `);
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
        const result = (0, graphql_1.graphqlSync)({
            schema: clientSchema,
            source: 'query Limited($v: CustomScalar) { foo(custom1: 123, custom2: $v) }',
            rootValue: { foo: 'bar', unused: 'value' },
            variableValues: { v: 'baz' },
        });
        (0, chai_1.expect)(result.data).to.deep.equal({ foo: 'bar' });
    });
    (0, mocha_1.it)('can build invalid schema', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query', { assumeValid: true });
        const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
        const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection, {
            assumeValid: true,
        });
        (0, chai_1.expect)(clientSchema.toConfig().assumeValid).to.equal(true);
    });
    (0, mocha_1.describe)('throws when given invalid introspection', () => {
        const dummySchema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        foo(bar: String): String
      }

      interface SomeInterface {
        foo: String
      }

      union SomeUnion = Query

      enum SomeEnum { FOO }

      input SomeInputObject {
        foo: String
      }

      directive @SomeDirective on QUERY
    `);
        (0, mocha_1.it)('throws when introspection is missing __schema property', () => {
            // @ts-expect-error (First parameter expected to be introspection results)
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(null)).to.throw('Invalid or incomplete introspection result. Ensure that you are passing "data" property of introspection response and no "errors" was returned alongside: null.');
            // @ts-expect-error
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)({})).to.throw('Invalid or incomplete introspection result. Ensure that you are passing "data" property of introspection response and no "errors" was returned alongside: {}.');
        });
        (0, mocha_1.it)('throws when referenced unknown type', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            // @ts-expect-error
            introspection.__schema.types = introspection.__schema.types.filter(({ name }) => name !== 'Query');
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Invalid or incomplete schema, unknown type: Query. Ensure that a full introspection query is used in order to build a client schema.');
        });
        (0, mocha_1.it)('throws when missing definition for one of the standard scalars', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query {
          foo: Float
        }
      `);
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
            // @ts-expect-error
            introspection.__schema.types = introspection.__schema.types.filter(({ name }) => name !== 'Float');
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Invalid or incomplete schema, unknown type: Float. Ensure that a full introspection query is used in order to build a client schema.');
        });
        (0, mocha_1.it)('throws when type reference is missing name', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            (0, chai_1.expect)(introspection).to.have.nested.property('__schema.queryType.name');
            // @ts-expect-error
            delete introspection.__schema.queryType.name;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Unknown type reference: {}.');
        });
        (0, mocha_1.it)('throws when missing kind', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            // @ts-expect-error
            delete queryTypeIntrospection.kind;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Invalid or incomplete introspection result. Ensure that a full introspection query is used in order to build a client schema: { name: "Query", .* }\./);
        });
        (0, mocha_1.it)('throws when missing interfaces', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, chai_1.expect)(queryTypeIntrospection).to.have.property('interfaces');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            // @ts-expect-error
            delete queryTypeIntrospection.interfaces;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing interfaces: { kind: "OBJECT", name: "Query", .* }\./);
        });
        (0, mocha_1.it)('Legacy support for interfaces with null as interfaces field', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someInterfaceIntrospection = introspection.__schema.types.find(({ name }) => name === 'SomeInterface');
            (0, invariant_1.invariant)((someInterfaceIntrospection === null || someInterfaceIntrospection === void 0 ? void 0 : someInterfaceIntrospection.kind) === 'INTERFACE');
            // @ts-expect-error
            someInterfaceIntrospection.interfaces = null;
            const clientSchema = (0, buildClientSchema_1.buildClientSchema)(introspection);
            (0, chai_1.expect)((0, printSchema_1.printSchema)(clientSchema)).to.equal((0, printSchema_1.printSchema)(dummySchema));
        });
        (0, mocha_1.it)('throws when missing fields', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            // @ts-expect-error
            delete queryTypeIntrospection.fields;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing fields: { kind: "OBJECT", name: "Query", .* }\./);
        });
        (0, mocha_1.it)('throws when missing field args', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            // @ts-expect-error
            delete queryTypeIntrospection.fields[0].args;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing field args: { name: "foo", .* }\./);
        });
        (0, mocha_1.it)('throws when output type is used as an arg type', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            const argType = queryTypeIntrospection.fields[0].args[0].type;
            (0, invariant_1.invariant)(argType.kind === 'SCALAR');
            (0, chai_1.expect)(argType).to.have.property('name', 'String');
            // @ts-expect-error
            argType.name = 'SomeUnion';
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Introspection must provide input type for arguments, but received: SomeUnion.');
        });
        (0, mocha_1.it)('throws when input type is used as a field type', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const queryTypeIntrospection = introspection.__schema.types.find(({ name }) => name === 'Query');
            (0, invariant_1.invariant)((queryTypeIntrospection === null || queryTypeIntrospection === void 0 ? void 0 : queryTypeIntrospection.kind) === 'OBJECT');
            const fieldType = queryTypeIntrospection.fields[0].type;
            (0, invariant_1.invariant)(fieldType.kind === 'SCALAR');
            (0, chai_1.expect)(fieldType).to.have.property('name', 'String');
            // @ts-expect-error
            fieldType.name = 'SomeInputObject';
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Introspection must provide output type for fields, but received: SomeInputObject.');
        });
        (0, mocha_1.it)('throws when missing possibleTypes', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someUnionIntrospection = introspection.__schema.types.find(({ name }) => name === 'SomeUnion');
            (0, invariant_1.invariant)((someUnionIntrospection === null || someUnionIntrospection === void 0 ? void 0 : someUnionIntrospection.kind) === 'UNION');
            // @ts-expect-error
            delete someUnionIntrospection.possibleTypes;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing possibleTypes: { kind: "UNION", name: "SomeUnion",.* }\./);
        });
        (0, mocha_1.it)('throws when missing enumValues', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someEnumIntrospection = introspection.__schema.types.find(({ name }) => name === 'SomeEnum');
            (0, invariant_1.invariant)((someEnumIntrospection === null || someEnumIntrospection === void 0 ? void 0 : someEnumIntrospection.kind) === 'ENUM');
            // @ts-expect-error
            delete someEnumIntrospection.enumValues;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing enumValues: { kind: "ENUM", name: "SomeEnum", .* }\./);
        });
        (0, mocha_1.it)('throws when missing inputFields', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someInputObjectIntrospection = introspection.__schema.types.find(({ name }) => name === 'SomeInputObject');
            (0, invariant_1.invariant)((someInputObjectIntrospection === null || someInputObjectIntrospection === void 0 ? void 0 : someInputObjectIntrospection.kind) === 'INPUT_OBJECT');
            // @ts-expect-error
            delete someInputObjectIntrospection.inputFields;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing inputFields: { kind: "INPUT_OBJECT", name: "SomeInputObject", .* }\./);
        });
        (0, mocha_1.it)('throws when missing directive locations', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someDirectiveIntrospection = introspection.__schema.directives[0];
            (0, chai_1.expect)(someDirectiveIntrospection).to.deep.include({
                name: 'SomeDirective',
                locations: ['QUERY'],
            });
            // @ts-expect-error
            delete someDirectiveIntrospection.locations;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing directive locations: { name: "SomeDirective", .* }\./);
        });
        (0, mocha_1.it)('throws when missing directive args', () => {
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(dummySchema);
            const someDirectiveIntrospection = introspection.__schema.directives[0];
            (0, chai_1.expect)(someDirectiveIntrospection).to.deep.include({
                name: 'SomeDirective',
                args: [],
            });
            // @ts-expect-error
            delete someDirectiveIntrospection.args;
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw(/Introspection result missing directive args: { name: "SomeDirective", .* }\./);
        });
    });
    (0, mocha_1.describe)('very deep decorators are not supported', () => {
        (0, mocha_1.it)('fails on very deep (> 8 levels) lists', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query {
          foo: [[[[[[[[[[String]]]]]]]]]]
        }
      `);
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Decorated type deeper than introspection query.');
        });
        (0, mocha_1.it)('fails on a very deep (> 8 levels) non-null', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query {
          foo: [[[[[String!]!]!]!]!]
        }
      `);
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Decorated type deeper than introspection query.');
        });
        (0, mocha_1.it)('succeeds on deep (<= 8 levels) types', () => {
            // e.g., fully non-null 4D matrix
            const sdl = (0, dedent_1.dedent) `
        type Query {
          foo: [[[[String!]!]!]!]!
        }
      `;
            (0, chai_1.expect)(cycleIntrospection(sdl)).to.equal(sdl);
        });
    });
    (0, mocha_1.describe)('prevents infinite recursion on invalid introspection', () => {
        (0, mocha_1.it)('recursive interfaces', () => {
            const sdl = `
        type Query {
          foo: Foo
        }

        type Foo implements Foo {
          foo: String
        }
      `;
            const schema = (0, buildASTSchema_1.buildSchema)(sdl, { assumeValid: true });
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
            const fooIntrospection = introspection.__schema.types.find((type) => type.name === 'Foo');
            (0, chai_1.expect)(fooIntrospection).to.deep.include({
                name: 'Foo',
                interfaces: [{ kind: 'OBJECT', name: 'Foo', ofType: null }],
            });
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Expected Foo to be a GraphQL Interface type.');
        });
        (0, mocha_1.it)('recursive union', () => {
            const sdl = `
        type Query {
          foo: Foo
        }

        union Foo = Foo
      `;
            const schema = (0, buildASTSchema_1.buildSchema)(sdl, { assumeValid: true });
            const introspection = (0, introspectionFromSchema_1.introspectionFromSchema)(schema);
            const fooIntrospection = introspection.__schema.types.find((type) => type.name === 'Foo');
            (0, chai_1.expect)(fooIntrospection).to.deep.include({
                name: 'Foo',
                possibleTypes: [{ kind: 'UNION', name: 'Foo', ofType: null }],
            });
            (0, chai_1.expect)(() => (0, buildClientSchema_1.buildClientSchema)(introspection)).to.throw('Expected Foo to be a GraphQL Object type.');
        });
    });
});
//# sourceMappingURL=buildClientSchema-test.js.map