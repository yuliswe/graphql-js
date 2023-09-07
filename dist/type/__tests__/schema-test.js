"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const directiveLocation_1 = require("../../language/directiveLocation");
const printSchema_1 = require("../../utilities/printSchema");
const definition_1 = require("../definition");
const directives_1 = require("../directives");
const scalars_1 = require("../scalars");
const schema_1 = require("../schema");
(0, mocha_1.describe)('Type System: Schema', () => {
    (0, mocha_1.it)('Define sample schema', () => {
        const BlogImage = new definition_1.GraphQLObjectType({
            name: 'Image',
            fields: {
                url: { type: scalars_1.GraphQLString },
                width: { type: scalars_1.GraphQLInt },
                height: { type: scalars_1.GraphQLInt },
            },
        });
        const BlogAuthor = new definition_1.GraphQLObjectType({
            name: 'Author',
            fields: () => ({
                id: { type: scalars_1.GraphQLString },
                name: { type: scalars_1.GraphQLString },
                pic: {
                    args: { width: { type: scalars_1.GraphQLInt }, height: { type: scalars_1.GraphQLInt } },
                    type: BlogImage,
                },
                recentArticle: { type: BlogArticle },
            }),
        });
        const BlogArticle = new definition_1.GraphQLObjectType({
            name: 'Article',
            fields: {
                id: { type: scalars_1.GraphQLString },
                isPublished: { type: scalars_1.GraphQLBoolean },
                author: { type: BlogAuthor },
                title: { type: scalars_1.GraphQLString },
                body: { type: scalars_1.GraphQLString },
            },
        });
        const BlogQuery = new definition_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                article: {
                    args: { id: { type: scalars_1.GraphQLString } },
                    type: BlogArticle,
                },
                feed: {
                    type: new definition_1.GraphQLList(BlogArticle),
                },
            },
        });
        const BlogMutation = new definition_1.GraphQLObjectType({
            name: 'Mutation',
            fields: {
                writeArticle: {
                    type: BlogArticle,
                },
            },
        });
        const BlogSubscription = new definition_1.GraphQLObjectType({
            name: 'Subscription',
            fields: {
                articleSubscribe: {
                    args: { id: { type: scalars_1.GraphQLString } },
                    type: BlogArticle,
                },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            description: 'Sample schema',
            query: BlogQuery,
            mutation: BlogMutation,
            subscription: BlogSubscription,
        });
        (0, chai_1.expect)((0, printSchema_1.printSchema)(schema)).to.equal((0, dedent_1.dedent) `
      """Sample schema"""
      schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
      }

      type Query {
        article(id: String): Article
        feed: [Article]
      }

      type Article {
        id: String
        isPublished: Boolean
        author: Author
        title: String
        body: String
      }

      type Author {
        id: String
        name: String
        pic(width: Int, height: Int): Image
        recentArticle: Article
      }

      type Image {
        url: String
        width: Int
        height: Int
      }

      type Mutation {
        writeArticle: Article
      }

      type Subscription {
        articleSubscribe(id: String): Article
      }
    `);
    });
    (0, mocha_1.describe)('Root types', () => {
        const testType = new definition_1.GraphQLObjectType({ name: 'TestType', fields: {} });
        (0, mocha_1.it)('defines a query root', () => {
            const schema = new schema_1.GraphQLSchema({ query: testType });
            (0, chai_1.expect)(schema.getQueryType()).to.equal(testType);
            (0, chai_1.expect)(schema.getTypeMap()).to.include.keys('TestType');
        });
        (0, mocha_1.it)('defines a mutation root', () => {
            const schema = new schema_1.GraphQLSchema({ mutation: testType });
            (0, chai_1.expect)(schema.getMutationType()).to.equal(testType);
            (0, chai_1.expect)(schema.getTypeMap()).to.include.keys('TestType');
        });
        (0, mocha_1.it)('defines a subscription root', () => {
            const schema = new schema_1.GraphQLSchema({ subscription: testType });
            (0, chai_1.expect)(schema.getSubscriptionType()).to.equal(testType);
            (0, chai_1.expect)(schema.getTypeMap()).to.include.keys('TestType');
        });
    });
    (0, mocha_1.describe)('Type Map', () => {
        (0, mocha_1.it)('includes interface possible types in the type map', () => {
            const SomeInterface = new definition_1.GraphQLInterfaceType({
                name: 'SomeInterface',
                fields: {},
            });
            const SomeSubtype = new definition_1.GraphQLObjectType({
                name: 'SomeSubtype',
                fields: {},
                interfaces: [SomeInterface],
            });
            const schema = new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        iface: { type: SomeInterface },
                    },
                }),
                types: [SomeSubtype],
            });
            (0, chai_1.expect)(schema.getType('SomeInterface')).to.equal(SomeInterface);
            (0, chai_1.expect)(schema.getType('SomeSubtype')).to.equal(SomeSubtype);
            (0, chai_1.expect)(schema.isSubType(SomeInterface, SomeSubtype)).to.equal(true);
        });
        (0, mocha_1.it)("includes interface's thunk subtypes in the type map", () => {
            const SomeInterface = new definition_1.GraphQLInterfaceType({
                name: 'SomeInterface',
                fields: {},
                interfaces: () => [AnotherInterface],
            });
            const AnotherInterface = new definition_1.GraphQLInterfaceType({
                name: 'AnotherInterface',
                fields: {},
            });
            const SomeSubtype = new definition_1.GraphQLObjectType({
                name: 'SomeSubtype',
                fields: {},
                interfaces: () => [SomeInterface],
            });
            const schema = new schema_1.GraphQLSchema({ types: [SomeSubtype] });
            (0, chai_1.expect)(schema.getType('SomeInterface')).to.equal(SomeInterface);
            (0, chai_1.expect)(schema.getType('AnotherInterface')).to.equal(AnotherInterface);
            (0, chai_1.expect)(schema.getType('SomeSubtype')).to.equal(SomeSubtype);
        });
        (0, mocha_1.it)('includes nested input objects in the map', () => {
            const NestedInputObject = new definition_1.GraphQLInputObjectType({
                name: 'NestedInputObject',
                fields: {},
            });
            const SomeInputObject = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: { nested: { type: NestedInputObject } },
            });
            const schema = new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        something: {
                            type: scalars_1.GraphQLString,
                            args: { input: { type: SomeInputObject } },
                        },
                    },
                }),
            });
            (0, chai_1.expect)(schema.getType('SomeInputObject')).to.equal(SomeInputObject);
            (0, chai_1.expect)(schema.getType('NestedInputObject')).to.equal(NestedInputObject);
        });
        (0, mocha_1.it)('includes input types only used in directives', () => {
            const directive = new directives_1.GraphQLDirective({
                name: 'dir',
                locations: [directiveLocation_1.DirectiveLocation.OBJECT],
                args: {
                    arg: {
                        type: new definition_1.GraphQLInputObjectType({ name: 'Foo', fields: {} }),
                    },
                    argList: {
                        type: new definition_1.GraphQLList(new definition_1.GraphQLInputObjectType({ name: 'Bar', fields: {} })),
                    },
                },
            });
            const schema = new schema_1.GraphQLSchema({ directives: [directive] });
            (0, chai_1.expect)(schema.getTypeMap()).to.include.keys('Foo', 'Bar');
        });
    });
    (0, mocha_1.it)('preserves the order of user provided types', () => {
        const aType = new definition_1.GraphQLObjectType({
            name: 'A',
            fields: {
                sub: { type: new definition_1.GraphQLScalarType({ name: 'ASub' }) },
            },
        });
        const zType = new definition_1.GraphQLObjectType({
            name: 'Z',
            fields: {
                sub: { type: new definition_1.GraphQLScalarType({ name: 'ZSub' }) },
            },
        });
        const queryType = new definition_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                a: { type: aType },
                z: { type: zType },
                sub: { type: new definition_1.GraphQLScalarType({ name: 'QuerySub' }) },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            types: [zType, queryType, aType],
            query: queryType,
        });
        const typeNames = Object.keys(schema.getTypeMap());
        (0, chai_1.expect)(typeNames).to.deep.equal([
            'Z',
            'ZSub',
            'Query',
            'QuerySub',
            'A',
            'ASub',
            'Boolean',
            'String',
            '__Schema',
            '__Type',
            '__TypeKind',
            '__Field',
            '__InputValue',
            '__EnumValue',
            '__Directive',
            '__DirectiveLocation',
        ]);
        // Also check that this order is stable
        const copySchema = new schema_1.GraphQLSchema(schema.toConfig());
        (0, chai_1.expect)(Object.keys(copySchema.getTypeMap())).to.deep.equal(typeNames);
    });
    (0, mocha_1.it)('can be Object.toStringified', () => {
        const schema = new schema_1.GraphQLSchema({});
        (0, chai_1.expect)(Object.prototype.toString.call(schema)).to.equal('[object GraphQLSchema]');
    });
    (0, mocha_1.describe)('Validity', () => {
        (0, mocha_1.describe)('when not assumed valid', () => {
            (0, mocha_1.it)('configures the schema to still needing validation', () => {
                (0, chai_1.expect)(new schema_1.GraphQLSchema({
                    assumeValid: false,
                }).__validationErrors).to.equal(undefined);
            });
            (0, mocha_1.it)('checks the configuration for mistakes', () => {
                // @ts-expect-error
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema(JSON.parse)).to.throw();
                // @ts-expect-error
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ types: {} })).to.throw();
                // @ts-expect-error
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ directives: {} })).to.throw();
            });
        });
        (0, mocha_1.describe)('A Schema must contain uniquely named types', () => {
            (0, mocha_1.it)('rejects a Schema which redefines a built-in type', () => {
                const FakeString = new definition_1.GraphQLScalarType({ name: 'String' });
                const QueryType = new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        normal: { type: scalars_1.GraphQLString },
                        fake: { type: FakeString },
                    },
                });
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ query: QueryType })).to.throw('Schema must contain uniquely named types but contains multiple types named "String".');
            });
            (0, mocha_1.it)('rejects a Schema when a provided type has no name', () => {
                const query = new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: { foo: { type: scalars_1.GraphQLString } },
                });
                const types = [{}, query, {}];
                // @ts-expect-error
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ query, types })).to.throw('One of the provided types for building the Schema is missing a name.');
            });
            (0, mocha_1.it)('rejects a Schema which defines an object type twice', () => {
                const types = [
                    new definition_1.GraphQLObjectType({ name: 'SameName', fields: {} }),
                    new definition_1.GraphQLObjectType({ name: 'SameName', fields: {} }),
                ];
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ types })).to.throw('Schema must contain uniquely named types but contains multiple types named "SameName".');
            });
            (0, mocha_1.it)('rejects a Schema which defines fields with conflicting types', () => {
                const fields = {};
                const QueryType = new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        a: { type: new definition_1.GraphQLObjectType({ name: 'SameName', fields }) },
                        b: { type: new definition_1.GraphQLObjectType({ name: 'SameName', fields }) },
                    },
                });
                (0, chai_1.expect)(() => new schema_1.GraphQLSchema({ query: QueryType })).to.throw('Schema must contain uniquely named types but contains multiple types named "SameName".');
            });
        });
        (0, mocha_1.describe)('when assumed valid', () => {
            (0, mocha_1.it)('configures the schema to have no errors', () => {
                (0, chai_1.expect)(new schema_1.GraphQLSchema({
                    assumeValid: true,
                }).__validationErrors).to.deep.equal([]);
            });
        });
    });
});
//# sourceMappingURL=schema-test.js.map