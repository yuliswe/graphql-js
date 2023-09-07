"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const directiveLocation_1 = require("../../language/directiveLocation");
const definition_1 = require("../../type/definition");
const directives_1 = require("../../type/directives");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const buildASTSchema_1 = require("../buildASTSchema");
const printSchema_1 = require("../printSchema");
function expectPrintedSchema(schema) {
    const schemaText = (0, printSchema_1.printSchema)(schema);
    // keep printSchema and buildSchema in sync
    (0, chai_1.expect)((0, printSchema_1.printSchema)((0, buildASTSchema_1.buildSchema)(schemaText))).to.equal(schemaText);
    return (0, chai_1.expect)(schemaText);
}
function buildSingleFieldSchema(fieldConfig) {
    const Query = new definition_1.GraphQLObjectType({
        name: 'Query',
        fields: { singleField: fieldConfig },
    });
    return new schema_1.GraphQLSchema({ query: Query });
}
(0, mocha_1.describe)('Type System Printer', () => {
    (0, mocha_1.it)('Prints String Field', () => {
        const schema = buildSingleFieldSchema({ type: scalars_1.GraphQLString });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: String
      }
    `);
    });
    (0, mocha_1.it)('Prints [String] Field', () => {
        const schema = buildSingleFieldSchema({
            type: new definition_1.GraphQLList(scalars_1.GraphQLString),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: [String]
      }
    `);
    });
    (0, mocha_1.it)('Prints String! Field', () => {
        const schema = buildSingleFieldSchema({
            type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: String!
      }
    `);
    });
    (0, mocha_1.it)('Prints [String]! Field', () => {
        const schema = buildSingleFieldSchema({
            type: new definition_1.GraphQLNonNull(new definition_1.GraphQLList(scalars_1.GraphQLString)),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: [String]!
      }
    `);
    });
    (0, mocha_1.it)('Prints [String!] Field', () => {
        const schema = buildSingleFieldSchema({
            type: new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString)),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: [String!]
      }
    `);
    });
    (0, mocha_1.it)('Prints [String!]! Field', () => {
        const schema = buildSingleFieldSchema({
            type: new definition_1.GraphQLNonNull(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString))),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField: [String!]!
      }
    `);
    });
    (0, mocha_1.it)('Print Object Field', () => {
        const FooType = new definition_1.GraphQLObjectType({
            name: 'Foo',
            fields: { str: { type: scalars_1.GraphQLString } },
        });
        const schema = new schema_1.GraphQLSchema({ types: [FooType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Foo {
        str: String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Int Arg', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: { argOne: { type: scalars_1.GraphQLInt } },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Int Arg With Default', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: { argOne: { type: scalars_1.GraphQLInt, defaultValue: 2 } },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int = 2): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With String Arg With Default', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: { argOne: { type: scalars_1.GraphQLString, defaultValue: 'tes\t de\fault' } },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedentString)(String.raw `
        type Query {
          singleField(argOne: String = "tes\t de\fault"): String
        }
      `));
    });
    (0, mocha_1.it)('Prints String Field With Int Arg With Default Null', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: { argOne: { type: scalars_1.GraphQLInt, defaultValue: null } },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int = null): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Int! Arg', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: { argOne: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLInt) } },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int!): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Multiple Args', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: {
                argOne: { type: scalars_1.GraphQLInt },
                argTwo: { type: scalars_1.GraphQLString },
            },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int, argTwo: String): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Multiple Args, First is Default', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: {
                argOne: { type: scalars_1.GraphQLInt, defaultValue: 1 },
                argTwo: { type: scalars_1.GraphQLString },
                argThree: { type: scalars_1.GraphQLBoolean },
            },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int = 1, argTwo: String, argThree: Boolean): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Multiple Args, Second is Default', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: {
                argOne: { type: scalars_1.GraphQLInt },
                argTwo: { type: scalars_1.GraphQLString, defaultValue: 'foo' },
                argThree: { type: scalars_1.GraphQLBoolean },
            },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int, argTwo: String = "foo", argThree: Boolean): String
      }
    `);
    });
    (0, mocha_1.it)('Prints String Field With Multiple Args, Last is Default', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            args: {
                argOne: { type: scalars_1.GraphQLInt },
                argTwo: { type: scalars_1.GraphQLString },
                argThree: { type: scalars_1.GraphQLBoolean, defaultValue: false },
            },
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        singleField(argOne: Int, argTwo: String, argThree: Boolean = false): String
      }
    `);
    });
    (0, mocha_1.it)('Prints schema with description', () => {
        const schema = new schema_1.GraphQLSchema({
            description: 'Schema description.',
            query: new definition_1.GraphQLObjectType({ name: 'Query', fields: {} }),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      """Schema description."""
      schema {
        query: Query
      }

      type Query
    `);
    });
    (0, mocha_1.it)('Omits schema of common names', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({ name: 'Query', fields: {} }),
            mutation: new definition_1.GraphQLObjectType({ name: 'Mutation', fields: {} }),
            subscription: new definition_1.GraphQLObjectType({ name: 'Subscription', fields: {} }),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query

      type Mutation

      type Subscription
    `);
    });
    (0, mocha_1.it)('Prints custom query root types', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({ name: 'CustomType', fields: {} }),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      schema {
        query: CustomType
      }

      type CustomType
    `);
    });
    (0, mocha_1.it)('Prints custom mutation root types', () => {
        const schema = new schema_1.GraphQLSchema({
            mutation: new definition_1.GraphQLObjectType({ name: 'CustomType', fields: {} }),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      schema {
        mutation: CustomType
      }

      type CustomType
    `);
    });
    (0, mocha_1.it)('Prints custom subscription root types', () => {
        const schema = new schema_1.GraphQLSchema({
            subscription: new definition_1.GraphQLObjectType({ name: 'CustomType', fields: {} }),
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      schema {
        subscription: CustomType
      }

      type CustomType
    `);
    });
    (0, mocha_1.it)('Print Interface', () => {
        const FooType = new definition_1.GraphQLInterfaceType({
            name: 'Foo',
            fields: { str: { type: scalars_1.GraphQLString } },
        });
        const BarType = new definition_1.GraphQLObjectType({
            name: 'Bar',
            fields: { str: { type: scalars_1.GraphQLString } },
            interfaces: [FooType],
        });
        const schema = new schema_1.GraphQLSchema({ types: [BarType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Bar implements Foo {
        str: String
      }

      interface Foo {
        str: String
      }
    `);
    });
    (0, mocha_1.it)('Print Multiple Interface', () => {
        const FooType = new definition_1.GraphQLInterfaceType({
            name: 'Foo',
            fields: { str: { type: scalars_1.GraphQLString } },
        });
        const BazType = new definition_1.GraphQLInterfaceType({
            name: 'Baz',
            fields: { int: { type: scalars_1.GraphQLInt } },
        });
        const BarType = new definition_1.GraphQLObjectType({
            name: 'Bar',
            fields: {
                str: { type: scalars_1.GraphQLString },
                int: { type: scalars_1.GraphQLInt },
            },
            interfaces: [FooType, BazType],
        });
        const schema = new schema_1.GraphQLSchema({ types: [BarType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Bar implements Foo & Baz {
        str: String
        int: Int
      }

      interface Foo {
        str: String
      }

      interface Baz {
        int: Int
      }
    `);
    });
    (0, mocha_1.it)('Print Hierarchical Interface', () => {
        const FooType = new definition_1.GraphQLInterfaceType({
            name: 'Foo',
            fields: { str: { type: scalars_1.GraphQLString } },
        });
        const BazType = new definition_1.GraphQLInterfaceType({
            name: 'Baz',
            interfaces: [FooType],
            fields: {
                int: { type: scalars_1.GraphQLInt },
                str: { type: scalars_1.GraphQLString },
            },
        });
        const BarType = new definition_1.GraphQLObjectType({
            name: 'Bar',
            fields: {
                str: { type: scalars_1.GraphQLString },
                int: { type: scalars_1.GraphQLInt },
            },
            interfaces: [FooType, BazType],
        });
        const Query = new definition_1.GraphQLObjectType({
            name: 'Query',
            fields: { bar: { type: BarType } },
        });
        const schema = new schema_1.GraphQLSchema({ query: Query, types: [BarType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Bar implements Foo & Baz {
        str: String
        int: Int
      }

      interface Foo {
        str: String
      }

      interface Baz implements Foo {
        int: Int
        str: String
      }

      type Query {
        bar: Bar
      }
    `);
    });
    (0, mocha_1.it)('Print Unions', () => {
        const FooType = new definition_1.GraphQLObjectType({
            name: 'Foo',
            fields: {
                bool: { type: scalars_1.GraphQLBoolean },
            },
        });
        const BarType = new definition_1.GraphQLObjectType({
            name: 'Bar',
            fields: {
                str: { type: scalars_1.GraphQLString },
            },
        });
        const SingleUnion = new definition_1.GraphQLUnionType({
            name: 'SingleUnion',
            types: [FooType],
        });
        const MultipleUnion = new definition_1.GraphQLUnionType({
            name: 'MultipleUnion',
            types: [FooType, BarType],
        });
        const schema = new schema_1.GraphQLSchema({ types: [SingleUnion, MultipleUnion] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      union SingleUnion = Foo

      type Foo {
        bool: Boolean
      }

      union MultipleUnion = Foo | Bar

      type Bar {
        str: String
      }
    `);
    });
    (0, mocha_1.it)('Print Input Type', () => {
        const InputType = new definition_1.GraphQLInputObjectType({
            name: 'InputType',
            fields: {
                int: { type: scalars_1.GraphQLInt },
            },
        });
        const schema = new schema_1.GraphQLSchema({ types: [InputType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      input InputType {
        int: Int
      }
    `);
    });
    (0, mocha_1.it)('Custom Scalar', () => {
        const OddType = new definition_1.GraphQLScalarType({ name: 'Odd' });
        const schema = new schema_1.GraphQLSchema({ types: [OddType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      scalar Odd
    `);
    });
    (0, mocha_1.it)('Custom Scalar with specifiedByURL', () => {
        const FooType = new definition_1.GraphQLScalarType({
            name: 'Foo',
            specifiedByURL: 'https://example.com/foo_spec',
        });
        const schema = new schema_1.GraphQLSchema({ types: [FooType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      scalar Foo @specifiedBy(url: "https://example.com/foo_spec")
    `);
    });
    (0, mocha_1.it)('Enum', () => {
        const RGBType = new definition_1.GraphQLEnumType({
            name: 'RGB',
            values: {
                RED: {},
                GREEN: {},
                BLUE: {},
            },
        });
        const schema = new schema_1.GraphQLSchema({ types: [RGBType] });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      enum RGB {
        RED
        GREEN
        BLUE
      }
    `);
    });
    (0, mocha_1.it)('Prints empty types', () => {
        const schema = new schema_1.GraphQLSchema({
            types: [
                new definition_1.GraphQLEnumType({ name: 'SomeEnum', values: {} }),
                new definition_1.GraphQLInputObjectType({ name: 'SomeInputObject', fields: {} }),
                new definition_1.GraphQLInterfaceType({ name: 'SomeInterface', fields: {} }),
                new definition_1.GraphQLObjectType({ name: 'SomeObject', fields: {} }),
                new definition_1.GraphQLUnionType({ name: 'SomeUnion', types: [] }),
            ],
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      enum SomeEnum

      input SomeInputObject

      interface SomeInterface

      type SomeObject

      union SomeUnion
    `);
    });
    (0, mocha_1.it)('Prints custom directives', () => {
        const SimpleDirective = new directives_1.GraphQLDirective({
            name: 'simpleDirective',
            locations: [directiveLocation_1.DirectiveLocation.FIELD],
        });
        const ComplexDirective = new directives_1.GraphQLDirective({
            name: 'complexDirective',
            description: 'Complex Directive',
            args: {
                stringArg: { type: scalars_1.GraphQLString },
                intArg: { type: scalars_1.GraphQLInt, defaultValue: -1 },
            },
            isRepeatable: true,
            locations: [directiveLocation_1.DirectiveLocation.FIELD, directiveLocation_1.DirectiveLocation.QUERY],
        });
        const schema = new schema_1.GraphQLSchema({
            directives: [SimpleDirective, ComplexDirective],
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      directive @simpleDirective on FIELD

      """Complex Directive"""
      directive @complexDirective(stringArg: String, intArg: Int = -1) repeatable on FIELD | QUERY
    `);
    });
    (0, mocha_1.it)('Prints an empty description', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            description: '',
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        """"""
        singleField: String
      }
    `);
    });
    (0, mocha_1.it)('Prints an description with only whitespace', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            description: ' ',
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        " "
        singleField: String
      }
    `);
    });
    (0, mocha_1.it)('One-line prints a short description', () => {
        const schema = buildSingleFieldSchema({
            type: scalars_1.GraphQLString,
            description: 'This field is awesome',
        });
        expectPrintedSchema(schema).to.equal((0, dedent_1.dedent) `
      type Query {
        """This field is awesome"""
        singleField: String
      }
    `);
    });
    (0, mocha_1.it)('Print Introspection Schema', () => {
        const schema = new schema_1.GraphQLSchema({});
        const output = (0, printSchema_1.printIntrospectionSchema)(schema);
        (0, chai_1.expect)(output).to.equal((0, dedent_1.dedent) `
      """
      Directs the executor to include this field or fragment only when the \`if\` argument is true.
      """
      directive @include(
        """Included when true."""
        if: Boolean!
      ) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT

      """
      Directs the executor to skip this field or fragment when the \`if\` argument is true.
      """
      directive @skip(
        """Skipped when true."""
        if: Boolean!
      ) on FIELD | FRAGMENT_SPREAD | INLINE_FRAGMENT

      """Marks an element of a GraphQL schema as no longer supported."""
      directive @deprecated(
        """
        Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).
        """
        reason: String = "No longer supported"
      ) on FIELD_DEFINITION | ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION | ENUM_VALUE

      """Exposes a URL that specifies the behavior of this scalar."""
      directive @specifiedBy(
        """The URL that specifies the behavior of this scalar."""
        url: String!
      ) on SCALAR

      """
      A GraphQL Schema defines the capabilities of a GraphQL server. It exposes all available types and directives on the server, as well as the entry points for query, mutation, and subscription operations.
      """
      type __Schema {
        description: String

        """A list of all types supported by this server."""
        types: [__Type!]!

        """The type that query operations will be rooted at."""
        queryType: __Type!

        """
        If this server supports mutation, the type that mutation operations will be rooted at.
        """
        mutationType: __Type

        """
        If this server support subscription, the type that subscription operations will be rooted at.
        """
        subscriptionType: __Type

        """A list of all directives supported by this server."""
        directives: [__Directive!]!
      }

      """
      The fundamental unit of any GraphQL Schema is the type. There are many kinds of types in GraphQL as represented by the \`__TypeKind\` enum.

      Depending on the kind of a type, certain fields describe information about that type. Scalar types provide no information beyond a name, description and optional \`specifiedByURL\`, while Enum types provide their values. Object and Interface types provide the fields they describe. Abstract types, Union and Interface, provide the Object types possible at runtime. List and NonNull types compose other types.
      """
      type __Type {
        kind: __TypeKind!
        name: String
        description: String
        specifiedByURL: String
        fields(includeDeprecated: Boolean = false): [__Field!]
        interfaces: [__Type!]
        possibleTypes: [__Type!]
        enumValues(includeDeprecated: Boolean = false): [__EnumValue!]
        inputFields(includeDeprecated: Boolean = false): [__InputValue!]
        ofType: __Type
      }

      """An enum describing what kind of type a given \`__Type\` is."""
      enum __TypeKind {
        """Indicates this type is a scalar."""
        SCALAR

        """
        Indicates this type is an object. \`fields\` and \`interfaces\` are valid fields.
        """
        OBJECT

        """
        Indicates this type is an interface. \`fields\`, \`interfaces\`, and \`possibleTypes\` are valid fields.
        """
        INTERFACE

        """Indicates this type is a union. \`possibleTypes\` is a valid field."""
        UNION

        """Indicates this type is an enum. \`enumValues\` is a valid field."""
        ENUM

        """
        Indicates this type is an input object. \`inputFields\` is a valid field.
        """
        INPUT_OBJECT

        """Indicates this type is a list. \`ofType\` is a valid field."""
        LIST

        """Indicates this type is a non-null. \`ofType\` is a valid field."""
        NON_NULL
      }

      """
      Object and Interface types are described by a list of Fields, each of which has a name, potentially a list of arguments, and a return type.
      """
      type __Field {
        name: String!
        description: String
        args(includeDeprecated: Boolean = false): [__InputValue!]!
        type: __Type!
        isDeprecated: Boolean!
        deprecationReason: String
      }

      """
      Arguments provided to Fields or Directives and the input fields of an InputObject are represented as Input Values which describe their type and optionally a default value.
      """
      type __InputValue {
        name: String!
        description: String
        type: __Type!

        """
        A GraphQL-formatted string representing the default value for this input value.
        """
        defaultValue: String
        isDeprecated: Boolean!
        deprecationReason: String
      }

      """
      One possible value for a given Enum. Enum values are unique values, not a placeholder for a string or numeric value. However an Enum value is returned in a JSON response as a string.
      """
      type __EnumValue {
        name: String!
        description: String
        isDeprecated: Boolean!
        deprecationReason: String
      }

      """
      A Directive provides a way to describe alternate runtime execution and type validation behavior in a GraphQL document.

      In some cases, you need to provide options to alter GraphQL's execution behavior in ways field arguments will not suffice, such as conditionally including or skipping a field. Directives provide this by describing additional information to the executor.
      """
      type __Directive {
        name: String!
        description: String
        isRepeatable: Boolean!
        locations: [__DirectiveLocation!]!
        args(includeDeprecated: Boolean = false): [__InputValue!]!
      }

      """
      A Directive can be adjacent to many parts of the GraphQL language, a __DirectiveLocation describes one such possible adjacencies.
      """
      enum __DirectiveLocation {
        """Location adjacent to a query operation."""
        QUERY

        """Location adjacent to a mutation operation."""
        MUTATION

        """Location adjacent to a subscription operation."""
        SUBSCRIPTION

        """Location adjacent to a field."""
        FIELD

        """Location adjacent to a fragment definition."""
        FRAGMENT_DEFINITION

        """Location adjacent to a fragment spread."""
        FRAGMENT_SPREAD

        """Location adjacent to an inline fragment."""
        INLINE_FRAGMENT

        """Location adjacent to a variable definition."""
        VARIABLE_DEFINITION

        """Location adjacent to a schema definition."""
        SCHEMA

        """Location adjacent to a scalar definition."""
        SCALAR

        """Location adjacent to an object type definition."""
        OBJECT

        """Location adjacent to a field definition."""
        FIELD_DEFINITION

        """Location adjacent to an argument definition."""
        ARGUMENT_DEFINITION

        """Location adjacent to an interface definition."""
        INTERFACE

        """Location adjacent to a union definition."""
        UNION

        """Location adjacent to an enum definition."""
        ENUM

        """Location adjacent to an enum value definition."""
        ENUM_VALUE

        """Location adjacent to an input object type definition."""
        INPUT_OBJECT

        """Location adjacent to an input object field definition."""
        INPUT_FIELD_DEFINITION
      }
    `);
    });
});
//# sourceMappingURL=printSchema-test.js.map