"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const invariant_1 = require("../../jsutils/invariant");
const kinds_1 = require("../../language/kinds");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const definition_1 = require("../../type/definition");
const directives_1 = require("../../type/directives");
const introspection_1 = require("../../type/introspection");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const validate_1 = require("../../type/validate");
const graphql_1 = require("../../graphql");
const buildASTSchema_1 = require("../buildASTSchema");
const printSchema_1 = require("../printSchema");
/**
 * This function does a full cycle of going from a string with the contents of
 * the SDL, parsed in a schema AST, materializing that schema AST into an
 * in-memory GraphQLSchema, and then finally printing that object into the SDL
 */
function cycleSDL(sdl) {
    return (0, printSchema_1.printSchema)((0, buildASTSchema_1.buildSchema)(sdl));
}
function expectASTNode(obj) {
    (0, invariant_1.invariant)((obj === null || obj === void 0 ? void 0 : obj.astNode) != null);
    return (0, chai_1.expect)((0, printer_1.print)(obj.astNode));
}
function expectExtensionASTNodes(obj) {
    return (0, chai_1.expect)(obj.extensionASTNodes.map(printer_1.print).join('\n\n'));
}
(0, mocha_1.describe)('Schema Builder', () => {
    (0, mocha_1.it)('can use built schema for limited execution', () => {
        const schema = (0, buildASTSchema_1.buildASTSchema)((0, parser_1.parse)(`
        type Query {
          str: String
        }
      `));
        const result = (0, graphql_1.graphqlSync)({
            schema,
            source: '{ str }',
            rootValue: { str: 123 },
        });
        (0, chai_1.expect)(result.data).to.deep.equal({ str: '123' });
    });
    (0, mocha_1.it)('can build a schema directly from the source', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        add(x: Int, y: Int): Int
      }
    `);
        const source = '{ add(x: 34, y: 55) }';
        const rootValue = {
            add: ({ x, y }) => x + y,
        };
        (0, chai_1.expect)((0, graphql_1.graphqlSync)({ schema, source, rootValue })).to.deep.equal({
            data: { add: 89 },
        });
    });
    (0, mocha_1.it)('Ignores non-type system definitions', () => {
        const sdl = `
      type Query {
        str: String
      }

      fragment SomeFragment on Query {
        str
      }
    `;
        (0, chai_1.expect)(() => (0, buildASTSchema_1.buildSchema)(sdl)).to.not.throw();
    });
    (0, mocha_1.it)('Match order of default types and directives', () => {
        const schema = new schema_1.GraphQLSchema({});
        const sdlSchema = (0, buildASTSchema_1.buildASTSchema)({
            kind: kinds_1.Kind.DOCUMENT,
            definitions: [],
        });
        (0, chai_1.expect)(sdlSchema.getDirectives()).to.deep.equal(schema.getDirectives());
        (0, chai_1.expect)(sdlSchema.getTypeMap()).to.deep.equal(schema.getTypeMap());
        (0, chai_1.expect)(Object.keys(sdlSchema.getTypeMap())).to.deep.equal(Object.keys(schema.getTypeMap()));
    });
    (0, mocha_1.it)('Empty type', () => {
        const sdl = (0, dedent_1.dedent) `
      type EmptyType
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple type', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        str: String
        int: Int
        float: Float
        id: ID
        bool: Boolean
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        // Built-ins are used
        (0, chai_1.expect)(schema.getType('Int')).to.equal(scalars_1.GraphQLInt);
        (0, chai_1.expect)(schema.getType('Float')).to.equal(scalars_1.GraphQLFloat);
        (0, chai_1.expect)(schema.getType('String')).to.equal(scalars_1.GraphQLString);
        (0, chai_1.expect)(schema.getType('Boolean')).to.equal(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)(schema.getType('ID')).to.equal(scalars_1.GraphQLID);
    });
    (0, mocha_1.it)('include standard type only if it is used', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        // String and Boolean are always included through introspection types
        (0, chai_1.expect)(schema.getType('Int')).to.equal(undefined);
        (0, chai_1.expect)(schema.getType('Float')).to.equal(undefined);
        (0, chai_1.expect)(schema.getType('ID')).to.equal(undefined);
    });
    (0, mocha_1.it)('With directives', () => {
        const sdl = (0, dedent_1.dedent) `
      directive @foo(arg: Int) on FIELD

      directive @repeatableFoo(arg: Int) repeatable on FIELD
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Supports descriptions', () => {
        const sdl = (0, dedent_1.dedent) `
      """Do you agree that this is the most creative schema ever?"""
      schema {
        query: Query
      }

      """This is a directive"""
      directive @foo(
        """It has an argument"""
        arg: Int
      ) on FIELD

      """Who knows what inside this scalar?"""
      scalar MysteryScalar

      """This is a input object type"""
      input FooInput {
        """It has a field"""
        field: Int
      }

      """This is a interface type"""
      interface Energy {
        """It also has a field"""
        str: String
      }

      """There is nothing inside!"""
      union BlackHole

      """With an enum"""
      enum Color {
        RED

        """Not a creative color"""
        GREEN
        BLUE
      }

      """What a great type"""
      type Query {
        """And a field to boot"""
        str: String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Maintains @include, @skip & @specifiedBy', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        (0, chai_1.expect)(schema.getDirectives()).to.have.lengthOf(4);
        (0, chai_1.expect)(schema.getDirective('skip')).to.equal(directives_1.GraphQLSkipDirective);
        (0, chai_1.expect)(schema.getDirective('include')).to.equal(directives_1.GraphQLIncludeDirective);
        (0, chai_1.expect)(schema.getDirective('deprecated')).to.equal(directives_1.GraphQLDeprecatedDirective);
        (0, chai_1.expect)(schema.getDirective('specifiedBy')).to.equal(directives_1.GraphQLSpecifiedByDirective);
    });
    (0, mocha_1.it)('Overriding directives excludes specified', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      directive @skip on FIELD
      directive @include on FIELD
      directive @deprecated on FIELD_DEFINITION
      directive @specifiedBy on FIELD_DEFINITION
    `);
        (0, chai_1.expect)(schema.getDirectives()).to.have.lengthOf(4);
        (0, chai_1.expect)(schema.getDirective('skip')).to.not.equal(directives_1.GraphQLSkipDirective);
        (0, chai_1.expect)(schema.getDirective('include')).to.not.equal(directives_1.GraphQLIncludeDirective);
        (0, chai_1.expect)(schema.getDirective('deprecated')).to.not.equal(directives_1.GraphQLDeprecatedDirective);
        (0, chai_1.expect)(schema.getDirective('specifiedBy')).to.not.equal(directives_1.GraphQLSpecifiedByDirective);
    });
    (0, mocha_1.it)('Adding directives maintains @include, @skip & @specifiedBy', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      directive @foo(arg: Int) on FIELD
    `);
        (0, chai_1.expect)(schema.getDirectives()).to.have.lengthOf(5);
        (0, chai_1.expect)(schema.getDirective('skip')).to.not.equal(undefined);
        (0, chai_1.expect)(schema.getDirective('include')).to.not.equal(undefined);
        (0, chai_1.expect)(schema.getDirective('deprecated')).to.not.equal(undefined);
        (0, chai_1.expect)(schema.getDirective('specifiedBy')).to.not.equal(undefined);
    });
    (0, mocha_1.it)('Type modifiers', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        nonNullStr: String!
        listOfStrings: [String]
        listOfNonNullStrings: [String!]
        nonNullListOfStrings: [String]!
        nonNullListOfNonNullStrings: [String!]!
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Recursive type', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        str: String
        recurse: Query
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Two types circular', () => {
        const sdl = (0, dedent_1.dedent) `
      type TypeOne {
        str: String
        typeTwo: TypeTwo
      }

      type TypeTwo {
        str: String
        typeOne: TypeOne
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Single argument field', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        str(int: Int): String
        floatToStr(float: Float): String
        idToStr(id: ID): String
        booleanToStr(bool: Boolean): String
        strToStr(bool: String): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple type with multiple arguments', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        str(int: Int, bool: Boolean): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Empty interface', () => {
        const sdl = (0, dedent_1.dedent) `
      interface EmptyInterface
    `;
        const definition = (0, parser_1.parse)(sdl).definitions[0];
        (0, chai_1.expect)(definition.kind === 'InterfaceTypeDefinition' && definition.interfaces).to.deep.equal([], 'The interfaces property must be an empty array.');
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple type with interface', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query implements WorldInterface {
        str: String
      }

      interface WorldInterface {
        str: String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple interface hierarchy', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: Child
      }

      interface Child implements Parent {
        str: String
      }

      type Hello implements Parent & Child {
        str: String
      }

      interface Parent {
        str: String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Empty enum', () => {
        const sdl = (0, dedent_1.dedent) `
      enum EmptyEnum
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple output enum', () => {
        const sdl = (0, dedent_1.dedent) `
      enum Hello {
        WORLD
      }

      type Query {
        hello: Hello
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple input enum', () => {
        const sdl = (0, dedent_1.dedent) `
      enum Hello {
        WORLD
      }

      type Query {
        str(hello: Hello): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Multiple value enum', () => {
        const sdl = (0, dedent_1.dedent) `
      enum Hello {
        WO
        RLD
      }

      type Query {
        hello: Hello
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Empty union', () => {
        const sdl = (0, dedent_1.dedent) `
      union EmptyUnion
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple Union', () => {
        const sdl = (0, dedent_1.dedent) `
      union Hello = World

      type Query {
        hello: Hello
      }

      type World {
        str: String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Multiple Union', () => {
        const sdl = (0, dedent_1.dedent) `
      union Hello = WorldOne | WorldTwo

      type Query {
        hello: Hello
      }

      type WorldOne {
        str: String
      }

      type WorldTwo {
        str: String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Can build recursive Union', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      union Hello = Hello

      type Query {
        hello: Hello
      }
    `);
        const errors = (0, validate_1.validateSchema)(schema);
        (0, chai_1.expect)(errors).to.have.lengthOf.above(0);
    });
    (0, mocha_1.it)('Custom Scalar', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar CustomScalar

      type Query {
        customScalar: CustomScalar
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Empty Input Object', () => {
        const sdl = (0, dedent_1.dedent) `
      input EmptyInputObject
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple Input Object', () => {
        const sdl = (0, dedent_1.dedent) `
      input Input {
        int: Int
      }

      type Query {
        field(in: Input): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple argument field with default', () => {
        const sdl = (0, dedent_1.dedent) `
      type Query {
        str(int: Int = 2): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Custom scalar argument field with default', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar CustomScalar

      type Query {
        str(int: CustomScalar = 2): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple type with mutation', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: HelloScalars
        mutation: Mutation
      }

      type HelloScalars {
        str: String
        int: Int
        bool: Boolean
      }

      type Mutation {
        addHelloScalars(str: String, int: Int, bool: Boolean): HelloScalars
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Simple type with subscription', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: HelloScalars
        subscription: Subscription
      }

      type HelloScalars {
        str: String
        int: Int
        bool: Boolean
      }

      type Subscription {
        subscribeHelloScalars(str: String, int: Int, bool: Boolean): HelloScalars
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Unreferenced type implementing referenced interface', () => {
        const sdl = (0, dedent_1.dedent) `
      type Concrete implements Interface {
        key: String
      }

      interface Interface {
        key: String
      }

      type Query {
        interface: Interface
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Unreferenced interface implementing referenced interface', () => {
        const sdl = (0, dedent_1.dedent) `
      interface Child implements Parent {
        key: String
      }

      interface Parent {
        key: String
      }

      type Query {
        interfaceField: Parent
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Unreferenced type implementing referenced union', () => {
        const sdl = (0, dedent_1.dedent) `
      type Concrete {
        key: String
      }

      type Query {
        union: Union
      }

      union Union = Concrete
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
    });
    (0, mocha_1.it)('Supports @deprecated', () => {
        const sdl = (0, dedent_1.dedent) `
      enum MyEnum {
        VALUE
        OLD_VALUE @deprecated
        OTHER_VALUE @deprecated(reason: "Terrible reasons")
      }

      input MyInput {
        oldInput: String @deprecated
        otherInput: String @deprecated(reason: "Use newInput")
        newInput: String
      }

      type Query {
        field1: String @deprecated
        field2: Int @deprecated(reason: "Because I said so")
        enum: MyEnum
        field3(oldArg: String @deprecated, arg: String): String
        field4(oldArg: String @deprecated(reason: "Why not?"), arg: String): String
        field5(arg: MyInput): String
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        const myEnum = (0, definition_1.assertEnumType)(schema.getType('MyEnum'));
        const value = myEnum.getValue('VALUE');
        (0, chai_1.expect)(value).to.include({ deprecationReason: undefined });
        const oldValue = myEnum.getValue('OLD_VALUE');
        (0, chai_1.expect)(oldValue).to.include({
            deprecationReason: 'No longer supported',
        });
        const otherValue = myEnum.getValue('OTHER_VALUE');
        (0, chai_1.expect)(otherValue).to.include({
            deprecationReason: 'Terrible reasons',
        });
        const rootFields = (0, definition_1.assertObjectType)(schema.getType('Query')).getFields();
        (0, chai_1.expect)(rootFields.field1).to.include({
            deprecationReason: 'No longer supported',
        });
        (0, chai_1.expect)(rootFields.field2).to.include({
            deprecationReason: 'Because I said so',
        });
        const inputFields = (0, definition_1.assertInputObjectType)(schema.getType('MyInput')).getFields();
        const newInput = inputFields.newInput;
        (0, chai_1.expect)(newInput).to.include({
            deprecationReason: undefined,
        });
        const oldInput = inputFields.oldInput;
        (0, chai_1.expect)(oldInput).to.include({
            deprecationReason: 'No longer supported',
        });
        const otherInput = inputFields.otherInput;
        (0, chai_1.expect)(otherInput).to.include({
            deprecationReason: 'Use newInput',
        });
        const field3OldArg = rootFields.field3.args[0];
        (0, chai_1.expect)(field3OldArg).to.include({
            deprecationReason: 'No longer supported',
        });
        const field4OldArg = rootFields.field4.args[0];
        (0, chai_1.expect)(field4OldArg).to.include({
            deprecationReason: 'Why not?',
        });
    });
    (0, mocha_1.it)('Supports @specifiedBy', () => {
        const sdl = (0, dedent_1.dedent) `
      scalar Foo @specifiedBy(url: "https://example.com/foo_spec")

      type Query {
        foo: Foo @deprecated
      }
    `;
        (0, chai_1.expect)(cycleSDL(sdl)).to.equal(sdl);
        const schema = (0, buildASTSchema_1.buildSchema)(sdl);
        (0, chai_1.expect)(schema.getType('Foo')).to.include({
            specifiedByURL: 'https://example.com/foo_spec',
        });
    });
    (0, mocha_1.it)('Correctly extend scalar type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      scalar SomeScalar
      extend scalar SomeScalar @foo
      extend scalar SomeScalar @bar

      directive @foo on SCALAR
      directive @bar on SCALAR
    `);
        const someScalar = (0, definition_1.assertScalarType)(schema.getType('SomeScalar'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someScalar)).to.equal((0, dedent_1.dedent) `
      scalar SomeScalar
    `);
        expectASTNode(someScalar).to.equal('scalar SomeScalar');
        expectExtensionASTNodes(someScalar).to.equal((0, dedent_1.dedent) `
      extend scalar SomeScalar @foo

      extend scalar SomeScalar @bar
    `);
    });
    (0, mocha_1.it)('Correctly extend object type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type SomeObject implements Foo {
        first: String
      }

      extend type SomeObject implements Bar {
        second: Int
      }

      extend type SomeObject implements Baz {
        third: Float
      }

      interface Foo
      interface Bar
      interface Baz
    `);
        const someObject = (0, definition_1.assertObjectType)(schema.getType('SomeObject'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someObject)).to.equal((0, dedent_1.dedent) `
      type SomeObject implements Foo & Bar & Baz {
        first: String
        second: Int
        third: Float
      }
    `);
        expectASTNode(someObject).to.equal((0, dedent_1.dedent) `
      type SomeObject implements Foo {
        first: String
      }
    `);
        expectExtensionASTNodes(someObject).to.equal((0, dedent_1.dedent) `
      extend type SomeObject implements Bar {
        second: Int
      }

      extend type SomeObject implements Baz {
        third: Float
      }
    `);
    });
    (0, mocha_1.it)('Correctly extend interface type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)((0, dedent_1.dedent) `
      interface SomeInterface {
        first: String
      }

      extend interface SomeInterface {
        second: Int
      }

      extend interface SomeInterface {
        third: Float
      }
    `);
        const someInterface = (0, definition_1.assertInterfaceType)(schema.getType('SomeInterface'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someInterface)).to.equal((0, dedent_1.dedent) `
      interface SomeInterface {
        first: String
        second: Int
        third: Float
      }
    `);
        expectASTNode(someInterface).to.equal((0, dedent_1.dedent) `
      interface SomeInterface {
        first: String
      }
    `);
        expectExtensionASTNodes(someInterface).to.equal((0, dedent_1.dedent) `
      extend interface SomeInterface {
        second: Int
      }

      extend interface SomeInterface {
        third: Float
      }
    `);
    });
    (0, mocha_1.it)('Correctly extend union type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      union SomeUnion = FirstType
      extend union SomeUnion = SecondType
      extend union SomeUnion = ThirdType

      type FirstType
      type SecondType
      type ThirdType
    `);
        const someUnion = (0, definition_1.assertUnionType)(schema.getType('SomeUnion'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someUnion)).to.equal((0, dedent_1.dedent) `
      union SomeUnion = FirstType | SecondType | ThirdType
    `);
        expectASTNode(someUnion).to.equal('union SomeUnion = FirstType');
        expectExtensionASTNodes(someUnion).to.equal((0, dedent_1.dedent) `
      extend union SomeUnion = SecondType

      extend union SomeUnion = ThirdType
    `);
    });
    (0, mocha_1.it)('Correctly extend enum type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)((0, dedent_1.dedent) `
      enum SomeEnum {
        FIRST
      }

      extend enum SomeEnum {
        SECOND
      }

      extend enum SomeEnum {
        THIRD
      }
    `);
        const someEnum = (0, definition_1.assertEnumType)(schema.getType('SomeEnum'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someEnum)).to.equal((0, dedent_1.dedent) `
      enum SomeEnum {
        FIRST
        SECOND
        THIRD
      }
    `);
        expectASTNode(someEnum).to.equal((0, dedent_1.dedent) `
      enum SomeEnum {
        FIRST
      }
    `);
        expectExtensionASTNodes(someEnum).to.equal((0, dedent_1.dedent) `
      extend enum SomeEnum {
        SECOND
      }

      extend enum SomeEnum {
        THIRD
      }
    `);
    });
    (0, mocha_1.it)('Correctly extend input object type', () => {
        const schema = (0, buildASTSchema_1.buildSchema)((0, dedent_1.dedent) `
      input SomeInput {
        first: String
      }

      extend input SomeInput {
        second: Int
      }

      extend input SomeInput {
        third: Float
      }
    `);
        const someInput = (0, definition_1.assertInputObjectType)(schema.getType('SomeInput'));
        (0, chai_1.expect)((0, printSchema_1.printType)(someInput)).to.equal((0, dedent_1.dedent) `
      input SomeInput {
        first: String
        second: Int
        third: Float
      }
    `);
        expectASTNode(someInput).to.equal((0, dedent_1.dedent) `
      input SomeInput {
        first: String
      }
    `);
        expectExtensionASTNodes(someInput).to.equal((0, dedent_1.dedent) `
      extend input SomeInput {
        second: Int
      }

      extend input SomeInput {
        third: Float
      }
    `);
    });
    (0, mocha_1.it)('Correctly assign AST nodes', () => {
        const sdl = (0, dedent_1.dedent) `
      schema {
        query: Query
      }

      type Query {
        testField(testArg: TestInput): TestUnion
      }

      input TestInput {
        testInputField: TestEnum
      }

      enum TestEnum {
        TEST_VALUE
      }

      union TestUnion = TestType

      interface TestInterface {
        interfaceField: String
      }

      type TestType implements TestInterface {
        interfaceField: String
      }

      scalar TestScalar

      directive @test(arg: TestScalar) on FIELD
    `;
        const ast = (0, parser_1.parse)(sdl, { noLocation: true });
        const schema = (0, buildASTSchema_1.buildASTSchema)(ast);
        const query = (0, definition_1.assertObjectType)(schema.getType('Query'));
        const testInput = (0, definition_1.assertInputObjectType)(schema.getType('TestInput'));
        const testEnum = (0, definition_1.assertEnumType)(schema.getType('TestEnum'));
        const testUnion = (0, definition_1.assertUnionType)(schema.getType('TestUnion'));
        const testInterface = (0, definition_1.assertInterfaceType)(schema.getType('TestInterface'));
        const testType = (0, definition_1.assertObjectType)(schema.getType('TestType'));
        const testScalar = (0, definition_1.assertScalarType)(schema.getType('TestScalar'));
        const testDirective = (0, directives_1.assertDirective)(schema.getDirective('test'));
        (0, chai_1.expect)([
            schema.astNode,
            query.astNode,
            testInput.astNode,
            testEnum.astNode,
            testUnion.astNode,
            testInterface.astNode,
            testType.astNode,
            testScalar.astNode,
            testDirective.astNode,
        ]).to.be.deep.equal(ast.definitions);
        const testField = query.getFields().testField;
        expectASTNode(testField).to.equal('testField(testArg: TestInput): TestUnion');
        expectASTNode(testField.args[0]).to.equal('testArg: TestInput');
        expectASTNode(testInput.getFields().testInputField).to.equal('testInputField: TestEnum');
        expectASTNode(testEnum.getValue('TEST_VALUE')).to.equal('TEST_VALUE');
        expectASTNode(testInterface.getFields().interfaceField).to.equal('interfaceField: String');
        expectASTNode(testType.getFields().interfaceField).to.equal('interfaceField: String');
        expectASTNode(testDirective.args[0]).to.equal('arg: TestScalar');
    });
    (0, mocha_1.it)('Root operation types with custom names', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      schema {
        query: SomeQuery
        mutation: SomeMutation
        subscription: SomeSubscription
      }
      type SomeQuery
      type SomeMutation
      type SomeSubscription
    `);
        (0, chai_1.expect)(schema.getQueryType()).to.include({ name: 'SomeQuery' });
        (0, chai_1.expect)(schema.getMutationType()).to.include({ name: 'SomeMutation' });
        (0, chai_1.expect)(schema.getSubscriptionType()).to.include({
            name: 'SomeSubscription',
        });
    });
    (0, mocha_1.it)('Default root operation type names', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query
      type Mutation
      type Subscription
    `);
        (0, chai_1.expect)(schema.getQueryType()).to.include({ name: 'Query' });
        (0, chai_1.expect)(schema.getMutationType()).to.include({ name: 'Mutation' });
        (0, chai_1.expect)(schema.getSubscriptionType()).to.include({ name: 'Subscription' });
    });
    (0, mocha_1.it)('can build invalid schema', () => {
        // Invalid schema, because it is missing query root type
        const schema = (0, buildASTSchema_1.buildSchema)('type Mutation');
        const errors = (0, validate_1.validateSchema)(schema);
        (0, chai_1.expect)(errors).to.have.lengthOf.above(0);
    });
    (0, mocha_1.it)('Do not override standard types', () => {
        // NOTE: not sure it's desired behavior to just silently ignore override
        // attempts so just documenting it here.
        const schema = (0, buildASTSchema_1.buildSchema)(`
      scalar ID

      scalar __Schema
    `);
        (0, chai_1.expect)(schema.getType('ID')).to.equal(scalars_1.GraphQLID);
        (0, chai_1.expect)(schema.getType('__Schema')).to.equal(introspection_1.__Schema);
    });
    (0, mocha_1.it)('Allows to reference introspection types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        introspectionField: __EnumValue
      }
    `);
        const queryType = (0, definition_1.assertObjectType)(schema.getType('Query'));
        (0, chai_1.expect)(queryType.getFields()).to.have.nested.property('introspectionField.type', introspection_1.__EnumValue);
        (0, chai_1.expect)(schema.getType('__EnumValue')).to.equal(introspection_1.__EnumValue);
    });
    (0, mocha_1.it)('Rejects invalid SDL', () => {
        const sdl = `
      type Query {
        foo: String @unknown
      }
    `;
        (0, chai_1.expect)(() => (0, buildASTSchema_1.buildSchema)(sdl)).to.throw('Unknown directive "@unknown".');
    });
    (0, mocha_1.it)('Allows to disable SDL validation', () => {
        const sdl = `
      type Query {
        foo: String @unknown
      }
    `;
        (0, buildASTSchema_1.buildSchema)(sdl, { assumeValid: true });
        (0, buildASTSchema_1.buildSchema)(sdl, { assumeValidSDL: true });
    });
    (0, mocha_1.it)('Throws on unknown types', () => {
        const sdl = `
      type Query {
        unknown: UnknownType
      }
    `;
        (0, chai_1.expect)(() => (0, buildASTSchema_1.buildSchema)(sdl, { assumeValidSDL: true })).to.throw('Unknown type: "UnknownType".');
    });
    (0, mocha_1.it)('Rejects invalid AST', () => {
        // @ts-expect-error (First parameter expected to be DocumentNode)
        (0, chai_1.expect)(() => (0, buildASTSchema_1.buildASTSchema)(null)).to.throw('Must provide valid Document AST');
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, buildASTSchema_1.buildASTSchema)({})).to.throw('Must provide valid Document AST');
    });
});
//# sourceMappingURL=buildASTSchema-test.js.map