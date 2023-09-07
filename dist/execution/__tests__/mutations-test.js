"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const resolveOnNextTick_1 = require("../../__testUtils__/resolveOnNextTick");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
class NumberHolder {
    constructor(originalNumber) {
        this.theNumber = originalNumber;
    }
}
class Root {
    constructor(originalNumber) {
        this.numberHolder = new NumberHolder(originalNumber);
    }
    immediatelyChangeTheNumber(newNumber) {
        this.numberHolder.theNumber = newNumber;
        return this.numberHolder;
    }
    async promiseToChangeTheNumber(newNumber) {
        await (0, resolveOnNextTick_1.resolveOnNextTick)();
        return this.immediatelyChangeTheNumber(newNumber);
    }
    failToChangeTheNumber() {
        throw new Error('Cannot change the number');
    }
    async promiseAndFailToChangeTheNumber() {
        await (0, resolveOnNextTick_1.resolveOnNextTick)();
        throw new Error('Cannot change the number');
    }
}
const numberHolderType = new definition_1.GraphQLObjectType({
    fields: {
        theNumber: { type: scalars_1.GraphQLInt },
    },
    name: 'NumberHolder',
});
const schema = new schema_1.GraphQLSchema({
    query: new definition_1.GraphQLObjectType({
        fields: {
            numberHolder: { type: numberHolderType },
        },
        name: 'Query',
    }),
    mutation: new definition_1.GraphQLObjectType({
        fields: {
            immediatelyChangeTheNumber: {
                type: numberHolderType,
                args: { newNumber: { type: scalars_1.GraphQLInt } },
                resolve(obj, { newNumber }) {
                    return obj.immediatelyChangeTheNumber(newNumber);
                },
            },
            promiseToChangeTheNumber: {
                type: numberHolderType,
                args: { newNumber: { type: scalars_1.GraphQLInt } },
                resolve(obj, { newNumber }) {
                    return obj.promiseToChangeTheNumber(newNumber);
                },
            },
            failToChangeTheNumber: {
                type: numberHolderType,
                args: { newNumber: { type: scalars_1.GraphQLInt } },
                resolve(obj, { newNumber }) {
                    return obj.failToChangeTheNumber(newNumber);
                },
            },
            promiseAndFailToChangeTheNumber: {
                type: numberHolderType,
                args: { newNumber: { type: scalars_1.GraphQLInt } },
                resolve(obj, { newNumber }) {
                    return obj.promiseAndFailToChangeTheNumber(newNumber);
                },
            },
        },
        name: 'Mutation',
    }),
});
(0, mocha_1.describe)('Execute: Handles mutation execution ordering', () => {
    (0, mocha_1.it)('evaluates mutations serially', async () => {
        const document = (0, parser_1.parse)(`
      mutation M {
        first: immediatelyChangeTheNumber(newNumber: 1) {
          theNumber
        },
        second: promiseToChangeTheNumber(newNumber: 2) {
          theNumber
        },
        third: immediatelyChangeTheNumber(newNumber: 3) {
          theNumber
        }
        fourth: promiseToChangeTheNumber(newNumber: 4) {
          theNumber
        },
        fifth: immediatelyChangeTheNumber(newNumber: 5) {
          theNumber
        }
      }
    `);
        const rootValue = new Root(6);
        const mutationResult = await (0, execute_1.execute)({ schema, document, rootValue });
        (0, chai_1.expect)(mutationResult).to.deep.equal({
            data: {
                first: { theNumber: 1 },
                second: { theNumber: 2 },
                third: { theNumber: 3 },
                fourth: { theNumber: 4 },
                fifth: { theNumber: 5 },
            },
        });
    });
    (0, mocha_1.it)('does not include illegal mutation fields in output', () => {
        const document = (0, parser_1.parse)('mutation { thisIsIllegalDoNotIncludeMe }');
        const result = (0, execute_1.executeSync)({ schema, document });
        (0, chai_1.expect)(result).to.deep.equal({
            data: {},
        });
    });
    (0, mocha_1.it)('evaluates mutations correctly in the presence of a failed mutation', async () => {
        const document = (0, parser_1.parse)(`
      mutation M {
        first: immediatelyChangeTheNumber(newNumber: 1) {
          theNumber
        },
        second: promiseToChangeTheNumber(newNumber: 2) {
          theNumber
        },
        third: failToChangeTheNumber(newNumber: 3) {
          theNumber
        }
        fourth: promiseToChangeTheNumber(newNumber: 4) {
          theNumber
        },
        fifth: immediatelyChangeTheNumber(newNumber: 5) {
          theNumber
        }
        sixth: promiseAndFailToChangeTheNumber(newNumber: 6) {
          theNumber
        }
      }
    `);
        const rootValue = new Root(6);
        const result = await (0, execute_1.execute)({ schema, document, rootValue });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            data: {
                first: { theNumber: 1 },
                second: { theNumber: 2 },
                third: null,
                fourth: { theNumber: 4 },
                fifth: { theNumber: 5 },
                sixth: null,
            },
            errors: [
                {
                    message: 'Cannot change the number',
                    locations: [{ line: 9, column: 9 }],
                    path: ['third'],
                },
                {
                    message: 'Cannot change the number',
                    locations: [{ line: 18, column: 9 }],
                    path: ['sixth'],
                },
            ],
        });
    });
});
//# sourceMappingURL=mutations-test.js.map