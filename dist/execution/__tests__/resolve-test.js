"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
(0, mocha_1.describe)('Execute: resolve function', () => {
    function testSchema(testField) {
        return new schema_1.GraphQLSchema({
            query: new definition_1.GraphQLObjectType({
                name: 'Query',
                fields: {
                    test: testField,
                },
            }),
        });
    }
    (0, mocha_1.it)('default function accesses properties', () => {
        const result = (0, execute_1.executeSync)({
            schema: testSchema({ type: scalars_1.GraphQLString }),
            document: (0, parser_1.parse)('{ test }'),
            rootValue: { test: 'testValue' },
        });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                test: 'testValue',
            },
        });
    });
    (0, mocha_1.it)('default function calls methods', () => {
        const rootValue = {
            _secret: 'secretValue',
            test() {
                return this._secret;
            },
        };
        const result = (0, execute_1.executeSync)({
            schema: testSchema({ type: scalars_1.GraphQLString }),
            document: (0, parser_1.parse)('{ test }'),
            rootValue,
        });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {
                test: 'secretValue',
            },
        });
    });
    (0, mocha_1.it)('default function passes args and context', () => {
        class Adder {
            constructor(num) {
                this._num = num;
            }
            test(args, context) {
                return this._num + args.addend1 + context.addend2;
            }
        }
        const rootValue = new Adder(700);
        const schema = testSchema({
            type: scalars_1.GraphQLInt,
            args: {
                addend1: { type: scalars_1.GraphQLInt },
            },
        });
        const contextValue = { addend2: 9 };
        const document = (0, parser_1.parse)('{ test(addend1: 80) }');
        const result = (0, execute_1.executeSync)({ schema, document, rootValue, contextValue });
        (0, chai_1.expect)(result).to.deep.equal({
            data: { test: 789 },
        });
    });
    (0, mocha_1.it)('uses provided resolve function', () => {
        const schema = testSchema({
            type: scalars_1.GraphQLString,
            args: {
                aStr: { type: scalars_1.GraphQLString },
                aInt: { type: scalars_1.GraphQLInt },
            },
            resolve: (source, args) => JSON.stringify([source, args]),
        });
        function executeQuery(query, rootValue) {
            const document = (0, parser_1.parse)(query);
            return (0, execute_1.executeSync)({ schema, document, rootValue });
        }
        (0, chai_1.expect)(executeQuery('{ test }')).to.deep.equal({
            data: {
                test: '[null,{}]',
            },
        });
        (0, chai_1.expect)(executeQuery('{ test }', 'Source!')).to.deep.equal({
            data: {
                test: '["Source!",{}]',
            },
        });
        (0, chai_1.expect)(executeQuery('{ test(aStr: "String!") }', 'Source!')).to.deep.equal({
            data: {
                test: '["Source!",{"aStr":"String!"}]',
            },
        });
        (0, chai_1.expect)(executeQuery('{ test(aInt: -123, aStr: "String!") }', 'Source!')).to.deep.equal({
            data: {
                test: '["Source!",{"aStr":"String!","aInt":-123}]',
            },
        });
    });
});
//# sourceMappingURL=resolve-test.js.map