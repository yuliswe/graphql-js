"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const toObjMap_1 = require("../toObjMap");
// Workaround to make both ESLint happy
const __proto__ = '__proto__';
(0, mocha_1.describe)('toObjMap', () => {
    (0, mocha_1.it)('convert undefined to ObjMap', () => {
        const result = (0, toObjMap_1.toObjMap)(undefined);
        (0, chai_1.expect)(result).to.deep.equal({});
        (0, chai_1.expect)(Object.getPrototypeOf(result)).to.equal(null);
    });
    (0, mocha_1.it)('convert null to ObjMap', () => {
        const result = (0, toObjMap_1.toObjMap)(null);
        (0, chai_1.expect)(result).to.deep.equal({});
        (0, chai_1.expect)(Object.getPrototypeOf(result)).to.equal(null);
    });
    (0, mocha_1.it)('convert empty object to ObjMap', () => {
        const result = (0, toObjMap_1.toObjMap)({});
        (0, chai_1.expect)(result).to.deep.equal({});
        (0, chai_1.expect)(Object.getPrototypeOf(result)).to.equal(null);
    });
    (0, mocha_1.it)('convert object with own properties to ObjMap', () => {
        const obj = Object.freeze({ foo: 'bar' });
        const result = (0, toObjMap_1.toObjMap)(obj);
        (0, chai_1.expect)(result).to.deep.equal(obj);
        (0, chai_1.expect)(Object.getPrototypeOf(result)).to.equal(null);
    });
    (0, mocha_1.it)('convert object with __proto__ property to ObjMap', () => {
        const protoObj = Object.freeze({ toString: false });
        const obj = Object.create(null);
        obj[__proto__] = protoObj;
        Object.freeze(obj);
        const result = (0, toObjMap_1.toObjMap)(obj);
        (0, chai_1.expect)(Object.keys(result)).to.deep.equal(['__proto__']);
        (0, chai_1.expect)(Object.getPrototypeOf(result)).to.equal(null);
        (0, chai_1.expect)(result[__proto__]).to.equal(protoObj);
    });
    (0, mocha_1.it)('passthrough empty ObjMap', () => {
        const objMap = Object.create(null);
        (0, chai_1.expect)((0, toObjMap_1.toObjMap)(objMap)).to.deep.equal(objMap);
    });
    (0, mocha_1.it)('passthrough ObjMap with properties', () => {
        const objMap = Object.freeze({
            __proto__: null,
            foo: 'bar',
        });
        (0, chai_1.expect)((0, toObjMap_1.toObjMap)(objMap)).to.deep.equal(objMap);
    });
});
//# sourceMappingURL=toObjMap-test.js.map