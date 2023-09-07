"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const execute_1 = require("../execute");
const schema = new schema_1.GraphQLSchema({
    query: new definition_1.GraphQLObjectType({
        name: 'TestType',
        fields: {
            a: { type: scalars_1.GraphQLString },
            b: { type: scalars_1.GraphQLString },
        },
    }),
});
const rootValue = {
    a() {
        return 'a';
    },
    b() {
        return 'b';
    },
};
function executeTestQuery(query) {
    const document = (0, parser_1.parse)(query);
    return (0, execute_1.executeSync)({ schema, document, rootValue });
}
(0, mocha_1.describe)('Execute: handles directives', () => {
    (0, mocha_1.describe)('works without directives', () => {
        (0, mocha_1.it)('basic query works', () => {
            const result = executeTestQuery('{ a, b }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
    });
    (0, mocha_1.describe)('works on scalars', () => {
        (0, mocha_1.it)('if true includes scalar', () => {
            const result = executeTestQuery('{ a, b @include(if: true) }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('if false omits on scalar', () => {
            const result = executeTestQuery('{ a, b @include(if: false) }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
        (0, mocha_1.it)('unless false includes scalar', () => {
            const result = executeTestQuery('{ a, b @skip(if: false) }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless true omits scalar', () => {
            const result = executeTestQuery('{ a, b @skip(if: true) }');
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
    });
    (0, mocha_1.describe)('works on fragment spreads', () => {
        (0, mocha_1.it)('if false omits fragment spread', () => {
            const result = executeTestQuery(`
        query {
          a
          ...Frag @include(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
        (0, mocha_1.it)('if true includes fragment spread', () => {
            const result = executeTestQuery(`
        query {
          a
          ...Frag @include(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless false includes fragment spread', () => {
            const result = executeTestQuery(`
        query {
          a
          ...Frag @skip(if: false)
        }
        fragment Frag on TestType {
          b
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless true omits fragment spread', () => {
            const result = executeTestQuery(`
        query {
          a
          ...Frag @skip(if: true)
        }
        fragment Frag on TestType {
          b
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
    });
    (0, mocha_1.describe)('works on inline fragment', () => {
        (0, mocha_1.it)('if false omits inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... on TestType @include(if: false) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
        (0, mocha_1.it)('if true includes inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... on TestType @include(if: true) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless false includes inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... on TestType @skip(if: false) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless true includes inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... on TestType @skip(if: true) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
    });
    (0, mocha_1.describe)('works on anonymous inline fragment', () => {
        (0, mocha_1.it)('if false omits anonymous inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... @include(if: false) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
        (0, mocha_1.it)('if true includes anonymous inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... @include(if: true) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless false includes anonymous inline fragment', () => {
            const result = executeTestQuery(`
        query Q {
          a
          ... @skip(if: false) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('unless true includes anonymous inline fragment', () => {
            const result = executeTestQuery(`
        query {
          a
          ... @skip(if: true) {
            b
          }
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
    });
    (0, mocha_1.describe)('works with skip and include directives', () => {
        (0, mocha_1.it)('include and no skip', () => {
            const result = executeTestQuery(`
        {
          a
          b @include(if: true) @skip(if: false)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a', b: 'b' },
            });
        });
        (0, mocha_1.it)('include and skip', () => {
            const result = executeTestQuery(`
        {
          a
          b @include(if: true) @skip(if: true)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
        (0, mocha_1.it)('no include or skip', () => {
            const result = executeTestQuery(`
        {
          a
          b @include(if: false) @skip(if: false)
        }
      `);
            (0, chai_1.expect)(result).to.deep.equal({
                data: { a: 'a' },
            });
        });
    });
});
//# sourceMappingURL=directives-test.js.map