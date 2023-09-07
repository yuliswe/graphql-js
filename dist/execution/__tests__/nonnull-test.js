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
const syncError = new Error('sync');
const syncNonNullError = new Error('syncNonNull');
const promiseError = new Error('promise');
const promiseNonNullError = new Error('promiseNonNull');
const throwingData = {
    sync() {
        throw syncError;
    },
    syncNonNull() {
        throw syncNonNullError;
    },
    promise() {
        return new Promise(() => {
            throw promiseError;
        });
    },
    promiseNonNull() {
        return new Promise(() => {
            throw promiseNonNullError;
        });
    },
    syncNest() {
        return throwingData;
    },
    syncNonNullNest() {
        return throwingData;
    },
    promiseNest() {
        return new Promise((resolve) => {
            resolve(throwingData);
        });
    },
    promiseNonNullNest() {
        return new Promise((resolve) => {
            resolve(throwingData);
        });
    },
};
const nullingData = {
    sync() {
        return null;
    },
    syncNonNull() {
        return null;
    },
    promise() {
        return new Promise((resolve) => {
            resolve(null);
        });
    },
    promiseNonNull() {
        return new Promise((resolve) => {
            resolve(null);
        });
    },
    syncNest() {
        return nullingData;
    },
    syncNonNullNest() {
        return nullingData;
    },
    promiseNest() {
        return new Promise((resolve) => {
            resolve(nullingData);
        });
    },
    promiseNonNullNest() {
        return new Promise((resolve) => {
            resolve(nullingData);
        });
    },
};
const schema = (0, buildASTSchema_1.buildSchema)(`
  type DataType {
    sync: String
    syncNonNull: String!
    promise: String
    promiseNonNull: String!
    syncNest: DataType
    syncNonNullNest: DataType!
    promiseNest: DataType
    promiseNonNullNest: DataType!
  }

  schema {
    query: DataType
  }
`);
function executeQuery(query, rootValue) {
    return (0, execute_1.execute)({ schema, document: (0, parser_1.parse)(query), rootValue });
}
function patch(str) {
    return str
        .replace(/\bsync\b/g, 'promise')
        .replace(/\bsyncNonNull\b/g, 'promiseNonNull');
}
// avoids also doing any nests
function patchData(data) {
    return JSON.parse(patch(JSON.stringify(data)));
}
async function executeSyncAndAsync(query, rootValue) {
    const syncResult = (0, execute_1.executeSync)({ schema, document: (0, parser_1.parse)(query), rootValue });
    const asyncResult = await (0, execute_1.execute)({
        schema,
        document: (0, parser_1.parse)(patch(query)),
        rootValue,
    });
    (0, expectJSON_1.expectJSON)(asyncResult).toDeepEqual(patchData(syncResult));
    return syncResult;
}
(0, mocha_1.describe)('Execute: handles non-nullable types', () => {
    (0, mocha_1.describe)('nulls a nullable field', () => {
        const query = `
      {
        sync
      }
    `;
        (0, mocha_1.it)('that returns null', async () => {
            const result = await executeSyncAndAsync(query, nullingData);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { sync: null },
            });
        });
        (0, mocha_1.it)('that throws', async () => {
            const result = await executeSyncAndAsync(query, throwingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: { sync: null },
                errors: [
                    {
                        message: syncError.message,
                        path: ['sync'],
                        locations: [{ line: 3, column: 9 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('nulls a returned object that contains a non-nullable field', () => {
        const query = `
      {
        syncNest {
          syncNonNull,
        }
      }
    `;
        (0, mocha_1.it)('that returns null', async () => {
            const result = await executeSyncAndAsync(query, nullingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: { syncNest: null },
                errors: [
                    {
                        message: 'Cannot return null for non-nullable field DataType.syncNonNull.',
                        path: ['syncNest', 'syncNonNull'],
                        locations: [{ line: 4, column: 11 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('that throws', async () => {
            const result = await executeSyncAndAsync(query, throwingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: { syncNest: null },
                errors: [
                    {
                        message: syncNonNullError.message,
                        path: ['syncNest', 'syncNonNull'],
                        locations: [{ line: 4, column: 11 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('nulls a complex tree of nullable fields, each', () => {
        const query = `
      {
        syncNest {
          sync
          promise
          syncNest { sync promise }
          promiseNest { sync promise }
        }
        promiseNest {
          sync
          promise
          syncNest { sync promise }
          promiseNest { sync promise }
        }
      }
    `;
        const data = {
            syncNest: {
                sync: null,
                promise: null,
                syncNest: { sync: null, promise: null },
                promiseNest: { sync: null, promise: null },
            },
            promiseNest: {
                sync: null,
                promise: null,
                syncNest: { sync: null, promise: null },
                promiseNest: { sync: null, promise: null },
            },
        };
        (0, mocha_1.it)('that returns null', async () => {
            const result = await executeQuery(query, nullingData);
            (0, chai_1.expect)(result).to.deep.equal({ data });
        });
        (0, mocha_1.it)('that throws', async () => {
            const result = await executeQuery(query, throwingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data,
                errors: [
                    {
                        message: syncError.message,
                        path: ['syncNest', 'sync'],
                        locations: [{ line: 4, column: 11 }],
                    },
                    {
                        message: syncError.message,
                        path: ['syncNest', 'syncNest', 'sync'],
                        locations: [{ line: 6, column: 22 }],
                    },
                    {
                        message: syncError.message,
                        path: ['syncNest', 'promiseNest', 'sync'],
                        locations: [{ line: 7, column: 25 }],
                    },
                    {
                        message: syncError.message,
                        path: ['promiseNest', 'sync'],
                        locations: [{ line: 10, column: 11 }],
                    },
                    {
                        message: syncError.message,
                        path: ['promiseNest', 'syncNest', 'sync'],
                        locations: [{ line: 12, column: 22 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['syncNest', 'promise'],
                        locations: [{ line: 5, column: 11 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['syncNest', 'syncNest', 'promise'],
                        locations: [{ line: 6, column: 27 }],
                    },
                    {
                        message: syncError.message,
                        path: ['promiseNest', 'promiseNest', 'sync'],
                        locations: [{ line: 13, column: 25 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['syncNest', 'promiseNest', 'promise'],
                        locations: [{ line: 7, column: 30 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['promiseNest', 'promise'],
                        locations: [{ line: 11, column: 11 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['promiseNest', 'syncNest', 'promise'],
                        locations: [{ line: 12, column: 27 }],
                    },
                    {
                        message: promiseError.message,
                        path: ['promiseNest', 'promiseNest', 'promise'],
                        locations: [{ line: 13, column: 30 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('nulls the first nullable object after a field in a long chain of non-null fields', () => {
        const query = `
      {
        syncNest {
          syncNonNullNest {
            promiseNonNullNest {
              syncNonNullNest {
                promiseNonNullNest {
                  syncNonNull
                }
              }
            }
          }
        }
        promiseNest {
          syncNonNullNest {
            promiseNonNullNest {
              syncNonNullNest {
                promiseNonNullNest {
                  syncNonNull
                }
              }
            }
          }
        }
        anotherNest: syncNest {
          syncNonNullNest {
            promiseNonNullNest {
              syncNonNullNest {
                promiseNonNullNest {
                  promiseNonNull
                }
              }
            }
          }
        }
        anotherPromiseNest: promiseNest {
          syncNonNullNest {
            promiseNonNullNest {
              syncNonNullNest {
                promiseNonNullNest {
                  promiseNonNull
                }
              }
            }
          }
        }
      }
    `;
        const data = {
            syncNest: null,
            promiseNest: null,
            anotherNest: null,
            anotherPromiseNest: null,
        };
        (0, mocha_1.it)('that returns null', async () => {
            const result = await executeQuery(query, nullingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data,
                errors: [
                    {
                        message: 'Cannot return null for non-nullable field DataType.syncNonNull.',
                        path: [
                            'syncNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNull',
                        ],
                        locations: [{ line: 8, column: 19 }],
                    },
                    {
                        message: 'Cannot return null for non-nullable field DataType.syncNonNull.',
                        path: [
                            'promiseNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNull',
                        ],
                        locations: [{ line: 19, column: 19 }],
                    },
                    {
                        message: 'Cannot return null for non-nullable field DataType.promiseNonNull.',
                        path: [
                            'anotherNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'promiseNonNull',
                        ],
                        locations: [{ line: 30, column: 19 }],
                    },
                    {
                        message: 'Cannot return null for non-nullable field DataType.promiseNonNull.',
                        path: [
                            'anotherPromiseNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'promiseNonNull',
                        ],
                        locations: [{ line: 41, column: 19 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('that throws', async () => {
            const result = await executeQuery(query, throwingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data,
                errors: [
                    {
                        message: syncNonNullError.message,
                        path: [
                            'syncNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNull',
                        ],
                        locations: [{ line: 8, column: 19 }],
                    },
                    {
                        message: syncNonNullError.message,
                        path: [
                            'promiseNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNull',
                        ],
                        locations: [{ line: 19, column: 19 }],
                    },
                    {
                        message: promiseNonNullError.message,
                        path: [
                            'anotherNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'promiseNonNull',
                        ],
                        locations: [{ line: 30, column: 19 }],
                    },
                    {
                        message: promiseNonNullError.message,
                        path: [
                            'anotherPromiseNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'syncNonNullNest',
                            'promiseNonNullNest',
                            'promiseNonNull',
                        ],
                        locations: [{ line: 41, column: 19 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('nulls the top level if non-nullable field', () => {
        const query = `
      {
        syncNonNull
      }
    `;
        (0, mocha_1.it)('that returns null', async () => {
            const result = await executeSyncAndAsync(query, nullingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: null,
                errors: [
                    {
                        message: 'Cannot return null for non-nullable field DataType.syncNonNull.',
                        path: ['syncNonNull'],
                        locations: [{ line: 3, column: 9 }],
                    },
                ],
            });
        });
        (0, mocha_1.it)('that throws', async () => {
            const result = await executeSyncAndAsync(query, throwingData);
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: null,
                errors: [
                    {
                        message: syncNonNullError.message,
                        path: ['syncNonNull'],
                        locations: [{ line: 3, column: 9 }],
                    },
                ],
            });
        });
    });
    (0, mocha_1.describe)('Handles non-null argument', () => {
        const schemaWithNonNullArg = new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    withNonNullArg: {
                        type: scalars_1.GraphQLString,
                        args: {
                            cannotBeNull: {
                                type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                            },
                        },
                        resolve: (_, args) => 'Passed: ' + String(args.cannotBeNull),
                    },
                },
            }),
        });
        (0, mocha_1.it)('succeeds when passed non-null literal value', () => {
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query {
            withNonNullArg (cannotBeNull: "literal value")
          }
        `),
            });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    withNonNullArg: 'Passed: literal value',
                },
            });
        });
        (0, mocha_1.it)('succeeds when passed non-null variable value', () => {
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query ($testVar: String!) {
            withNonNullArg (cannotBeNull: $testVar)
          }
        `),
                variableValues: {
                    testVar: 'variable value',
                },
            });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    withNonNullArg: 'Passed: variable value',
                },
            });
        });
        (0, mocha_1.it)('succeeds when missing variable has default value', () => {
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query ($testVar: String = "default value") {
            withNonNullArg (cannotBeNull: $testVar)
          }
        `),
                variableValues: {
                // Intentionally missing variable
                },
            });
            (0, chai_1.expect)(result).to.deep.equal({
                data: {
                    withNonNullArg: 'Passed: default value',
                },
            });
        });
        (0, mocha_1.it)('field error when missing non-null arg', () => {
            // Note: validation should identify this issue first (missing args rule)
            // however execution should still protect against this.
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query {
            withNonNullArg
          }
        `),
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    withNonNullArg: null,
                },
                errors: [
                    {
                        message: 'Argument "cannotBeNull" of required type "String!" was not provided.',
                        locations: [{ line: 3, column: 13 }],
                        path: ['withNonNullArg'],
                    },
                ],
            });
        });
        (0, mocha_1.it)('field error when non-null arg provided null', () => {
            // Note: validation should identify this issue first (values of correct
            // type rule) however execution should still protect against this.
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query {
            withNonNullArg(cannotBeNull: null)
          }
        `),
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    withNonNullArg: null,
                },
                errors: [
                    {
                        message: 'Argument "cannotBeNull" of non-null type "String!" must not be null.',
                        locations: [{ line: 3, column: 42 }],
                        path: ['withNonNullArg'],
                    },
                ],
            });
        });
        (0, mocha_1.it)('field error when non-null arg not provided variable value', () => {
            // Note: validation should identify this issue first (variables in allowed
            // position rule) however execution should still protect against this.
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query ($testVar: String) {
            withNonNullArg(cannotBeNull: $testVar)
          }
        `),
                variableValues: {
                // Intentionally missing variable
                },
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    withNonNullArg: null,
                },
                errors: [
                    {
                        message: 'Argument "cannotBeNull" of required type "String!" was provided the variable "$testVar" which was not provided a runtime value.',
                        locations: [{ line: 3, column: 42 }],
                        path: ['withNonNullArg'],
                    },
                ],
            });
        });
        (0, mocha_1.it)('field error when non-null arg provided variable with explicit null value', () => {
            const result = (0, execute_1.executeSync)({
                schema: schemaWithNonNullArg,
                document: (0, parser_1.parse)(`
          query ($testVar: String = "default value") {
            withNonNullArg (cannotBeNull: $testVar)
          }
        `),
                variableValues: {
                    testVar: null,
                },
            });
            (0, expectJSON_1.expectJSON)(result).toDeepEqual({
                data: {
                    withNonNullArg: null,
                },
                errors: [
                    {
                        message: 'Argument "cannotBeNull" of non-null type "String!" must not be null.',
                        locations: [{ line: 3, column: 43 }],
                        path: ['withNonNullArg'],
                    },
                ],
            });
        });
    });
});
//# sourceMappingURL=nonnull-test.js.map