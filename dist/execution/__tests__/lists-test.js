"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const parser_1 = require("../../language/parser");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const execute_1 = require("../execute");
(0, mocha_1.describe)('Execute: Accepts any iterable as list value', () => {
    function complete(rootValue) {
        return (0, execute_1.executeSync)({
            schema: (0, buildASTSchema_1.buildSchema)('type Query { listField: [String] }'),
            document: (0, parser_1.parse)('{ listField }'),
            rootValue,
        });
    }
    (0, mocha_1.it)('Accepts a Set as a List value', () => {
        const listField = new Set(['apple', 'banana', 'apple', 'coconut']);
        (0, chai_1.expect)(complete({ listField })).to.deep.equal({
            data: { listField: ['apple', 'banana', 'coconut'] },
        });
    });
    (0, mocha_1.it)('Accepts an Generator function as a List value', () => {
        function* listField() {
            yield 'one';
            yield 2;
            yield true;
        }
        (0, chai_1.expect)(complete({ listField })).to.deep.equal({
            data: { listField: ['one', '2', 'true'] },
        });
    });
    (0, mocha_1.it)('Accepts function arguments as a List value', () => {
        function getArgs(..._args) {
            return arguments;
        }
        const listField = getArgs('one', 'two');
        (0, chai_1.expect)(complete({ listField })).to.deep.equal({
            data: { listField: ['one', 'two'] },
        });
    });
    (0, mocha_1.it)('Does not accept (Iterable) String-literal as a List value', () => {
        const listField = 'Singular';
        (0, expectJSON_1.expectJSON)(complete({ listField })).toDeepEqual({
            data: { listField: null },
            errors: [
                {
                    message: 'Expected Iterable, but did not find one for field "Query.listField".',
                    locations: [{ line: 1, column: 3 }],
                    path: ['listField'],
                },
            ],
        });
    });
});
(0, mocha_1.describe)('Execute: Handles list nullability', () => {
    async function complete(args) {
        const { listField, as } = args;
        const schema = (0, buildASTSchema_1.buildSchema)(`type Query { listField: ${as} }`);
        const document = (0, parser_1.parse)('{ listField }');
        const result = await executeQuery(listField);
        // Promise<Array<T>> === Array<T>
        (0, expectJSON_1.expectJSON)(await executeQuery(promisify(listField))).toDeepEqual(result);
        if (Array.isArray(listField)) {
            const listOfPromises = listField.map(promisify);
            // Array<Promise<T>> === Array<T>
            (0, expectJSON_1.expectJSON)(await executeQuery(listOfPromises)).toDeepEqual(result);
            // Promise<Array<Promise<T>>> === Array<T>
            (0, expectJSON_1.expectJSON)(await executeQuery(promisify(listOfPromises))).toDeepEqual(result);
        }
        return result;
        function executeQuery(listValue) {
            return (0, execute_1.execute)({ schema, document, rootValue: { listField: listValue } });
        }
        function promisify(value) {
            return value instanceof Error
                ? Promise.reject(value)
                : Promise.resolve(value);
        }
    }
    (0, mocha_1.it)('Contains values', async () => {
        const listField = [1, 2];
        (0, chai_1.expect)(await complete({ listField, as: '[Int]' })).to.deep.equal({
            data: { listField: [1, 2] },
        });
        (0, chai_1.expect)(await complete({ listField, as: '[Int]!' })).to.deep.equal({
            data: { listField: [1, 2] },
        });
        (0, chai_1.expect)(await complete({ listField, as: '[Int!]' })).to.deep.equal({
            data: { listField: [1, 2] },
        });
        (0, chai_1.expect)(await complete({ listField, as: '[Int!]!' })).to.deep.equal({
            data: { listField: [1, 2] },
        });
    });
    (0, mocha_1.it)('Contains null', async () => {
        const listField = [1, null, 2];
        const errors = [
            {
                message: 'Cannot return null for non-nullable field Query.listField.',
                locations: [{ line: 1, column: 3 }],
                path: ['listField', 1],
            },
        ];
        (0, chai_1.expect)(await complete({ listField, as: '[Int]' })).to.deep.equal({
            data: { listField: [1, null, 2] },
        });
        (0, chai_1.expect)(await complete({ listField, as: '[Int]!' })).to.deep.equal({
            data: { listField: [1, null, 2] },
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]' })).toDeepEqual({
            data: { listField: null },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]!' })).toDeepEqual({
            data: null,
            errors,
        });
    });
    (0, mocha_1.it)('Returns null', async () => {
        const listField = null;
        const errors = [
            {
                message: 'Cannot return null for non-nullable field Query.listField.',
                locations: [{ line: 1, column: 3 }],
                path: ['listField'],
            },
        ];
        (0, chai_1.expect)(await complete({ listField, as: '[Int]' })).to.deep.equal({
            data: { listField: null },
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int]!' })).toDeepEqual({
            data: null,
            errors,
        });
        (0, chai_1.expect)(await complete({ listField, as: '[Int!]' })).to.deep.equal({
            data: { listField: null },
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]!' })).toDeepEqual({
            data: null,
            errors,
        });
    });
    (0, mocha_1.it)('Contains error', async () => {
        const listField = [1, new Error('bad'), 2];
        const errors = [
            {
                message: 'bad',
                locations: [{ line: 1, column: 3 }],
                path: ['listField', 1],
            },
        ];
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int]' })).toDeepEqual({
            data: { listField: [1, null, 2] },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int]!' })).toDeepEqual({
            data: { listField: [1, null, 2] },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]' })).toDeepEqual({
            data: { listField: null },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]!' })).toDeepEqual({
            data: null,
            errors,
        });
    });
    (0, mocha_1.it)('Results in error', async () => {
        const listField = new Error('bad');
        const errors = [
            {
                message: 'bad',
                locations: [{ line: 1, column: 3 }],
                path: ['listField'],
            },
        ];
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int]' })).toDeepEqual({
            data: { listField: null },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int]!' })).toDeepEqual({
            data: null,
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]' })).toDeepEqual({
            data: { listField: null },
            errors,
        });
        (0, expectJSON_1.expectJSON)(await complete({ listField, as: '[Int!]!' })).toDeepEqual({
            data: null,
            errors,
        });
    });
});
//# sourceMappingURL=lists-test.js.map