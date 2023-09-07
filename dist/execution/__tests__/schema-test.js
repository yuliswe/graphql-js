"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
(0, mocha_1.describe)('Execute: Handles execution with a complex schema', () => {
    (0, mocha_1.it)('executes using a schema', () => {
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
                    resolve: (obj, { width, height }) => obj.pic(width, height),
                },
                recentArticle: { type: BlogArticle },
            }),
        });
        const BlogArticle = new definition_1.GraphQLObjectType({
            name: 'Article',
            fields: {
                id: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
                isPublished: { type: scalars_1.GraphQLBoolean },
                author: { type: BlogAuthor },
                title: { type: scalars_1.GraphQLString },
                body: { type: scalars_1.GraphQLString },
                keywords: { type: new definition_1.GraphQLList(scalars_1.GraphQLString) },
            },
        });
        const BlogQuery = new definition_1.GraphQLObjectType({
            name: 'Query',
            fields: {
                article: {
                    type: BlogArticle,
                    args: { id: { type: scalars_1.GraphQLID } },
                    resolve: (_, { id }) => article(id),
                },
                feed: {
                    type: new definition_1.GraphQLList(BlogArticle),
                    resolve: () => [
                        article(1),
                        article(2),
                        article(3),
                        article(4),
                        article(5),
                        article(6),
                        article(7),
                        article(8),
                        article(9),
                        article(10),
                    ],
                },
            },
        });
        const BlogSchema = new schema_1.GraphQLSchema({
            query: BlogQuery,
        });
        function article(id) {
            return {
                id,
                isPublished: true,
                author: {
                    id: 123,
                    name: 'John Smith',
                    pic: (width, height) => getPic(123, width, height),
                    recentArticle: () => article(1),
                },
                title: 'My Article ' + id,
                body: 'This is a post',
                hidden: 'This data is not exposed in the schema',
                keywords: ['foo', 'bar', 1, true, null],
            };
        }
        function getPic(uid, width, height) {
            return {
                url: `cdn://${uid}`,
                width: `${width}`,
                height: `${height}`,
            };
        }
        const document = (0, parser_1.parse)(`
      {
        feed {
          id,
          title
        },
        article(id: "1") {
          ...articleFields,
          author {
            id,
            name,
            pic(width: 640, height: 480) {
              url,
              width,
              height
            },
            recentArticle {
              ...articleFields,
              keywords
            }
          }
        }
      }

      fragment articleFields on Article {
        id,
        isPublished,
        title,
        body,
        hidden,
        notDefined
      }
    `);
        // Note: this is intentionally not validating to ensure appropriate
        // behavior occurs when executing an invalid query.
        (0, chai_1.expect)((0, execute_1.executeSync)({ schema: BlogSchema, document })).to.deep.equal({
            data: {
                feed: [
                    { id: '1', title: 'My Article 1' },
                    { id: '2', title: 'My Article 2' },
                    { id: '3', title: 'My Article 3' },
                    { id: '4', title: 'My Article 4' },
                    { id: '5', title: 'My Article 5' },
                    { id: '6', title: 'My Article 6' },
                    { id: '7', title: 'My Article 7' },
                    { id: '8', title: 'My Article 8' },
                    { id: '9', title: 'My Article 9' },
                    { id: '10', title: 'My Article 10' },
                ],
                article: {
                    id: '1',
                    isPublished: true,
                    title: 'My Article 1',
                    body: 'This is a post',
                    author: {
                        id: '123',
                        name: 'John Smith',
                        pic: {
                            url: 'cdn://123',
                            width: 640,
                            height: 480,
                        },
                        recentArticle: {
                            id: '1',
                            isPublished: true,
                            title: 'My Article 1',
                            body: 'This is a post',
                            keywords: ['foo', 'bar', '1', 'true', null],
                        },
                    },
                },
            },
        });
    });
});
//# sourceMappingURL=schema-test.js.map