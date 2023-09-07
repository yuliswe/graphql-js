"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const validate_1 = require("../../validation/validate");
const buildASTSchema_1 = require("../buildASTSchema");
const getIntrospectionQuery_1 = require("../getIntrospectionQuery");
const dummySchema = (0, buildASTSchema_1.buildSchema)(`
  type Query {
    dummy: String
  }
`);
function expectIntrospectionQuery(options) {
    const query = (0, getIntrospectionQuery_1.getIntrospectionQuery)(options);
    const validationErrors = (0, validate_1.validate)(dummySchema, (0, parser_1.parse)(query));
    (0, chai_1.expect)(validationErrors).to.deep.equal([]);
    return {
        toMatch(name, times = 1) {
            const pattern = toRegExp(name);
            (0, chai_1.expect)(query).to.match(pattern);
            (0, chai_1.expect)(query.match(pattern)).to.have.lengthOf(times);
        },
        toNotMatch(name) {
            (0, chai_1.expect)(query).to.not.match(toRegExp(name));
        },
    };
    function toRegExp(name) {
        return new RegExp('\\b' + name + '\\b', 'g');
    }
}
(0, mocha_1.describe)('getIntrospectionQuery', () => {
    (0, mocha_1.it)('skip all "description" fields', () => {
        expectIntrospectionQuery().toMatch('description', 5);
        expectIntrospectionQuery({ descriptions: true }).toMatch('description', 5);
        expectIntrospectionQuery({ descriptions: false }).toNotMatch('description');
    });
    (0, mocha_1.it)('include "isRepeatable" field on directives', () => {
        expectIntrospectionQuery().toNotMatch('isRepeatable');
        expectIntrospectionQuery({ directiveIsRepeatable: true }).toMatch('isRepeatable');
        expectIntrospectionQuery({ directiveIsRepeatable: false }).toNotMatch('isRepeatable');
    });
    (0, mocha_1.it)('include "description" field on schema', () => {
        expectIntrospectionQuery().toMatch('description', 5);
        expectIntrospectionQuery({ schemaDescription: false }).toMatch('description', 5);
        expectIntrospectionQuery({ schemaDescription: true }).toMatch('description', 6);
        expectIntrospectionQuery({
            descriptions: false,
            schemaDescription: true,
        }).toNotMatch('description');
    });
    (0, mocha_1.it)('include "specifiedBy" field', () => {
        expectIntrospectionQuery().toNotMatch('specifiedByURL');
        expectIntrospectionQuery({ specifiedByUrl: true }).toMatch('specifiedByURL');
        expectIntrospectionQuery({ specifiedByUrl: false }).toNotMatch('specifiedByURL');
    });
    (0, mocha_1.it)('include "isDeprecated" field on input values', () => {
        expectIntrospectionQuery().toMatch('isDeprecated', 2);
        expectIntrospectionQuery({ inputValueDeprecation: true }).toMatch('isDeprecated', 3);
        expectIntrospectionQuery({ inputValueDeprecation: false }).toMatch('isDeprecated', 2);
    });
    (0, mocha_1.it)('include "deprecationReason" field on input values', () => {
        expectIntrospectionQuery().toMatch('deprecationReason', 2);
        expectIntrospectionQuery({ inputValueDeprecation: true }).toMatch('deprecationReason', 3);
        expectIntrospectionQuery({ inputValueDeprecation: false }).toMatch('deprecationReason', 2);
    });
    (0, mocha_1.it)('include deprecated input field and args', () => {
        expectIntrospectionQuery().toMatch('includeDeprecated: true', 2);
        expectIntrospectionQuery({ inputValueDeprecation: true }).toMatch('includeDeprecated: true', 5);
        expectIntrospectionQuery({ inputValueDeprecation: false }).toMatch('includeDeprecated: true', 2);
    });
});
//# sourceMappingURL=getIntrospectionQuery-test.js.map