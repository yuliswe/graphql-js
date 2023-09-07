"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const GraphQLError_1 = require("../GraphQLError");
const locatedError_1 = require("../locatedError");
(0, mocha_1.describe)('locatedError', () => {
    (0, mocha_1.it)('passes GraphQLError through', () => {
        const e = new GraphQLError_1.GraphQLError('msg', { path: ['path', 3, 'to', 'field'] });
        (0, chai_1.expect)((0, locatedError_1.locatedError)(e, [], [])).to.deep.equal(e);
    });
    (0, mocha_1.it)('wraps non-errors', () => {
        const testObject = Object.freeze({});
        const error = (0, locatedError_1.locatedError)(testObject, [], []);
        (0, chai_1.expect)(error).to.be.instanceOf(GraphQLError_1.GraphQLError);
        (0, chai_1.expect)(error.originalError).to.include({
            name: 'NonErrorThrown',
            thrownValue: testObject,
        });
    });
    (0, mocha_1.it)('passes GraphQLError-ish through', () => {
        const e = new Error();
        // @ts-expect-error
        e.locations = [];
        // @ts-expect-error
        e.path = [];
        // @ts-expect-error
        e.nodes = [];
        // @ts-expect-error
        e.source = null;
        // @ts-expect-error
        e.positions = [];
        e.name = 'GraphQLError';
        (0, chai_1.expect)((0, locatedError_1.locatedError)(e, [], [])).to.deep.equal(e);
    });
    (0, mocha_1.it)('does not pass through elasticsearch-like errors', () => {
        const e = new Error('I am from elasticsearch');
        // @ts-expect-error
        e.path = '/something/feed/_search';
        (0, chai_1.expect)((0, locatedError_1.locatedError)(e, [], [])).to.not.deep.equal(e);
    });
});
//# sourceMappingURL=locatedError-test.js.map