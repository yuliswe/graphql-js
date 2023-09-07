"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const inspect_1 = require("../inspect");
(0, mocha_1.describe)('inspect', () => {
    (0, mocha_1.it)('undefined', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)(undefined)).to.equal('undefined');
    });
    (0, mocha_1.it)('null', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)(null)).to.equal('null');
    });
    (0, mocha_1.it)('boolean', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)(true)).to.equal('true');
        (0, chai_1.expect)((0, inspect_1.inspect)(false)).to.equal('false');
    });
    (0, mocha_1.it)('string', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)('')).to.equal('""');
        (0, chai_1.expect)((0, inspect_1.inspect)('abc')).to.equal('"abc"');
        (0, chai_1.expect)((0, inspect_1.inspect)('"')).to.equal('"\\""');
    });
    (0, mocha_1.it)('number', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)(0.0)).to.equal('0');
        (0, chai_1.expect)((0, inspect_1.inspect)(3.14)).to.equal('3.14');
        (0, chai_1.expect)((0, inspect_1.inspect)(NaN)).to.equal('NaN');
        (0, chai_1.expect)((0, inspect_1.inspect)(Infinity)).to.equal('Infinity');
        (0, chai_1.expect)((0, inspect_1.inspect)(-Infinity)).to.equal('-Infinity');
    });
    (0, mocha_1.it)('function', () => {
        const unnamedFuncStr = (0, inspect_1.inspect)(
        // Never called and used as a placeholder
        /* c8 ignore next */
        () => chai_1.expect.fail('Should not be called'));
        (0, chai_1.expect)(unnamedFuncStr).to.equal('[function]');
        // Never called and used as a placeholder
        /* c8 ignore next 3 */
        function namedFunc() {
            chai_1.expect.fail('Should not be called');
        }
        (0, chai_1.expect)((0, inspect_1.inspect)(namedFunc)).to.equal('[function namedFunc]');
    });
    (0, mocha_1.it)('array', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)([])).to.equal('[]');
        (0, chai_1.expect)((0, inspect_1.inspect)([null])).to.equal('[null]');
        (0, chai_1.expect)((0, inspect_1.inspect)([1, NaN])).to.equal('[1, NaN]');
        (0, chai_1.expect)((0, inspect_1.inspect)([['a', 'b'], 'c'])).to.equal('[["a", "b"], "c"]');
        (0, chai_1.expect)((0, inspect_1.inspect)([[[]]])).to.equal('[[[]]]');
        (0, chai_1.expect)((0, inspect_1.inspect)([[['a']]])).to.equal('[[[Array]]]');
        (0, chai_1.expect)((0, inspect_1.inspect)([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).to.equal('[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]');
        (0, chai_1.expect)((0, inspect_1.inspect)([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])).to.equal('[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ... 1 more item]');
        (0, chai_1.expect)((0, inspect_1.inspect)([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])).to.equal('[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ... 2 more items]');
    });
    (0, mocha_1.it)('object', () => {
        (0, chai_1.expect)((0, inspect_1.inspect)({})).to.equal('{}');
        (0, chai_1.expect)((0, inspect_1.inspect)({ a: 1 })).to.equal('{ a: 1 }');
        (0, chai_1.expect)((0, inspect_1.inspect)({ a: 1, b: 2 })).to.equal('{ a: 1, b: 2 }');
        (0, chai_1.expect)((0, inspect_1.inspect)({ array: [null, 0] })).to.equal('{ array: [null, 0] }');
        (0, chai_1.expect)((0, inspect_1.inspect)({ a: { b: {} } })).to.equal('{ a: { b: {} } }');
        (0, chai_1.expect)((0, inspect_1.inspect)({ a: { b: { c: 1 } } })).to.equal('{ a: { b: [Object] } }');
        const map = Object.create(null);
        map.a = true;
        map.b = null;
        (0, chai_1.expect)((0, inspect_1.inspect)(map)).to.equal('{ a: true, b: null }');
    });
    (0, mocha_1.it)('use toJSON if provided', () => {
        const object = {
            toJSON() {
                return '<json value>';
            },
        };
        (0, chai_1.expect)((0, inspect_1.inspect)(object)).to.equal('<json value>');
    });
    (0, mocha_1.it)('handles toJSON that return `this` should work', () => {
        const object = {
            toJSON() {
                return this;
            },
        };
        (0, chai_1.expect)((0, inspect_1.inspect)(object)).to.equal('{ toJSON: [function toJSON] }');
    });
    (0, mocha_1.it)('handles toJSON returning object values', () => {
        const object = {
            toJSON() {
                return { json: 'value' };
            },
        };
        (0, chai_1.expect)((0, inspect_1.inspect)(object)).to.equal('{ json: "value" }');
    });
    (0, mocha_1.it)('handles toJSON function that uses this', () => {
        const object = {
            str: 'Hello World!',
            toJSON() {
                return this.str;
            },
        };
        (0, chai_1.expect)((0, inspect_1.inspect)(object)).to.equal('Hello World!');
    });
    (0, mocha_1.it)('detect circular objects', () => {
        const obj = {};
        obj.self = obj;
        obj.deepSelf = { self: obj };
        (0, chai_1.expect)((0, inspect_1.inspect)(obj)).to.equal('{ self: [Circular], deepSelf: { self: [Circular] } }');
        const array = [];
        array[0] = array;
        array[1] = [array];
        (0, chai_1.expect)((0, inspect_1.inspect)(array)).to.equal('[[Circular], [[Circular]]]');
        const mixed = { array: [] };
        mixed.array[0] = mixed;
        (0, chai_1.expect)((0, inspect_1.inspect)(mixed)).to.equal('{ array: [[Circular]] }');
        const customA = {
            toJSON: () => customB,
        };
        const customB = {
            toJSON: () => customA,
        };
        (0, chai_1.expect)((0, inspect_1.inspect)(customA)).to.equal('[Circular]');
    });
    (0, mocha_1.it)('Use class names for the short form of an object', () => {
        var _a;
        class Foo {
            constructor() {
                this.foo = 'bar';
            }
        }
        (0, chai_1.expect)((0, inspect_1.inspect)([[new Foo()]])).to.equal('[[[Foo]]]');
        class Foo2 {
            constructor() {
                this[_a] = 'Bar';
                this.foo = 'bar';
            }
        }
        _a = Symbol.toStringTag;
        (0, chai_1.expect)((0, inspect_1.inspect)([[new Foo2()]])).to.equal('[[[Bar]]]');
        // eslint-disable-next-line func-names
        const objectWithoutClassName = new function () {
            this.foo = 1;
        }();
        (0, chai_1.expect)((0, inspect_1.inspect)([[objectWithoutClassName]])).to.equal('[[[Object]]]');
    });
});
//# sourceMappingURL=inspect-test.js.map