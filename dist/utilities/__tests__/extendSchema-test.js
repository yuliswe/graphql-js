"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const invariant_1 = require("../../jsutils/invariant");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const definition_1 = require("../../type/definition");
const directives_1 = require("../../type/directives");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const validate_1 = require("../../type/validate");
const graphql_1 = require("../../graphql");
const buildASTSchema_1 = require("../buildASTSchema");
const concatAST_1 = require("../concatAST");
const extendSchema_1 = require("../extendSchema");
const printSchema_1 = require("../printSchema");
function expectExtensionASTNodes(obj) {
    return (0, chai_1.expect)(obj.extensionASTNodes.map(printer_1.print).join('\n\n'));
}
function expectASTNode(obj) {
    (0, invariant_1.invariant)((obj === null || obj === void 0 ? void 0 : obj.astNode) != null);
    return (0, chai_1.expect)((0, printer_1.print)(obj.astNode));
}
function expectSchemaChanges(schema, extendedSchema) {
    const schemaDefinitions = (0, parser_1.parse)((0, printSchema_1.printSchema)(schema)).definitions.map(printer_1.print);
    return (0, chai_1.expect)((0, parser_1.parse)((0, printSchema_1.printSchema)(extendedSchema))
        .definitions.map(printer_1.print)
        .filter((def) => !schemaDefinitions.includes(def))
        .join('\n\n'));
}
(0, mocha_1.describe)('extendSchema', () => {
    (0, mocha_1.it)('returns the original schema when there are no type definitions', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)('{ field }'));
        (0, chai_1.expect)(extendedSchema).to.equal(schema);
    });
    (0, mocha_1.it)('can be used for limited execution', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        const extendAST = (0, parser_1.parse)(`
      extend type Query {
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        const result = (0, graphql_1.graphqlSync)({
            schema: extendedSchema,
            source: '{ newField }',
            rootValue: { newField: 123 },
        });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { newField: '123' },
        });
    });
    (0, mocha_1.it)('extends objects by adding new fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someObject: SomeObject
      }

      type SomeObject implements AnotherInterface & SomeInterface {
        self: SomeObject
        tree: [SomeObject]!
        """Old field description."""
        oldField: String
      }

      interface SomeInterface {
        self: SomeInterface
      }

      interface AnotherInterface {
        self: SomeObject
      }
    `);
        const extensionSDL = (0, dedent_1.dedent) `
      extend type SomeObject {
        """New field description."""
        newField(arg: Boolean): String
      }
    `;
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject implements AnotherInterface & SomeInterface {
        self: SomeObject
        tree: [SomeObject]!
        """Old field description."""
        oldField: String
        """New field description."""
        newField(arg: Boolean): String
      }
    `);
    });
    (0, mocha_1.it)('extends objects with standard type fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type Query');
        // String and Boolean are always included through introspection types
        (0, chai_1.expect)(schema.getType('Int')).to.equal(undefined);
        (0, chai_1.expect)(schema.getType('Float')).to.equal(undefined);
        (0, chai_1.expect)(schema.getType('String')).to.equal(scalars_1.GraphQLString);
        (0, chai_1.expect)(schema.getType('Boolean')).to.equal(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)(schema.getType('ID')).to.equal(undefined);
        const extendAST = (0, parser_1.parse)(`
      extend type Query {
        bool: Boolean
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        (0, chai_1.expect)(extendedSchema.getType('Int')).to.equal(undefined);
        (0, chai_1.expect)(extendedSchema.getType('Float')).to.equal(undefined);
        (0, chai_1.expect)(extendedSchema.getType('String')).to.equal(scalars_1.GraphQLString);
        (0, chai_1.expect)(extendedSchema.getType('Boolean')).to.equal(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)(extendedSchema.getType('ID')).to.equal(undefined);
        const extendTwiceAST = (0, parser_1.parse)(`
      extend type Query {
        int: Int
        float: Float
        id: ID
      }
    `);
        const extendedTwiceSchema = (0, extendSchema_1.extendSchema)(schema, extendTwiceAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedTwiceSchema)).to.deep.equal([]);
        (0, chai_1.expect)(extendedTwiceSchema.getType('Int')).to.equal(scalars_1.GraphQLInt);
        (0, chai_1.expect)(extendedTwiceSchema.getType('Float')).to.equal(scalars_1.GraphQLFloat);
        (0, chai_1.expect)(extendedTwiceSchema.getType('String')).to.equal(scalars_1.GraphQLString);
        (0, chai_1.expect)(extendedTwiceSchema.getType('Boolean')).to.equal(scalars_1.GraphQLBoolean);
        (0, chai_1.expect)(extendedTwiceSchema.getType('ID')).to.equal(scalars_1.GraphQLID);
    });
    (0, mocha_1.it)('extends enums by adding new values', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someEnum(arg: SomeEnum): SomeEnum
      }

      directive @foo(arg: SomeEnum) on SCHEMA

      enum SomeEnum {
        """Old value description."""
        OLD_VALUE
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend enum SomeEnum {
        """New value description."""
        NEW_VALUE
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      enum SomeEnum {
        """Old value description."""
        OLD_VALUE
        """New value description."""
        NEW_VALUE
      }
    `);
    });
    (0, mocha_1.it)('extends unions by adding new types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someUnion: SomeUnion
      }

      union SomeUnion = Foo | Biz

      type Foo { foo: String }
      type Biz { biz: String }
      type Bar { bar: String }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend union SomeUnion = Bar
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      union SomeUnion = Foo | Biz | Bar
    `);
    });
    (0, mocha_1.it)('allows extension of union by adding itself', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      union SomeUnion
    `);
        const extendAST = (0, parser_1.parse)(`
      extend union SomeUnion = SomeUnion
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.have.lengthOf.above(0);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      union SomeUnion = SomeUnion
    `);
    });
    (0, mocha_1.it)('extends inputs by adding new fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someInput(arg: SomeInput): String
      }

      directive @foo(arg: SomeInput) on SCHEMA

      input SomeInput {
        """Old field description."""
        oldField: String
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend input SomeInput {
        """New field description."""
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      input SomeInput {
        """Old field description."""
        oldField: String
        """New field description."""
        newField: String
      }
    `);
    });
    (0, mocha_1.it)('extends scalars by adding new directives', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someScalar(arg: SomeScalar): SomeScalar
      }

      directive @foo(arg: SomeScalar) on SCALAR

      input FooInput {
        foo: SomeScalar
      }

      scalar SomeScalar
    `);
        const extensionSDL = (0, dedent_1.dedent) `
      extend scalar SomeScalar @foo
    `;
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
        const someScalar = (0, definition_1.assertScalarType)(extendedSchema.getType('SomeScalar'));
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectExtensionASTNodes(someScalar).to.equal(extensionSDL);
    });
    (0, mocha_1.it)('extends scalars by adding specifiedBy directive', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        foo: Foo
      }

      scalar Foo

      directive @foo on SCALAR
    `);
        const extensionSDL = (0, dedent_1.dedent) `
      extend scalar Foo @foo

      extend scalar Foo @specifiedBy(url: "https://example.com/foo_spec")
    `;
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
        const foo = (0, definition_1.assertScalarType)(extendedSchema.getType('Foo'));
        (0, chai_1.expect)(foo.specifiedByURL).to.equal('https://example.com/foo_spec');
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectExtensionASTNodes(foo).to.equal(extensionSDL);
    });
    (0, mocha_1.it)('correctly assign AST nodes to new and extended types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query

      scalar SomeScalar
      enum SomeEnum
      union SomeUnion
      input SomeInput
      type SomeObject
      interface SomeInterface

      directive @foo on SCALAR
    `);
        const firstExtensionAST = (0, parser_1.parse)(`
      extend type Query {
        newField(testArg: TestInput): TestEnum
      }

      extend scalar SomeScalar @foo

      extend enum SomeEnum {
        NEW_VALUE
      }

      extend union SomeUnion = SomeObject

      extend input SomeInput {
        newField: String
      }

      extend interface SomeInterface {
        newField: String
      }

      enum TestEnum {
        TEST_VALUE
      }

      input TestInput {
        testInputField: TestEnum
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, firstExtensionAST);
        const secondExtensionAST = (0, parser_1.parse)(`
      extend type Query {
        oneMoreNewField: TestUnion
      }

      extend scalar SomeScalar @test

      extend enum SomeEnum {
        ONE_MORE_NEW_VALUE
      }

      extend union SomeUnion = TestType

      extend input SomeInput {
        oneMoreNewField: String
      }

      extend interface SomeInterface {
        oneMoreNewField: String
      }

      union TestUnion = TestType

      interface TestInterface {
        interfaceField: String
      }

      type TestType implements TestInterface {
        interfaceField: String
      }

      directive @test(arg: Int) repeatable on FIELD | SCALAR
    `);
        const extendedTwiceSchema = (0, extendSchema_1.extendSchema)(extendedSchema, secondExtensionAST);
        const extendedInOneGoSchema = (0, extendSchema_1.extendSchema)(schema, (0, concatAST_1.concatAST)([firstExtensionAST, secondExtensionAST]));
        (0, chai_1.expect)((0, printSchema_1.printSchema)(extendedInOneGoSchema)).to.equal((0, printSchema_1.printSchema)(extendedTwiceSchema));
        const query = (0, definition_1.assertObjectType)(extendedTwiceSchema.getType('Query'));
        const someEnum = (0, definition_1.assertEnumType)(extendedTwiceSchema.getType('SomeEnum'));
        const someUnion = (0, definition_1.assertUnionType)(extendedTwiceSchema.getType('SomeUnion'));
        const someScalar = (0, definition_1.assertScalarType)(extendedTwiceSchema.getType('SomeScalar'));
        const someInput = (0, definition_1.assertInputObjectType)(extendedTwiceSchema.getType('SomeInput'));
        const someInterface = (0, definition_1.assertInterfaceType)(extendedTwiceSchema.getType('SomeInterface'));
        const testInput = (0, definition_1.assertInputObjectType)(extendedTwiceSchema.getType('TestInput'));
        const testEnum = (0, definition_1.assertEnumType)(extendedTwiceSchema.getType('TestEnum'));
        const testUnion = (0, definition_1.assertUnionType)(extendedTwiceSchema.getType('TestUnion'));
        const testType = (0, definition_1.assertObjectType)(extendedTwiceSchema.getType('TestType'));
        const testInterface = (0, definition_1.assertInterfaceType)(extendedTwiceSchema.getType('TestInterface'));
        const testDirective = (0, directives_1.assertDirective)(extendedTwiceSchema.getDirective('test'));
        (0, chai_1.expect)(testType.extensionASTNodes).to.deep.equal([]);
        (0, chai_1.expect)(testEnum.extensionASTNodes).to.deep.equal([]);
        (0, chai_1.expect)(testUnion.extensionASTNodes).to.deep.equal([]);
        (0, chai_1.expect)(testInput.extensionASTNodes).to.deep.equal([]);
        (0, chai_1.expect)(testInterface.extensionASTNodes).to.deep.equal([]);
        (0, chai_1.expect)([
            testInput.astNode,
            testEnum.astNode,
            testUnion.astNode,
            testInterface.astNode,
            testType.astNode,
            testDirective.astNode,
            ...query.extensionASTNodes,
            ...someScalar.extensionASTNodes,
            ...someEnum.extensionASTNodes,
            ...someUnion.extensionASTNodes,
            ...someInput.extensionASTNodes,
            ...someInterface.extensionASTNodes,
        ]).to.have.members([
            ...firstExtensionAST.definitions,
            ...secondExtensionAST.definitions,
        ]);
        const newField = query.getFields().newField;
        expectASTNode(newField).to.equal('newField(testArg: TestInput): TestEnum');
        expectASTNode(newField.args[0]).to.equal('testArg: TestInput');
        expectASTNode(query.getFields().oneMoreNewField).to.equal('oneMoreNewField: TestUnion');
        expectASTNode(someEnum.getValue('NEW_VALUE')).to.equal('NEW_VALUE');
        expectASTNode(someEnum.getValue('ONE_MORE_NEW_VALUE')).to.equal('ONE_MORE_NEW_VALUE');
        expectASTNode(someInput.getFields().newField).to.equal('newField: String');
        expectASTNode(someInput.getFields().oneMoreNewField).to.equal('oneMoreNewField: String');
        expectASTNode(someInterface.getFields().newField).to.equal('newField: String');
        expectASTNode(someInterface.getFields().oneMoreNewField).to.equal('oneMoreNewField: String');
        expectASTNode(testInput.getFields().testInputField).to.equal('testInputField: TestEnum');
        expectASTNode(testEnum.getValue('TEST_VALUE')).to.equal('TEST_VALUE');
        expectASTNode(testInterface.getFields().interfaceField).to.equal('interfaceField: String');
        expectASTNode(testType.getFields().interfaceField).to.equal('interfaceField: String');
        expectASTNode(testDirective.args[0]).to.equal('arg: Int');
    });
    (0, mocha_1.it)('builds types with deprecated fields/values', () => {
        const schema = new schema_1.GraphQLSchema({});
        const extendAST = (0, parser_1.parse)(`
      type SomeObject {
        deprecatedField: String @deprecated(reason: "not used anymore")
      }

      enum SomeEnum {
        DEPRECATED_VALUE @deprecated(reason: "do not use")
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        const someType = (0, definition_1.assertObjectType)(extendedSchema.getType('SomeObject'));
        (0, chai_1.expect)(someType.getFields().deprecatedField).to.include({
            deprecationReason: 'not used anymore',
        });
        const someEnum = (0, definition_1.assertEnumType)(extendedSchema.getType('SomeEnum'));
        (0, chai_1.expect)(someEnum.getValue('DEPRECATED_VALUE')).to.include({
            deprecationReason: 'do not use',
        });
    });
    (0, mocha_1.it)('extends objects with deprecated fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('type SomeObject');
        const extendAST = (0, parser_1.parse)(`
      extend type SomeObject {
        deprecatedField: String @deprecated(reason: "not used anymore")
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        const someType = (0, definition_1.assertObjectType)(extendedSchema.getType('SomeObject'));
        (0, chai_1.expect)(someType.getFields().deprecatedField).to.include({
            deprecationReason: 'not used anymore',
        });
    });
    (0, mocha_1.it)('extends enums with deprecated values', () => {
        const schema = (0, buildASTSchema_1.buildSchema)('enum SomeEnum');
        const extendAST = (0, parser_1.parse)(`
      extend enum SomeEnum {
        DEPRECATED_VALUE @deprecated(reason: "do not use")
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        const someEnum = (0, definition_1.assertEnumType)(extendedSchema.getType('SomeEnum'));
        (0, chai_1.expect)(someEnum.getValue('DEPRECATED_VALUE')).to.include({
            deprecationReason: 'do not use',
        });
    });
    (0, mocha_1.it)('adds new unused types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        dummy: String
      }
    `);
        const extensionSDL = (0, dedent_1.dedent) `
      type DummyUnionMember {
        someField: String
      }

      enum UnusedEnum {
        SOME_VALUE
      }

      input UnusedInput {
        someField: String
      }

      interface UnusedInterface {
        someField: String
      }

      type UnusedObject {
        someField: String
      }

      union UnusedUnion = DummyUnionMember
    `;
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal(extensionSDL);
    });
    (0, mocha_1.it)('extends objects by adding new fields with arguments', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type SomeObject

      type Query {
        someObject: SomeObject
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      input NewInputObj {
        field1: Int
        field2: [Float]
        field3: String!
      }

      extend type SomeObject {
        newField(arg1: String, arg2: NewInputObj!): String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject {
        newField(arg1: String, arg2: NewInputObj!): String
      }

      input NewInputObj {
        field1: Int
        field2: [Float]
        field3: String!
      }
    `);
    });
    (0, mocha_1.it)('extends objects by adding new fields with existing types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someObject: SomeObject
      }

      type SomeObject
      enum SomeEnum { VALUE }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend type SomeObject {
        newField(arg1: SomeEnum!): SomeEnum
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject {
        newField(arg1: SomeEnum!): SomeEnum
      }
    `);
    });
    (0, mocha_1.it)('extends objects by adding implemented interfaces', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someObject: SomeObject
      }

      type SomeObject {
        foo: String
      }

      interface SomeInterface {
        foo: String
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend type SomeObject implements SomeInterface
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject implements SomeInterface {
        foo: String
      }
    `);
    });
    (0, mocha_1.it)('extends objects by including new types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someObject: SomeObject
      }

      type SomeObject {
        oldField: String
      }
    `);
        const newTypesSDL = (0, dedent_1.dedent) `
      enum NewEnum {
        VALUE
      }

      interface NewInterface {
        baz: String
      }

      type NewObject implements NewInterface {
        baz: String
      }

      scalar NewScalar

      union NewUnion = NewObject`;
        const extendAST = (0, parser_1.parse)(`
      ${newTypesSDL}
      extend type SomeObject {
        newObject: NewObject
        newInterface: NewInterface
        newUnion: NewUnion
        newScalar: NewScalar
        newEnum: NewEnum
        newTree: [SomeObject]!
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject {
        oldField: String
        newObject: NewObject
        newInterface: NewInterface
        newUnion: NewUnion
        newScalar: NewScalar
        newEnum: NewEnum
        newTree: [SomeObject]!
      }

      ${newTypesSDL}
    `);
    });
    (0, mocha_1.it)('extends objects by adding implemented new interfaces', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someObject: SomeObject
      }

      type SomeObject implements OldInterface {
        oldField: String
      }

      interface OldInterface {
        oldField: String
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend type SomeObject implements NewInterface {
        newField: String
      }

      interface NewInterface {
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      type SomeObject implements OldInterface & NewInterface {
        oldField: String
        newField: String
      }

      interface NewInterface {
        newField: String
      }
    `);
    });
    (0, mocha_1.it)('extends different types multiple times', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someScalar: SomeScalar
        someObject(someInput: SomeInput): SomeObject
        someInterface: SomeInterface
        someEnum: SomeEnum
        someUnion: SomeUnion
      }

      scalar SomeScalar

      type SomeObject implements SomeInterface {
        oldField: String
      }

      interface SomeInterface {
        oldField: String
      }

      enum SomeEnum {
        OLD_VALUE
      }

      union SomeUnion = SomeObject

      input SomeInput {
        oldField: String
      }
    `);
        const newTypesSDL = (0, dedent_1.dedent) `
      scalar NewScalar

      scalar AnotherNewScalar

      type NewObject {
        foo: String
      }

      type AnotherNewObject {
        foo: String
      }

      interface NewInterface {
        newField: String
      }

      interface AnotherNewInterface {
        anotherNewField: String
      }
    `;
        const schemaWithNewTypes = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(newTypesSDL));
        expectSchemaChanges(schema, schemaWithNewTypes).to.equal(newTypesSDL);
        const extendAST = (0, parser_1.parse)(`
      extend scalar SomeScalar @specifiedBy(url: "http://example.com/foo_spec")

      extend type SomeObject implements NewInterface {
        newField: String
      }

      extend type SomeObject implements AnotherNewInterface {
        anotherNewField: String
      }

      extend enum SomeEnum {
        NEW_VALUE
      }

      extend enum SomeEnum {
        ANOTHER_NEW_VALUE
      }

      extend union SomeUnion = NewObject

      extend union SomeUnion = AnotherNewObject

      extend input SomeInput {
        newField: String
      }

      extend input SomeInput {
        anotherNewField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schemaWithNewTypes, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      scalar SomeScalar @specifiedBy(url: "http://example.com/foo_spec")

      type SomeObject implements SomeInterface & NewInterface & AnotherNewInterface {
        oldField: String
        newField: String
        anotherNewField: String
      }

      enum SomeEnum {
        OLD_VALUE
        NEW_VALUE
        ANOTHER_NEW_VALUE
      }

      union SomeUnion = SomeObject | NewObject | AnotherNewObject

      input SomeInput {
        oldField: String
        newField: String
        anotherNewField: String
      }

      ${newTypesSDL}
    `);
    });
    (0, mocha_1.it)('extends interfaces by adding new fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      interface SomeInterface {
        oldField: String
      }

      interface AnotherInterface implements SomeInterface {
        oldField: String
      }

      type SomeObject implements SomeInterface & AnotherInterface {
        oldField: String
      }

      type Query {
        someInterface: SomeInterface
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend interface SomeInterface {
        newField: String
      }

      extend interface AnotherInterface {
        newField: String
      }

      extend type SomeObject {
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      interface SomeInterface {
        oldField: String
        newField: String
      }

      interface AnotherInterface implements SomeInterface {
        oldField: String
        newField: String
      }

      type SomeObject implements SomeInterface & AnotherInterface {
        oldField: String
        newField: String
      }
    `);
    });
    (0, mocha_1.it)('extends interfaces by adding new implemented interfaces', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      interface SomeInterface {
        oldField: String
      }

      interface AnotherInterface implements SomeInterface {
        oldField: String
      }

      type SomeObject implements SomeInterface & AnotherInterface {
        oldField: String
      }

      type Query {
        someInterface: SomeInterface
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      interface NewInterface {
        newField: String
      }

      extend interface AnotherInterface implements NewInterface {
        newField: String
      }

      extend type SomeObject implements NewInterface {
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      interface AnotherInterface implements SomeInterface & NewInterface {
        oldField: String
        newField: String
      }

      type SomeObject implements SomeInterface & AnotherInterface & NewInterface {
        oldField: String
        newField: String
      }

      interface NewInterface {
        newField: String
      }
    `);
    });
    (0, mocha_1.it)('allows extension of interface with missing Object fields', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someInterface: SomeInterface
      }

      type SomeObject implements SomeInterface {
        oldField: SomeInterface
      }

      interface SomeInterface {
        oldField: SomeInterface
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend interface SomeInterface {
        newField: String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.have.lengthOf.above(0);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      interface SomeInterface {
        oldField: SomeInterface
        newField: String
      }
    `);
    });
    (0, mocha_1.it)('extends interfaces multiple times', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        someInterface: SomeInterface
      }

      interface SomeInterface {
        some: SomeInterface
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend interface SomeInterface {
        newFieldA: Int
      }

      extend interface SomeInterface {
        newFieldB(test: Boolean): String
      }
    `);
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal((0, dedent_1.dedent) `
      interface SomeInterface {
        some: SomeInterface
        newFieldA: Int
        newFieldB(test: Boolean): String
      }
    `);
    });
    (0, mocha_1.it)('may extend mutations and subscriptions', () => {
        const mutationSchema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        queryField: String
      }

      type Mutation {
        mutationField: String
      }

      type Subscription {
        subscriptionField: String
      }
    `);
        const ast = (0, parser_1.parse)(`
      extend type Query {
        newQueryField: Int
      }

      extend type Mutation {
        newMutationField: Int
      }

      extend type Subscription {
        newSubscriptionField: Int
      }
    `);
        const originalPrint = (0, printSchema_1.printSchema)(mutationSchema);
        const extendedSchema = (0, extendSchema_1.extendSchema)(mutationSchema, ast);
        (0, chai_1.expect)(extendedSchema).to.not.equal(mutationSchema);
        (0, chai_1.expect)((0, printSchema_1.printSchema)(mutationSchema)).to.equal(originalPrint);
        (0, chai_1.expect)((0, printSchema_1.printSchema)(extendedSchema)).to.equal((0, dedent_1.dedent) `
      type Query {
        queryField: String
        newQueryField: Int
      }

      type Mutation {
        mutationField: String
        newMutationField: Int
      }

      type Subscription {
        subscriptionField: String
        newSubscriptionField: Int
      }
    `);
    });
    (0, mocha_1.it)('may extend directives with new directive', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      type Query {
        foo: String
      }
    `);
        const extensionSDL = (0, dedent_1.dedent) `
      """New directive."""
      directive @new(enable: Boolean!, tag: String) repeatable on QUERY | FIELD
    `;
        const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
        (0, chai_1.expect)((0, validate_1.validateSchema)(extendedSchema)).to.deep.equal([]);
        expectSchemaChanges(schema, extendedSchema).to.equal(extensionSDL);
    });
    (0, mocha_1.it)('Rejects invalid SDL', () => {
        const schema = new schema_1.GraphQLSchema({});
        const extendAST = (0, parser_1.parse)('extend schema @unknown');
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, extendAST)).to.throw('Unknown directive "@unknown".');
    });
    (0, mocha_1.it)('Allows to disable SDL validation', () => {
        const schema = new schema_1.GraphQLSchema({});
        const extendAST = (0, parser_1.parse)('extend schema @unknown');
        (0, extendSchema_1.extendSchema)(schema, extendAST, { assumeValid: true });
        (0, extendSchema_1.extendSchema)(schema, extendAST, { assumeValidSDL: true });
    });
    (0, mocha_1.it)('Throws on unknown types', () => {
        const schema = new schema_1.GraphQLSchema({});
        const ast = (0, parser_1.parse)(`
      type Query {
        unknown: UnknownType
      }
    `);
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, ast, { assumeValidSDL: true })).to.throw('Unknown type: "UnknownType".');
    });
    (0, mocha_1.it)('Rejects invalid AST', () => {
        const schema = new schema_1.GraphQLSchema({});
        // @ts-expect-error (Second argument expects DocumentNode)
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, null)).to.throw('Must provide valid Document AST');
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, {})).to.throw('Must provide valid Document AST');
    });
    (0, mocha_1.it)('does not allow replacing a default directive', () => {
        const schema = new schema_1.GraphQLSchema({});
        const extendAST = (0, parser_1.parse)(`
      directive @include(if: Boolean!) on FIELD | FRAGMENT_SPREAD
    `);
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, extendAST)).to.throw('Directive "@include" already exists in the schema. It cannot be redefined.');
    });
    (0, mocha_1.it)('does not allow replacing an existing enum value', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      enum SomeEnum {
        ONE
      }
    `);
        const extendAST = (0, parser_1.parse)(`
      extend enum SomeEnum {
        ONE
      }
    `);
        (0, chai_1.expect)(() => (0, extendSchema_1.extendSchema)(schema, extendAST)).to.throw('Enum value "SomeEnum.ONE" already exists in the schema. It cannot also be defined in this type extension.');
    });
    (0, mocha_1.describe)('can add additional root operation types', () => {
        (0, mocha_1.it)('does not automatically include common root type names', () => {
            const schema = new schema_1.GraphQLSchema({});
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)('type Mutation'));
            (0, chai_1.expect)(extendedSchema.getType('Mutation')).to.not.equal(undefined);
            (0, chai_1.expect)(extendedSchema.getMutationType()).to.equal(undefined);
        });
        (0, mocha_1.it)('adds schema definition missing in the original schema', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        directive @foo on SCHEMA
        type Foo
      `);
            (0, chai_1.expect)(schema.getQueryType()).to.equal(undefined);
            const extensionSDL = (0, dedent_1.dedent) `
        schema @foo {
          query: Foo
        }
      `;
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
            const queryType = extendedSchema.getQueryType();
            (0, chai_1.expect)(queryType).to.include({ name: 'Foo' });
            expectASTNode(extendedSchema).to.equal(extensionSDL);
        });
        (0, mocha_1.it)('adds new root types via schema extension', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query
        type MutationRoot
      `);
            const extensionSDL = (0, dedent_1.dedent) `
        extend schema {
          mutation: MutationRoot
        }
      `;
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
            const mutationType = extendedSchema.getMutationType();
            (0, chai_1.expect)(mutationType).to.include({ name: 'MutationRoot' });
            expectExtensionASTNodes(extendedSchema).to.equal(extensionSDL);
        });
        (0, mocha_1.it)('adds directive via schema extension', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query

        directive @foo on SCHEMA
      `);
            const extensionSDL = (0, dedent_1.dedent) `
        extend schema @foo
      `;
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, (0, parser_1.parse)(extensionSDL));
            expectExtensionASTNodes(extendedSchema).to.equal(extensionSDL);
        });
        (0, mocha_1.it)('adds multiple new root types via schema extension', () => {
            const schema = (0, buildASTSchema_1.buildSchema)('type Query');
            const extendAST = (0, parser_1.parse)(`
        extend schema {
          mutation: Mutation
          subscription: Subscription
        }

        type Mutation
        type Subscription
      `);
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
            const mutationType = extendedSchema.getMutationType();
            (0, chai_1.expect)(mutationType).to.include({ name: 'Mutation' });
            const subscriptionType = extendedSchema.getSubscriptionType();
            (0, chai_1.expect)(subscriptionType).to.include({ name: 'Subscription' });
        });
        (0, mocha_1.it)('applies multiple schema extensions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)('type Query');
            const extendAST = (0, parser_1.parse)(`
        extend schema {
          mutation: Mutation
        }
        type Mutation

        extend schema {
          subscription: Subscription
        }
        type Subscription
      `);
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
            const mutationType = extendedSchema.getMutationType();
            (0, chai_1.expect)(mutationType).to.include({ name: 'Mutation' });
            const subscriptionType = extendedSchema.getSubscriptionType();
            (0, chai_1.expect)(subscriptionType).to.include({ name: 'Subscription' });
        });
        (0, mocha_1.it)('schema extension AST are available from schema object', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query

        directive @foo on SCHEMA
      `);
            const extendAST = (0, parser_1.parse)(`
        extend schema {
          mutation: Mutation
        }
        type Mutation

        extend schema {
          subscription: Subscription
        }
        type Subscription
      `);
            const extendedSchema = (0, extendSchema_1.extendSchema)(schema, extendAST);
            const secondExtendAST = (0, parser_1.parse)('extend schema @foo');
            const extendedTwiceSchema = (0, extendSchema_1.extendSchema)(extendedSchema, secondExtendAST);
            expectExtensionASTNodes(extendedTwiceSchema).to.equal((0, dedent_1.dedent) `
        extend schema {
          mutation: Mutation
        }

        extend schema {
          subscription: Subscription
        }

        extend schema @foo
      `);
        });
    });
});
//# sourceMappingURL=extendSchema-test.js.map