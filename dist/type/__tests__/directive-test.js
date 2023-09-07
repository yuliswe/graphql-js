"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const directiveLocation_1 = require("../../language/directiveLocation");
const directives_1 = require("../directives");
const scalars_1 = require("../scalars");
(0, mocha_1.describe)('Type System: Directive', () => {
    (0, mocha_1.it)('defines a directive with no args', () => {
        const directive = new directives_1.GraphQLDirective({
            name: 'Foo',
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
        });
        (0, chai_1.expect)(directive).to.deep.include({
            name: 'Foo',
            args: [],
            isRepeatable: false,
            locations: ['QUERY'],
        });
    });
    (0, mocha_1.it)('defines a directive with multiple args', () => {
        const directive = new directives_1.GraphQLDirective({
            name: 'Foo',
            args: {
                foo: { type: scalars_1.GraphQLString },
                bar: { type: scalars_1.GraphQLInt },
            },
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
        });
        (0, chai_1.expect)(directive).to.deep.include({
            name: 'Foo',
            args: [
                {
                    name: 'foo',
                    description: undefined,
                    type: scalars_1.GraphQLString,
                    defaultValue: undefined,
                    deprecationReason: undefined,
                    extensions: {},
                    astNode: undefined,
                },
                {
                    name: 'bar',
                    description: undefined,
                    type: scalars_1.GraphQLInt,
                    defaultValue: undefined,
                    deprecationReason: undefined,
                    extensions: {},
                    astNode: undefined,
                },
            ],
            isRepeatable: false,
            locations: ['QUERY'],
        });
    });
    (0, mocha_1.it)('defines a repeatable directive', () => {
        const directive = new directives_1.GraphQLDirective({
            name: 'Foo',
            isRepeatable: true,
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
        });
        (0, chai_1.expect)(directive).to.deep.include({
            name: 'Foo',
            args: [],
            isRepeatable: true,
            locations: ['QUERY'],
        });
    });
    (0, mocha_1.it)('can be stringified, JSON.stringified and Object.toStringified', () => {
        const directive = new directives_1.GraphQLDirective({
            name: 'Foo',
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
        });
        (0, chai_1.expect)(String(directive)).to.equal('@Foo');
        (0, chai_1.expect)(JSON.stringify(directive)).to.equal('"@Foo"');
        (0, chai_1.expect)(Object.prototype.toString.call(directive)).to.equal('[object GraphQLDirective]');
    });
    (0, mocha_1.it)('rejects a directive with invalid name', () => {
        (0, chai_1.expect)(() => new directives_1.GraphQLDirective({
            name: 'bad-name',
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
        })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects a directive with incorrectly typed args', () => {
        (0, chai_1.expect)(() => new directives_1.GraphQLDirective({
            name: 'Foo',
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
            // @ts-expect-error
            args: [],
        })).to.throw('@Foo args must be an object with argument names as keys.');
    });
    (0, mocha_1.it)('rejects a directive with incorrectly named arg', () => {
        (0, chai_1.expect)(() => new directives_1.GraphQLDirective({
            name: 'Foo',
            locations: [directiveLocation_1.DirectiveLocation.QUERY],
            args: {
                'bad-name': { type: scalars_1.GraphQLString },
            },
        })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects a directive with undefined locations', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => new directives_1.GraphQLDirective({ name: 'Foo' })).to.throw('@Foo locations must be an Array.');
    });
    (0, mocha_1.it)('rejects a directive with incorrectly typed locations', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => new directives_1.GraphQLDirective({ name: 'Foo', locations: {} })).to.throw('@Foo locations must be an Array.');
    });
});
//# sourceMappingURL=directive-test.js.map