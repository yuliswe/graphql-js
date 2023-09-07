"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectToThrowJSON = exports.expectJSON = void 0;
const chai_1 = require("chai");
const isObjectLike_1 = require("../jsutils/isObjectLike");
const mapValue_1 = require("../jsutils/mapValue");
/**
 * Deeply transforms an arbitrary value to a JSON-safe value by calling toJSON
 * on any nested value which defines it.
 */
function toJSONDeep(value) {
    if (!(0, isObjectLike_1.isObjectLike)(value)) {
        return value;
    }
    if (typeof value.toJSON === 'function') {
        return value.toJSON();
    }
    if (Array.isArray(value)) {
        return value.map(toJSONDeep);
    }
    return (0, mapValue_1.mapValue)(value, toJSONDeep);
}
function expectJSON(actual) {
    const actualJSON = toJSONDeep(actual);
    return {
        toDeepEqual(expected) {
            const expectedJSON = toJSONDeep(expected);
            (0, chai_1.expect)(actualJSON).to.deep.equal(expectedJSON);
        },
        toDeepNestedProperty(path, expected) {
            const expectedJSON = toJSONDeep(expected);
            (0, chai_1.expect)(actualJSON).to.deep.nested.property(path, expectedJSON);
        },
    };
}
exports.expectJSON = expectJSON;
function expectToThrowJSON(fn) {
    function mapException() {
        try {
            return fn();
        }
        catch (error) {
            throw toJSONDeep(error);
        }
    }
    return (0, chai_1.expect)(mapException).to.throw();
}
exports.expectToThrowJSON = expectToThrowJSON;
//# sourceMappingURL=expectJSON.js.map