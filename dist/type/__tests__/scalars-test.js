"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const scalars_1 = require("../scalars");
(0, mocha_1.describe)('Type System: Specified scalar types', () => {
    (0, mocha_1.describe)('GraphQLInt', () => {
        (0, mocha_1.it)('parseValue', () => {
            function parseValue(value) {
                return scalars_1.GraphQLInt.parseValue(value);
            }
            (0, chai_1.expect)(parseValue(1)).to.equal(1);
            (0, chai_1.expect)(parseValue(0)).to.equal(0);
            (0, chai_1.expect)(parseValue(-1)).to.equal(-1);
            (0, chai_1.expect)(() => parseValue(9876504321)).to.throw('Int cannot represent non 32-bit signed integer value: 9876504321');
            (0, chai_1.expect)(() => parseValue(-9876504321)).to.throw('Int cannot represent non 32-bit signed integer value: -9876504321');
            (0, chai_1.expect)(() => parseValue(0.1)).to.throw('Int cannot represent non-integer value: 0.1');
            (0, chai_1.expect)(() => parseValue(NaN)).to.throw('Int cannot represent non-integer value: NaN');
            (0, chai_1.expect)(() => parseValue(Infinity)).to.throw('Int cannot represent non-integer value: Infinity');
            (0, chai_1.expect)(() => parseValue(undefined)).to.throw('Int cannot represent non-integer value: undefined');
            (0, chai_1.expect)(() => parseValue(null)).to.throw('Int cannot represent non-integer value: null');
            (0, chai_1.expect)(() => parseValue('')).to.throw('Int cannot represent non-integer value: ""');
            (0, chai_1.expect)(() => parseValue('123')).to.throw('Int cannot represent non-integer value: "123"');
            (0, chai_1.expect)(() => parseValue(false)).to.throw('Int cannot represent non-integer value: false');
            (0, chai_1.expect)(() => parseValue(true)).to.throw('Int cannot represent non-integer value: true');
            (0, chai_1.expect)(() => parseValue([1])).to.throw('Int cannot represent non-integer value: [1]');
            (0, chai_1.expect)(() => parseValue({ value: 1 })).to.throw('Int cannot represent non-integer value: { value: 1 }');
        });
        (0, mocha_1.it)('parseLiteral', () => {
            function parseLiteral(str) {
                return scalars_1.GraphQLInt.parseLiteral((0, parser_1.parseValue)(str), undefined);
            }
            (0, chai_1.expect)(parseLiteral('1')).to.equal(1);
            (0, chai_1.expect)(parseLiteral('0')).to.equal(0);
            (0, chai_1.expect)(parseLiteral('-1')).to.equal(-1);
            (0, chai_1.expect)(() => parseLiteral('9876504321')).to.throw('Int cannot represent non 32-bit signed integer value: 9876504321');
            (0, chai_1.expect)(() => parseLiteral('-9876504321')).to.throw('Int cannot represent non 32-bit signed integer value: -9876504321');
            (0, chai_1.expect)(() => parseLiteral('1.0')).to.throw('Int cannot represent non-integer value: 1.0');
            (0, chai_1.expect)(() => parseLiteral('null')).to.throw('Int cannot represent non-integer value: null');
            (0, chai_1.expect)(() => parseLiteral('""')).to.throw('Int cannot represent non-integer value: ""');
            (0, chai_1.expect)(() => parseLiteral('"123"')).to.throw('Int cannot represent non-integer value: "123"');
            (0, chai_1.expect)(() => parseLiteral('false')).to.throw('Int cannot represent non-integer value: false');
            (0, chai_1.expect)(() => parseLiteral('[1]')).to.throw('Int cannot represent non-integer value: [1]');
            (0, chai_1.expect)(() => parseLiteral('{ value: 1 }')).to.throw('Int cannot represent non-integer value: {value: 1}');
            (0, chai_1.expect)(() => parseLiteral('ENUM_VALUE')).to.throw('Int cannot represent non-integer value: ENUM_VALUE');
            (0, chai_1.expect)(() => parseLiteral('$var')).to.throw('Int cannot represent non-integer value: $var');
        });
        (0, mocha_1.it)('serialize', () => {
            function serialize(value) {
                return scalars_1.GraphQLInt.serialize(value);
            }
            (0, chai_1.expect)(serialize(1)).to.equal(1);
            (0, chai_1.expect)(serialize('123')).to.equal(123);
            (0, chai_1.expect)(serialize(0)).to.equal(0);
            (0, chai_1.expect)(serialize(-1)).to.equal(-1);
            (0, chai_1.expect)(serialize(1e5)).to.equal(100000);
            (0, chai_1.expect)(serialize(false)).to.equal(0);
            (0, chai_1.expect)(serialize(true)).to.equal(1);
            const customValueOfObj = {
                value: 5,
                valueOf() {
                    return this.value;
                },
            };
            (0, chai_1.expect)(serialize(customValueOfObj)).to.equal(5);
            // The GraphQL specification does not allow serializing non-integer values
            // as Int to avoid accidental data loss.
            (0, chai_1.expect)(() => serialize(0.1)).to.throw('Int cannot represent non-integer value: 0.1');
            (0, chai_1.expect)(() => serialize(1.1)).to.throw('Int cannot represent non-integer value: 1.1');
            (0, chai_1.expect)(() => serialize(-1.1)).to.throw('Int cannot represent non-integer value: -1.1');
            (0, chai_1.expect)(() => serialize('-1.1')).to.throw('Int cannot represent non-integer value: "-1.1"');
            // Maybe a safe JavaScript int, but bigger than 2^32, so not
            // representable as a GraphQL Int
            (0, chai_1.expect)(() => serialize(9876504321)).to.throw('Int cannot represent non 32-bit signed integer value: 9876504321');
            (0, chai_1.expect)(() => serialize(-9876504321)).to.throw('Int cannot represent non 32-bit signed integer value: -9876504321');
            // Too big to represent as an Int in JavaScript or GraphQL
            (0, chai_1.expect)(() => serialize(1e100)).to.throw('Int cannot represent non 32-bit signed integer value: 1e+100');
            (0, chai_1.expect)(() => serialize(-1e100)).to.throw('Int cannot represent non 32-bit signed integer value: -1e+100');
            (0, chai_1.expect)(() => serialize('one')).to.throw('Int cannot represent non-integer value: "one"');
            // Doesn't represent number
            (0, chai_1.expect)(() => serialize('')).to.throw('Int cannot represent non-integer value: ""');
            (0, chai_1.expect)(() => serialize(NaN)).to.throw('Int cannot represent non-integer value: NaN');
            (0, chai_1.expect)(() => serialize(Infinity)).to.throw('Int cannot represent non-integer value: Infinity');
            (0, chai_1.expect)(() => serialize([5])).to.throw('Int cannot represent non-integer value: [5]');
        });
    });
    (0, mocha_1.describe)('GraphQLFloat', () => {
        (0, mocha_1.it)('parseValue', () => {
            function parseValue(value) {
                return scalars_1.GraphQLFloat.parseValue(value);
            }
            (0, chai_1.expect)(parseValue(1)).to.equal(1);
            (0, chai_1.expect)(parseValue(0)).to.equal(0);
            (0, chai_1.expect)(parseValue(-1)).to.equal(-1);
            (0, chai_1.expect)(parseValue(0.1)).to.equal(0.1);
            (0, chai_1.expect)(parseValue(Math.PI)).to.equal(Math.PI);
            (0, chai_1.expect)(() => parseValue(NaN)).to.throw('Float cannot represent non numeric value: NaN');
            (0, chai_1.expect)(() => parseValue(Infinity)).to.throw('Float cannot represent non numeric value: Infinity');
            (0, chai_1.expect)(() => parseValue(undefined)).to.throw('Float cannot represent non numeric value: undefined');
            (0, chai_1.expect)(() => parseValue(null)).to.throw('Float cannot represent non numeric value: null');
            (0, chai_1.expect)(() => parseValue('')).to.throw('Float cannot represent non numeric value: ""');
            (0, chai_1.expect)(() => parseValue('123')).to.throw('Float cannot represent non numeric value: "123"');
            (0, chai_1.expect)(() => parseValue('123.5')).to.throw('Float cannot represent non numeric value: "123.5"');
            (0, chai_1.expect)(() => parseValue(false)).to.throw('Float cannot represent non numeric value: false');
            (0, chai_1.expect)(() => parseValue(true)).to.throw('Float cannot represent non numeric value: true');
            (0, chai_1.expect)(() => parseValue([0.1])).to.throw('Float cannot represent non numeric value: [0.1]');
            (0, chai_1.expect)(() => parseValue({ value: 0.1 })).to.throw('Float cannot represent non numeric value: { value: 0.1 }');
        });
        (0, mocha_1.it)('parseLiteral', () => {
            function parseLiteral(str) {
                return scalars_1.GraphQLFloat.parseLiteral((0, parser_1.parseValue)(str), undefined);
            }
            (0, chai_1.expect)(parseLiteral('1')).to.equal(1);
            (0, chai_1.expect)(parseLiteral('0')).to.equal(0);
            (0, chai_1.expect)(parseLiteral('-1')).to.equal(-1);
            (0, chai_1.expect)(parseLiteral('0.1')).to.equal(0.1);
            (0, chai_1.expect)(parseLiteral(Math.PI.toString())).to.equal(Math.PI);
            (0, chai_1.expect)(() => parseLiteral('null')).to.throw('Float cannot represent non numeric value: null');
            (0, chai_1.expect)(() => parseLiteral('""')).to.throw('Float cannot represent non numeric value: ""');
            (0, chai_1.expect)(() => parseLiteral('"123"')).to.throw('Float cannot represent non numeric value: "123"');
            (0, chai_1.expect)(() => parseLiteral('"123.5"')).to.throw('Float cannot represent non numeric value: "123.5"');
            (0, chai_1.expect)(() => parseLiteral('false')).to.throw('Float cannot represent non numeric value: false');
            (0, chai_1.expect)(() => parseLiteral('[0.1]')).to.throw('Float cannot represent non numeric value: [0.1]');
            (0, chai_1.expect)(() => parseLiteral('{ value: 0.1 }')).to.throw('Float cannot represent non numeric value: {value: 0.1}');
            (0, chai_1.expect)(() => parseLiteral('ENUM_VALUE')).to.throw('Float cannot represent non numeric value: ENUM_VALUE');
            (0, chai_1.expect)(() => parseLiteral('$var')).to.throw('Float cannot represent non numeric value: $var');
        });
        (0, mocha_1.it)('serialize', () => {
            function serialize(value) {
                return scalars_1.GraphQLFloat.serialize(value);
            }
            (0, chai_1.expect)(serialize(1)).to.equal(1.0);
            (0, chai_1.expect)(serialize(0)).to.equal(0.0);
            (0, chai_1.expect)(serialize('123.5')).to.equal(123.5);
            (0, chai_1.expect)(serialize(-1)).to.equal(-1.0);
            (0, chai_1.expect)(serialize(0.1)).to.equal(0.1);
            (0, chai_1.expect)(serialize(1.1)).to.equal(1.1);
            (0, chai_1.expect)(serialize(-1.1)).to.equal(-1.1);
            (0, chai_1.expect)(serialize('-1.1')).to.equal(-1.1);
            (0, chai_1.expect)(serialize(false)).to.equal(0.0);
            (0, chai_1.expect)(serialize(true)).to.equal(1.0);
            const customValueOfObj = {
                value: 5.5,
                valueOf() {
                    return this.value;
                },
            };
            (0, chai_1.expect)(serialize(customValueOfObj)).to.equal(5.5);
            (0, chai_1.expect)(() => serialize(NaN)).to.throw('Float cannot represent non numeric value: NaN');
            (0, chai_1.expect)(() => serialize(Infinity)).to.throw('Float cannot represent non numeric value: Infinity');
            (0, chai_1.expect)(() => serialize('one')).to.throw('Float cannot represent non numeric value: "one"');
            (0, chai_1.expect)(() => serialize('')).to.throw('Float cannot represent non numeric value: ""');
            (0, chai_1.expect)(() => serialize([5])).to.throw('Float cannot represent non numeric value: [5]');
        });
    });
    (0, mocha_1.describe)('GraphQLString', () => {
        (0, mocha_1.it)('parseValue', () => {
            function parseValue(value) {
                return scalars_1.GraphQLString.parseValue(value);
            }
            (0, chai_1.expect)(parseValue('foo')).to.equal('foo');
            (0, chai_1.expect)(() => parseValue(undefined)).to.throw('String cannot represent a non string value: undefined');
            (0, chai_1.expect)(() => parseValue(null)).to.throw('String cannot represent a non string value: null');
            (0, chai_1.expect)(() => parseValue(1)).to.throw('String cannot represent a non string value: 1');
            (0, chai_1.expect)(() => parseValue(NaN)).to.throw('String cannot represent a non string value: NaN');
            (0, chai_1.expect)(() => parseValue(false)).to.throw('String cannot represent a non string value: false');
            (0, chai_1.expect)(() => parseValue(['foo'])).to.throw('String cannot represent a non string value: ["foo"]');
            (0, chai_1.expect)(() => parseValue({ value: 'foo' })).to.throw('String cannot represent a non string value: { value: "foo" }');
        });
        (0, mocha_1.it)('parseLiteral', () => {
            function parseLiteral(str) {
                return scalars_1.GraphQLString.parseLiteral((0, parser_1.parseValue)(str), undefined);
            }
            (0, chai_1.expect)(parseLiteral('"foo"')).to.equal('foo');
            (0, chai_1.expect)(parseLiteral('"""bar"""')).to.equal('bar');
            (0, chai_1.expect)(() => parseLiteral('null')).to.throw('String cannot represent a non string value: null');
            (0, chai_1.expect)(() => parseLiteral('1')).to.throw('String cannot represent a non string value: 1');
            (0, chai_1.expect)(() => parseLiteral('0.1')).to.throw('String cannot represent a non string value: 0.1');
            (0, chai_1.expect)(() => parseLiteral('false')).to.throw('String cannot represent a non string value: false');
            (0, chai_1.expect)(() => parseLiteral('["foo"]')).to.throw('String cannot represent a non string value: ["foo"]');
            (0, chai_1.expect)(() => parseLiteral('{ value: "foo" }')).to.throw('String cannot represent a non string value: {value: "foo"}');
            (0, chai_1.expect)(() => parseLiteral('ENUM_VALUE')).to.throw('String cannot represent a non string value: ENUM_VALUE');
            (0, chai_1.expect)(() => parseLiteral('$var')).to.throw('String cannot represent a non string value: $var');
        });
        (0, mocha_1.it)('serialize', () => {
            function serialize(value) {
                return scalars_1.GraphQLString.serialize(value);
            }
            (0, chai_1.expect)(serialize('string')).to.equal('string');
            (0, chai_1.expect)(serialize(1)).to.equal('1');
            (0, chai_1.expect)(serialize(-1.1)).to.equal('-1.1');
            (0, chai_1.expect)(serialize(true)).to.equal('true');
            (0, chai_1.expect)(serialize(false)).to.equal('false');
            const valueOf = () => 'valueOf string';
            const toJSON = () => 'toJSON string';
            const valueOfAndToJSONValue = { valueOf, toJSON };
            (0, chai_1.expect)(serialize(valueOfAndToJSONValue)).to.equal('valueOf string');
            const onlyToJSONValue = { toJSON };
            (0, chai_1.expect)(serialize(onlyToJSONValue)).to.equal('toJSON string');
            (0, chai_1.expect)(() => serialize(NaN)).to.throw('String cannot represent value: NaN');
            (0, chai_1.expect)(() => serialize([1])).to.throw('String cannot represent value: [1]');
            const badObjValue = {};
            (0, chai_1.expect)(() => serialize(badObjValue)).to.throw('String cannot represent value: {}');
            const badValueOfObjValue = { valueOf: 'valueOf string' };
            (0, chai_1.expect)(() => serialize(badValueOfObjValue)).to.throw('String cannot represent value: { valueOf: "valueOf string" }');
        });
    });
    (0, mocha_1.describe)('GraphQLBoolean', () => {
        (0, mocha_1.it)('parseValue', () => {
            function parseValue(value) {
                return scalars_1.GraphQLBoolean.parseValue(value);
            }
            (0, chai_1.expect)(parseValue(true)).to.equal(true);
            (0, chai_1.expect)(parseValue(false)).to.equal(false);
            (0, chai_1.expect)(() => parseValue(undefined)).to.throw('Boolean cannot represent a non boolean value: undefined');
            (0, chai_1.expect)(() => parseValue(null)).to.throw('Boolean cannot represent a non boolean value: null');
            (0, chai_1.expect)(() => parseValue(0)).to.throw('Boolean cannot represent a non boolean value: 0');
            (0, chai_1.expect)(() => parseValue(1)).to.throw('Boolean cannot represent a non boolean value: 1');
            (0, chai_1.expect)(() => parseValue(NaN)).to.throw('Boolean cannot represent a non boolean value: NaN');
            (0, chai_1.expect)(() => parseValue('')).to.throw('Boolean cannot represent a non boolean value: ""');
            (0, chai_1.expect)(() => parseValue('false')).to.throw('Boolean cannot represent a non boolean value: "false"');
            (0, chai_1.expect)(() => parseValue([false])).to.throw('Boolean cannot represent a non boolean value: [false]');
            (0, chai_1.expect)(() => parseValue({ value: false })).to.throw('Boolean cannot represent a non boolean value: { value: false }');
        });
        (0, mocha_1.it)('parseLiteral', () => {
            function parseLiteral(str) {
                return scalars_1.GraphQLBoolean.parseLiteral((0, parser_1.parseValue)(str), undefined);
            }
            (0, chai_1.expect)(parseLiteral('true')).to.equal(true);
            (0, chai_1.expect)(parseLiteral('false')).to.equal(false);
            (0, chai_1.expect)(() => parseLiteral('null')).to.throw('Boolean cannot represent a non boolean value: null');
            (0, chai_1.expect)(() => parseLiteral('0')).to.throw('Boolean cannot represent a non boolean value: 0');
            (0, chai_1.expect)(() => parseLiteral('1')).to.throw('Boolean cannot represent a non boolean value: 1');
            (0, chai_1.expect)(() => parseLiteral('0.1')).to.throw('Boolean cannot represent a non boolean value: 0.1');
            (0, chai_1.expect)(() => parseLiteral('""')).to.throw('Boolean cannot represent a non boolean value: ""');
            (0, chai_1.expect)(() => parseLiteral('"false"')).to.throw('Boolean cannot represent a non boolean value: "false"');
            (0, chai_1.expect)(() => parseLiteral('[false]')).to.throw('Boolean cannot represent a non boolean value: [false]');
            (0, chai_1.expect)(() => parseLiteral('{ value: false }')).to.throw('Boolean cannot represent a non boolean value: {value: false}');
            (0, chai_1.expect)(() => parseLiteral('ENUM_VALUE')).to.throw('Boolean cannot represent a non boolean value: ENUM_VALUE');
            (0, chai_1.expect)(() => parseLiteral('$var')).to.throw('Boolean cannot represent a non boolean value: $var');
        });
        (0, mocha_1.it)('serialize', () => {
            function serialize(value) {
                return scalars_1.GraphQLBoolean.serialize(value);
            }
            (0, chai_1.expect)(serialize(1)).to.equal(true);
            (0, chai_1.expect)(serialize(0)).to.equal(false);
            (0, chai_1.expect)(serialize(true)).to.equal(true);
            (0, chai_1.expect)(serialize(false)).to.equal(false);
            (0, chai_1.expect)(serialize({
                value: true,
                valueOf() {
                    return this.value;
                },
            })).to.equal(true);
            (0, chai_1.expect)(() => serialize(NaN)).to.throw('Boolean cannot represent a non boolean value: NaN');
            (0, chai_1.expect)(() => serialize('')).to.throw('Boolean cannot represent a non boolean value: ""');
            (0, chai_1.expect)(() => serialize('true')).to.throw('Boolean cannot represent a non boolean value: "true"');
            (0, chai_1.expect)(() => serialize([false])).to.throw('Boolean cannot represent a non boolean value: [false]');
            (0, chai_1.expect)(() => serialize({})).to.throw('Boolean cannot represent a non boolean value: {}');
        });
    });
    (0, mocha_1.describe)('GraphQLID', () => {
        (0, mocha_1.it)('parseValue', () => {
            function parseValue(value) {
                return scalars_1.GraphQLID.parseValue(value);
            }
            (0, chai_1.expect)(parseValue('')).to.equal('');
            (0, chai_1.expect)(parseValue('1')).to.equal('1');
            (0, chai_1.expect)(parseValue('foo')).to.equal('foo');
            (0, chai_1.expect)(parseValue(1)).to.equal('1');
            (0, chai_1.expect)(parseValue(0)).to.equal('0');
            (0, chai_1.expect)(parseValue(-1)).to.equal('-1');
            // Maximum and minimum safe numbers in JS
            (0, chai_1.expect)(parseValue(9007199254740991)).to.equal('9007199254740991');
            (0, chai_1.expect)(parseValue(-9007199254740991)).to.equal('-9007199254740991');
            (0, chai_1.expect)(() => parseValue(undefined)).to.throw('ID cannot represent value: undefined');
            (0, chai_1.expect)(() => parseValue(null)).to.throw('ID cannot represent value: null');
            (0, chai_1.expect)(() => parseValue(0.1)).to.throw('ID cannot represent value: 0.1');
            (0, chai_1.expect)(() => parseValue(NaN)).to.throw('ID cannot represent value: NaN');
            (0, chai_1.expect)(() => parseValue(Infinity)).to.throw('ID cannot represent value: Inf');
            (0, chai_1.expect)(() => parseValue(false)).to.throw('ID cannot represent value: false');
            (0, chai_1.expect)(() => scalars_1.GraphQLID.parseValue(['1'])).to.throw('ID cannot represent value: ["1"]');
            (0, chai_1.expect)(() => scalars_1.GraphQLID.parseValue({ value: '1' })).to.throw('ID cannot represent value: { value: "1" }');
        });
        (0, mocha_1.it)('parseLiteral', () => {
            function parseLiteral(str) {
                return scalars_1.GraphQLID.parseLiteral((0, parser_1.parseValue)(str), undefined);
            }
            (0, chai_1.expect)(parseLiteral('""')).to.equal('');
            (0, chai_1.expect)(parseLiteral('"1"')).to.equal('1');
            (0, chai_1.expect)(parseLiteral('"foo"')).to.equal('foo');
            (0, chai_1.expect)(parseLiteral('"""foo"""')).to.equal('foo');
            (0, chai_1.expect)(parseLiteral('1')).to.equal('1');
            (0, chai_1.expect)(parseLiteral('0')).to.equal('0');
            (0, chai_1.expect)(parseLiteral('-1')).to.equal('-1');
            // Support arbitrary long numbers even if they can't be represented in JS
            (0, chai_1.expect)(parseLiteral('90071992547409910')).to.equal('90071992547409910');
            (0, chai_1.expect)(parseLiteral('-90071992547409910')).to.equal('-90071992547409910');
            (0, chai_1.expect)(() => parseLiteral('null')).to.throw('ID cannot represent a non-string and non-integer value: null');
            (0, chai_1.expect)(() => parseLiteral('0.1')).to.throw('ID cannot represent a non-string and non-integer value: 0.1');
            (0, chai_1.expect)(() => parseLiteral('false')).to.throw('ID cannot represent a non-string and non-integer value: false');
            (0, chai_1.expect)(() => parseLiteral('["1"]')).to.throw('ID cannot represent a non-string and non-integer value: ["1"]');
            (0, chai_1.expect)(() => parseLiteral('{ value: "1" }')).to.throw('ID cannot represent a non-string and non-integer value: {value: "1"}');
            (0, chai_1.expect)(() => parseLiteral('ENUM_VALUE')).to.throw('ID cannot represent a non-string and non-integer value: ENUM_VALUE');
            (0, chai_1.expect)(() => parseLiteral('$var')).to.throw('ID cannot represent a non-string and non-integer value: $var');
        });
        (0, mocha_1.it)('serialize', () => {
            function serialize(value) {
                return scalars_1.GraphQLID.serialize(value);
            }
            (0, chai_1.expect)(serialize('string')).to.equal('string');
            (0, chai_1.expect)(serialize('false')).to.equal('false');
            (0, chai_1.expect)(serialize('')).to.equal('');
            (0, chai_1.expect)(serialize(123)).to.equal('123');
            (0, chai_1.expect)(serialize(0)).to.equal('0');
            (0, chai_1.expect)(serialize(-1)).to.equal('-1');
            const valueOf = () => 'valueOf ID';
            const toJSON = () => 'toJSON ID';
            const valueOfAndToJSONValue = { valueOf, toJSON };
            (0, chai_1.expect)(serialize(valueOfAndToJSONValue)).to.equal('valueOf ID');
            const onlyToJSONValue = { toJSON };
            (0, chai_1.expect)(serialize(onlyToJSONValue)).to.equal('toJSON ID');
            const badObjValue = {
                _id: false,
                valueOf() {
                    return this._id;
                },
            };
            (0, chai_1.expect)(() => serialize(badObjValue)).to.throw('ID cannot represent value: { _id: false, valueOf: [function valueOf] }');
            (0, chai_1.expect)(() => serialize(true)).to.throw('ID cannot represent value: true');
            (0, chai_1.expect)(() => serialize(3.14)).to.throw('ID cannot represent value: 3.14');
            (0, chai_1.expect)(() => serialize({})).to.throw('ID cannot represent value: {}');
            (0, chai_1.expect)(() => serialize(['abc'])).to.throw('ID cannot represent value: ["abc"]');
        });
    });
});
//# sourceMappingURL=scalars-test.js.map