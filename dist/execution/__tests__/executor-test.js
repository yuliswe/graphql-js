"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const resolveOnNextTick_1 = require("../../__testUtils__/resolveOnNextTick");
const inspect_1 = require("../../jsutils/inspect");
const invariant_1 = require("../../jsutils/invariant");
const kinds_1 = require("../../language/kinds");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
(0, mocha_1.describe)('Execute: Handles basic execution tasks', () => {
    (0, mocha_1.it)('throws if no document is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, execute_1.executeSync)({ schema })).to.throw('Must provide document.');
    });
    (0, mocha_1.it)('throws if no schema is provided', () => {
        const document = (0, parser_1.parse)('{ field }');
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, execute_1.executeSync)({ document })).to.throw('Expected undefined to be a GraphQL schema.');
    });
    (0, mocha_1.it)('throws on invalid variables', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    fieldA: {
                        type: scalars_1.GraphQLString,
                        args: { argA: { type: scalars_1.GraphQLInt } },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query ($a: Int) {
        fieldA(argA: $a)
      }
    `);
        const variableValues = '{ "a": 1 }';
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, execute_1.executeSync)({ schema, document, variableValues })).to.throw('Variables must be provided as an Object where each property is a variable value. Perhaps look to see if an unparsed JSON string was provided.');
    });
    (0, mocha_1.it)('executes arbitrary code', async () => {
        const data = {
            a: () => 'Apple',
            b: () => 'Banana',
            c: () => 'Cookie',
            d: () => 'Donut',
            e: () => 'Egg',
            f: 'Fish',
            // Called only by DataType::pic static resolver
            pic: (size) => 'Pic of size: ' + size,
            deep: () => deepData,
            promise: promiseData,
        };
        const deepData = {
            a: () => 'Already Been Done',
            b: () => 'Boring',
            c: () => ['Contrived', undefined, 'Confusing'],
            deeper: () => [data, null, data],
        };
        function promiseData() {
            return Promise.resolve(data);
        }
        const DataType = new definition_1.GraphQLObjectType({
            name: 'DataType',
            fields: () => ({
                a: { type: scalars_1.GraphQLString },
                b: { type: scalars_1.GraphQLString },
                c: { type: scalars_1.GraphQLString },
                d: { type: scalars_1.GraphQLString },
                e: { type: scalars_1.GraphQLString },
                f: { type: scalars_1.GraphQLString },
                pic: {
                    args: { size: { type: scalars_1.GraphQLInt } },
                    type: scalars_1.GraphQLString,
                    resolve: (obj, { size }) => obj.pic(size),
                },
                deep: { type: DeepDataType },
                promise: { type: DataType },
            }),
        });
        const DeepDataType = new definition_1.GraphQLObjectType({
            name: 'DeepDataType',
            fields: {
                a: { type: scalars_1.GraphQLString },
                b: { type: scalars_1.GraphQLString },
                c: { type: new definition_1.GraphQLList(scalars_1.GraphQLString) },
                deeper: { type: new definition_1.GraphQLList(DataType) },
            },
        });
        const document = (0, parser_1.parse)(`
      query ($size: Int) {
        a,
        b,
        x: c
        ...c
        f
        ...on DataType {
          pic(size: $size)
          promise {
            a
          }
        }
        deep {
          a
          b
          c
          deeper {
            a
            b
          }
        }
      }

      fragment c on DataType {
        d
        e
      }
    `);
        const result = await (0, execute_1.execute)({
            schema: new schema_1.GraphQLSchema({ query: DataType }),
            document,
            rootValue: data,
            variableValues: { size: 100 },
        });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                a: 'Apple',
                b: 'Banana',
                x: 'Cookie',
                d: 'Donut',
                e: 'Egg',
                f: 'Fish',
                pic: 'Pic of size: 100',
                promise: { a: 'Apple' },
                deep: {
                    a: 'Already Been Done',
                    b: 'Boring',
                    c: ['Contrived', null, 'Confusing'],
                    deeper: [
                        { a: 'Apple', b: 'Banana' },
                        null,
                        { a: 'Apple', b: 'Banana' },
                    ],
                },
            },
        });
    });
    (0, mocha_1.it)('merges parallel fragments', () => {
        const Type = new definition_1.GraphQLObjectType({
            name: 'Type',
            fields: () => ({
                a: { type: scalars_1.GraphQLString, resolve: () => 'Apple' },
                b: { type: scalars_1.GraphQLString, resolve: () => 'Banana' },
                c: { type: scalars_1.GraphQLString, resolve: () => 'Cherry' },
                deep: { type: Type, resolve: () => ({}) },
            }),
        });
        const schema = new schema_1.GraphQLSchema({ query: Type });
        const document = (0, parser_1.parse)(`
      { a, ...FragOne, ...FragTwo }

      fragment FragOne on Type {
        b
        deep { b, deeper: deep { b } }
      }

      fragment FragTwo on Type {
        c
        deep { c, deeper: deep { c } }
      }
    `);
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                a: 'Apple',
                b: 'Banana',
                c: 'Cherry',
                deep: {
                    b: 'Banana',
                    c: 'Cherry',
                    deeper: {
                        b: 'Banana',
                        c: 'Cherry',
                    },
                },
            },
        });
    });
    (0, mocha_1.it)('provides info about current execution state', () => {
        let resolvedInfo;
        const testType = new definition_1.GraphQLObjectType({
            name: 'Test',
            fields: {
                test: {
                    type: scalars_1.GraphQLString,
                    resolve(_val, _args, _ctx, info) {
                        resolvedInfo = info;
                    },
                },
            },
        });
        const schema = new schema_1.GraphQLSchema({ query: testType });
        const document = (0, parser_1.parse)('query ($var: String) { result: test }');
        const rootValue = { root: 'val' };
        const variableValues = { var: 'abc' };
        (0, execute_1.executeSync)({ schema, document, rootValue, variableValues });
        (0, chai_1.expect)(resolvedInfo).to.have.all.keys('fieldName', 'fieldNodes', 'returnType', 'parentType', 'path', 'schema', 'fragments', 'rootValue', 'operation', 'variableValues');
        const operation = document.definitions[0];
        (0, invariant_1.invariant)(operation.kind === kinds_1.Kind.OPERATION_DEFINITION);
        (0, chai_1.expect)(resolvedInfo).to.include({
            fieldName: 'test',
            returnType: scalars_1.GraphQLString,
            parentType: testType,
            schema,
            rootValue,
            operation,
        });
        const field = operation.selectionSet.selections[0];
        (0, chai_1.expect)(resolvedInfo).to.deep.include({
            fieldNodes: [field],
            path: { prev: undefined, key: 'result', typename: 'Test' },
            variableValues: { var: 'abc' },
        });
    });
    (0, mocha_1.it)('populates path correctly with complex types', () => {
        let path;
        const someObject = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                test: {
                    type: scalars_1.GraphQLString,
                    resolve(_val, _args, _ctx, info) {
                        path = info.path;
                    },
                },
            },
        });
        const someUnion = new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: [someObject],
            resolveType() {
                return 'SomeObject';
            },
        });
        const testType = new definition_1.GraphQLObjectType({
            name: 'SomeQuery',
            fields: {
                test: {
                    type: new definition_1.GraphQLNonNull(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(someUnion))),
                },
            },
        });
        const schema = new schema_1.GraphQLSchema({ query: testType });
        const rootValue = { test: [{}] };
        const document = (0, parser_1.parse)(`
      query {
        l1: test {
          ... on SomeObject {
            l2: test
          }
        }
      }
    `);
        (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(path).to.deep.equal({
            key: 'l2',
            typename: 'SomeObject',
            prev: {
                key: 0,
                typename: undefined,
                prev: {
                    key: 'l1',
                    typename: 'SomeQuery',
                    prev: undefined,
                },
            },
        });
    });
    (0, mocha_1.it)('threads root value context correctly', () => {
        let resolvedRootValue;
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: {
                        type: scalars_1.GraphQLString,
                        resolve(rootValueArg) {
                            resolvedRootValue = rootValueArg;
                        },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)('query Example { a }');
        const rootValue = { contextThing: 'thing' };
        (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(resolvedRootValue).to.equal(rootValue);
    });
    (0, mocha_1.it)('correctly threads arguments', () => {
        let resolvedArgs;
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    b: {
                        args: {
                            numArg: { type: scalars_1.GraphQLInt },
                            stringArg: { type: scalars_1.GraphQLString },
                        },
                        type: scalars_1.GraphQLString,
                        resolve(_, args) {
                            resolvedArgs = args;
                        },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Example {
        b(numArg: 123, stringArg: "foo")
      }
    `);
        (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(resolvedArgs).to.deep.equal({ numArg: 123, stringArg: 'foo' });
    });
    (0, mocha_1.it)('nulls out error subtrees', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    sync: { type: scalars_1.GraphQLString },
                    syncError: { type: scalars_1.GraphQLString },
                    syncRawError: { type: scalars_1.GraphQLString },
                    syncReturnError: { type: scalars_1.GraphQLString },
                    syncReturnErrorList: { type: new definition_1.GraphQLList(scalars_1.GraphQLString) },
                    async: { type: scalars_1.GraphQLString },
                    asyncReject: { type: scalars_1.GraphQLString },
                    asyncRejectWithExtensions: { type: scalars_1.GraphQLString },
                    asyncRawReject: { type: scalars_1.GraphQLString },
                    asyncEmptyReject: { type: scalars_1.GraphQLString },
                    asyncError: { type: scalars_1.GraphQLString },
                    asyncRawError: { type: scalars_1.GraphQLString },
                    asyncReturnError: { type: scalars_1.GraphQLString },
                    asyncReturnErrorWithExtensions: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      {
        sync
        syncError
        syncRawError
        syncReturnError
        syncReturnErrorList
        async
        asyncReject
        asyncRawReject
        asyncEmptyReject
        asyncError
        asyncRawError
        asyncReturnError
        asyncReturnErrorWithExtensions
      }
    `);
        const rootValue = {
            sync() {
                return 'sync';
            },
            syncError() {
                throw new Error('Error getting syncError');
            },
            syncRawError() {
                // eslint-disable-next-line @typescript-eslint/no-throw-literal
                throw 'Error getting syncRawError';
            },
            syncReturnError() {
                return new Error('Error getting syncReturnError');
            },
            syncReturnErrorList() {
                return [
                    'sync0',
                    new Error('Error getting syncReturnErrorList1'),
                    'sync2',
                    new Error('Error getting syncReturnErrorList3'),
                ];
            },
            async() {
                return new Promise((resolve) => resolve('async'));
            },
            asyncReject() {
                return new Promise((_, reject) => reject(new Error('Error getting asyncReject')));
            },
            asyncRawReject() {
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject('Error getting asyncRawReject');
            },
            asyncEmptyReject() {
                // eslint-disable-next-line prefer-promise-reject-errors
                return Promise.reject();
            },
            asyncError() {
                return new Promise(() => {
                    throw new Error('Error getting asyncError');
                });
            },
            asyncRawError() {
                return new Promise(() => {
                    // eslint-disable-next-line @typescript-eslint/no-throw-literal
                    throw 'Error getting asyncRawError';
                });
            },
            asyncReturnError() {
                return Promise.resolve(new Error('Error getting asyncReturnError'));
            },
            asyncReturnErrorWithExtensions() {
                const error = new Error('Error getting asyncReturnErrorWithExtensions');
                // @ts-expect-error
                error.extensions = { foo: 'bar' };
                return Promise.resolve(error);
            },
        };
        const result = await (0, execute_1.execute)({ schema, document, rootValue });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: {
                sync: 'sync',
                syncError: null,
                syncRawError: null,
                syncReturnError: null,
                syncReturnErrorList: ['sync0', null, 'sync2', null],
                async: 'async',
                asyncReject: null,
                asyncRawReject: null,
                asyncEmptyReject: null,
                asyncError: null,
                asyncRawError: null,
                asyncReturnError: null,
                asyncReturnErrorWithExtensions: null,
            },
            errors: [
                {
                    message: 'Error getting syncError',
                    locations: [{ line: 4, column: 9 }],
                    path: ['syncError'],
                },
                {
                    message: 'Unexpected error value: "Error getting syncRawError"',
                    locations: [{ line: 5, column: 9 }],
                    path: ['syncRawError'],
                },
                {
                    message: 'Error getting syncReturnError',
                    locations: [{ line: 6, column: 9 }],
                    path: ['syncReturnError'],
                },
                {
                    message: 'Error getting syncReturnErrorList1',
                    locations: [{ line: 7, column: 9 }],
                    path: ['syncReturnErrorList', 1],
                },
                {
                    message: 'Error getting syncReturnErrorList3',
                    locations: [{ line: 7, column: 9 }],
                    path: ['syncReturnErrorList', 3],
                },
                {
                    message: 'Error getting asyncReject',
                    locations: [{ line: 9, column: 9 }],
                    path: ['asyncReject'],
                },
                {
                    message: 'Unexpected error value: "Error getting asyncRawReject"',
                    locations: [{ line: 10, column: 9 }],
                    path: ['asyncRawReject'],
                },
                {
                    message: 'Unexpected error value: undefined',
                    locations: [{ line: 11, column: 9 }],
                    path: ['asyncEmptyReject'],
                },
                {
                    message: 'Error getting asyncError',
                    locations: [{ line: 12, column: 9 }],
                    path: ['asyncError'],
                },
                {
                    message: 'Unexpected error value: "Error getting asyncRawError"',
                    locations: [{ line: 13, column: 9 }],
                    path: ['asyncRawError'],
                },
                {
                    message: 'Error getting asyncReturnError',
                    locations: [{ line: 14, column: 9 }],
                    path: ['asyncReturnError'],
                },
                {
                    message: 'Error getting asyncReturnErrorWithExtensions',
                    locations: [{ line: 15, column: 9 }],
                    path: ['asyncReturnErrorWithExtensions'],
                    extensions: { foo: 'bar' },
                },
            ],
        });
    });
    (0, mocha_1.it)('nulls error subtree for promise rejection #1071', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    foods: {
                        type: new definition_1.GraphQLList(new definition_1.GraphQLObjectType({
                            name: 'Food',
                            fields: {
                                name: { type: scalars_1.GraphQLString },
                            },
                        })),
                        resolve() {
                            return Promise.reject(new Error('Oops'));
                        },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query {
        foods {
          name
        }
      }
    `);
        const result = await (0, execute_1.execute)({ schema, document });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: { foods: null },
            errors: [
                {
                    locations: [{ column: 9, line: 3 }],
                    message: 'Oops',
                    path: ['foods'],
                },
            ],
        });
    });
    (0, mocha_1.it)('handles sync errors combined with rejections', async () => {
        let isAsyncResolverFinished = false;
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    syncNullError: {
                        type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                        resolve: () => null,
                    },
                    asyncNullError: {
                        type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                        async resolve() {
                            await (0, resolveOnNextTick_1.resolveOnNextTick)();
                            await (0, resolveOnNextTick_1.resolveOnNextTick)();
                            await (0, resolveOnNextTick_1.resolveOnNextTick)();
                            isAsyncResolverFinished = true;
                            return null;
                        },
                    },
                },
            }),
        });
        // Order is important here, as the promise has to be created before the synchronous error is thrown
        const document = (0, parser_1.parse)(`
      {
        asyncNullError
        syncNullError
      }
    `);
        const result = (0, execute_1.execute)({ schema, document });
        (0, chai_1.expect)(isAsyncResolverFinished).to.equal(false);
        (0, expectJSON_1.expectJSON)(await result).toDeepEqual({
            data: null,
            errors: [
                {
                    message: 'Cannot return null for non-nullable field Query.syncNullError.',
                    locations: [{ line: 4, column: 9 }],
                    path: ['syncNullError'],
                },
            ],
        });
        (0, chai_1.expect)(isAsyncResolverFinished).to.equal(true);
    });
    (0, mocha_1.it)('Full response path is included for non-nullable fields', () => {
        const A = new definition_1.GraphQLObjectType({
            name: 'A',
            fields: () => ({
                nullableA: {
                    type: A,
                    resolve: () => ({}),
                },
                nonNullA: {
                    type: new definition_1.GraphQLNonNull(A),
                    resolve: () => ({}),
                },
                throws: {
                    type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                    resolve: () => {
                        throw new Error('Catch me if you can');
                    },
                },
            }),
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'query',
                fields: () => ({
                    nullableA: {
                        type: A,
                        resolve: () => ({}),
                    },
                }),
            }),
        });
        const document = (0, parser_1.parse)(`
      query {
        nullableA {
          aliasedA: nullableA {
            nonNullA {
              anotherA: nonNullA {
                throws
              }
            }
          }
        }
      }
    `);
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: {
                nullableA: {
                    aliasedA: null,
                },
            },
            errors: [
                {
                    message: 'Catch me if you can',
                    locations: [{ line: 7, column: 17 }],
                    path: ['nullableA', 'aliasedA', 'nonNullA', 'anotherA', 'throws'],
                },
            ],
        });
    });
    (0, mocha_1.it)('uses the inline operation if no operation name is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ a }');
        const rootValue = { a: 'b' };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(result).to.deep.equal({ data: { a: 'b' } });
    });
    (0, mocha_1.it)('uses the only operation if no operation name is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('query Example { a }');
        const rootValue = { a: 'b' };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(result).to.deep.equal({ data: { a: 'b' } });
    });
    (0, mocha_1.it)('uses the named operation if operation name is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Example { first: a }
      query OtherExample { second: a }
    `);
        const rootValue = { a: 'b' };
        const operationName = 'OtherExample';
        const result = (0, execute_1.executeSync)({ schema, document, rootValue, operationName });
        (0, chai_1.expect)(result).to.deep.equal({ data: { second: 'b' } });
    });
    (0, mocha_1.it)('provides error if no operation is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('fragment Example on Type { a }');
        const rootValue = { a: 'b' };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [{ message: 'Must provide an operation.' }],
        });
    });
    (0, mocha_1.it)('errors if no op name is provided with multiple operations', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Example { a }
      query OtherExample { a }
    `);
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Must provide operation name if query contains multiple operations.',
                },
            ],
        });
    });
    (0, mocha_1.it)('errors if unknown operation name is provided', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Example { a }
      query OtherExample { a }
    `);
        const operationName = 'UnknownExample';
        const result = (0, execute_1.executeSync)({ schema, document, operationName });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [{ message: 'Unknown operation named "UnknownExample".' }],
        });
    });
    (0, mocha_1.it)('errors if empty string is provided as operation name', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ a }');
        const operationName = '';
        const result = (0, execute_1.executeSync)({ schema, document, operationName });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [{ message: 'Unknown operation named "".' }],
        });
    });
    (0, mocha_1.it)('uses the query schema for queries', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Q',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
            mutation: new definition_1.GraphQLObjectType({
                name: 'M',
                fields: {
                    c: { type: scalars_1.GraphQLString },
                },
            }),
            subscription: new definition_1.GraphQLObjectType({
                name: 'S',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Q { a }
      mutation M { c }
      subscription S { a }
    `);
        const rootValue = { a: 'b', c: 'd' };
        const operationName = 'Q';
        const result = (0, execute_1.executeSync)({ schema, document, rootValue, operationName });
        (0, chai_1.expect)(result).to.deep.equal({ data: { a: 'b' } });
    });
    (0, mocha_1.it)('uses the mutation schema for mutations', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Q',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
            mutation: new definition_1.GraphQLObjectType({
                name: 'M',
                fields: {
                    c: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Q { a }
      mutation M { c }
    `);
        const rootValue = { a: 'b', c: 'd' };
        const operationName = 'M';
        const result = (0, execute_1.executeSync)({ schema, document, rootValue, operationName });
        (0, chai_1.expect)(result).to.deep.equal({ data: { c: 'd' } });
    });
    (0, mocha_1.it)('uses the subscription schema for subscriptions', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Q',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
            subscription: new definition_1.GraphQLObjectType({
                name: 'S',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      query Q { a }
      subscription S { a }
    `);
        const rootValue = { a: 'b', c: 'd' };
        const operationName = 'S';
        const result = (0, execute_1.executeSync)({ schema, document, rootValue, operationName });
        (0, chai_1.expect)(result).to.deep.equal({ data: { a: 'b' } });
    });
    (0, mocha_1.it)('resolves to an error if schema does not support operation', () => {
        const schema = new schema_1.GraphQLSchema({ assumeValid: true });
        const document = (0, parser_1.parse)(`
      query Q { __typename }
      mutation M { __typename }
      subscription S { __typename }
    `);
        (0, expectJSON_1.expectJSON)((0, execute_1.executeSync)({ schema, document, operationName: 'Q' })).toDeepEqual({
            data: null,
            errors: [
                {
                    message: 'Schema is not configured to execute query operation.',
                    locations: [{ line: 2, column: 7 }],
                },
            ],
        });
        (0, expectJSON_1.expectJSON)((0, execute_1.executeSync)({ schema, document, operationName: 'M' })).toDeepEqual({
            data: null,
            errors: [
                {
                    message: 'Schema is not configured to execute mutation operation.',
                    locations: [{ line: 3, column: 7 }],
                },
            ],
        });
        (0, expectJSON_1.expectJSON)((0, execute_1.executeSync)({ schema, document, operationName: 'S' })).toDeepEqual({
            data: null,
            errors: [
                {
                    message: 'Schema is not configured to execute subscription operation.',
                    locations: [{ line: 4, column: 7 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('correct field ordering despite execution order', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                    b: { type: scalars_1.GraphQLString },
                    c: { type: scalars_1.GraphQLString },
                    d: { type: scalars_1.GraphQLString },
                    e: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ a, b, c, d, e }');
        const rootValue = {
            a: () => 'a',
            b: () => new Promise((resolve) => resolve('b')),
            c: () => 'c',
            d: () => new Promise((resolve) => resolve('d')),
            e: () => 'e',
        };
        const result = await (0, execute_1.execute)({ schema, document, rootValue });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { a: 'a', b: 'b', c: 'c', d: 'd', e: 'e' },
        });
    });
    (0, mocha_1.it)('Avoids recursion', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      {
        a
        ...Frag
        ...Frag
      }

      fragment Frag on Type {
        a,
        ...Frag
      }
    `);
        const rootValue = { a: 'b' };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { a: 'b' },
        });
    });
    (0, mocha_1.it)('ignores missing sub selections on fields', () => {
        const someType = new definition_1.GraphQLObjectType({
            name: 'SomeType',
            fields: {
                b: { type: scalars_1.GraphQLString },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    a: { type: someType },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ a }');
        const rootValue = { a: { b: 'c' } };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { a: {} },
        });
    });
    (0, mocha_1.it)('does not include illegal fields in output', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Q',
                fields: {
                    a: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ thisIsIllegalDoNotIncludeMe }');
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {},
        });
    });
    (0, mocha_1.it)('does not include arguments that were not set', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Type',
                fields: {
                    field: {
                        type: scalars_1.GraphQLString,
                        resolve: (_source, args) => (0, inspect_1.inspect)(args),
                        args: {
                            a: { type: scalars_1.GraphQLBoolean },
                            b: { type: scalars_1.GraphQLBoolean },
                            c: { type: scalars_1.GraphQLBoolean },
                            d: { type: scalars_1.GraphQLInt },
                            e: { type: scalars_1.GraphQLInt },
                        },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ field(a: true, c: false, e: 0) }');
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                field: '{ a: true, c: false, e: 0 }',
            },
        });
    });
    (0, mocha_1.it)('fails when an isTypeOf check is not met', async () => {
        class Special {
            constructor(value) {
                this.value = value;
            }
        }
        class NotSpecial {
            constructor(value) {
                this.value = value;
            }
        }
        const SpecialType = new definition_1.GraphQLObjectType({
            name: 'SpecialType',
            isTypeOf(obj, context) {
                const result = obj instanceof Special;
                return (context === null || context === void 0 ? void 0 : context.async) ? Promise.resolve(result) : result;
            },
            fields: { value: { type: scalars_1.GraphQLString } },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    specials: { type: new definition_1.GraphQLList(SpecialType) },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ specials { value } }');
        const rootValue = {
            specials: [new Special('foo'), new NotSpecial('bar')],
        };
        const result = (0, execute_1.executeSync)({ schema, document, rootValue });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: {
                specials: [{ value: 'foo' }, null],
            },
            errors: [
                {
                    message: 'Expected value of type "SpecialType" but got: { value: "bar" }.',
                    locations: [{ line: 1, column: 3 }],
                    path: ['specials', 1],
                },
            ],
        });
        const contextValue = { async: true };
        const asyncResult = await (0, execute_1.execute)({
            schema,
            document,
            rootValue,
            contextValue,
        });
        (0, chai_1.expect)(asyncResult).to.deep.equal(result);
    });
    (0, mocha_1.it)('fails when serialize of custom scalar does not return a value', () => {
        const customScalar = new definition_1.GraphQLScalarType({
            name: 'CustomScalar',
            serialize() {
                /* returns nothing */
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    customScalar: {
                        type: customScalar,
                        resolve: () => 'CUSTOM_VALUE',
                    },
                },
            }),
        });
        const result = (0, execute_1.executeSync)({ schema, document: (0, parser_1.parse)('{ customScalar }') });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: { customScalar: null },
            errors: [
                {
                    message: 'Expected `CustomScalar.serialize("CUSTOM_VALUE")` to return non-nullable value, returned: undefined',
                    locations: [{ line: 1, column: 3 }],
                    path: ['customScalar'],
                },
            ],
        });
    });
    (0, mocha_1.it)('executes ignoring invalid non-executable definitions', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)(`
      { foo }

      type Query { bar: String }
    `);
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(result).to.deep.equal({ data: { foo: null } });
    });
    (0, mocha_1.it)('uses a custom field resolver', () => {
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('{ foo }');
        const result = (0, execute_1.executeSync)({
            schema,
            document,
            fieldResolver(_source, _args, _context, info) {
                // For the purposes of test, just return the name of the field!
                return info.fieldName;
            },
        });
        (0, chai_1.expect)(result).to.deep.equal({ data: { foo: 'foo' } });
    });
    (0, mocha_1.it)('uses a custom type resolver', () => {
        const document = (0, parser_1.parse)('{ foo { bar } }');
        const fooInterface = new definition_1.GraphQLInterfaceType({
            name: 'FooInterface',
            fields: {
                bar: { type: scalars_1.GraphQLString },
            },
        });
        const fooObject = new definition_1.GraphQLObjectType({
            name: 'FooObject',
            interfaces: [fooInterface],
            fields: {
                bar: { type: scalars_1.GraphQLString },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    foo: { type: fooInterface },
                },
            }),
            types: [fooObject],
        });
        const rootValue = { foo: { bar: 'bar' } };
        let possibleTypes;
        const result = (0, execute_1.executeSync)({
            schema,
            document,
            rootValue,
            typeResolver(_source, _context, info, abstractType) {
                // Resolver should be able to figure out all possible types on its own
                possibleTypes = info.schema.getPossibleTypes(abstractType);
                return 'FooObject';
            },
        });
        (0, chai_1.expect)(result).to.deep.equal({ data: { foo: { bar: 'bar' } } });
        (0, chai_1.expect)(possibleTypes).to.deep.equal([fooObject]);
    });
    (0, mocha_1.it)('uses a custom type resolver', () => {
        const document = (0, parser_1.parse)('{ foo { f1, f2, f3, f4, f5 } }');
        const fooInterface = new definition_1.GraphQLInterfaceType({
            name: 'FooInterface',
            fields: {
                bar: { type: scalars_1.GraphQLString },
            },
        });
        const fooObject = new definition_1.GraphQLObjectType({
            name: 'FooObject',
            interfaces: [fooInterface],
            fields: {
                f1: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
                f2: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
                f3: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
                f4: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
                f5: { type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString) },
            },
        });
        const schema = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    foo: { type: fooInterface },
                },
            }),
            types: [fooObject],
        });
    });
});
//# sourceMappingURL=executor-test.js.map