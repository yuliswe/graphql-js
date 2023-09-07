"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const getOperationAST_1 = require("../getOperationAST");
(0, mocha_1.describe)('getOperationAST', () => {
    (0, mocha_1.it)('Gets an operation from a simple document', () => {
        const doc = (0, parser_1.parse)('{ field }');
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(doc.definitions[0]);
    });
    (0, mocha_1.it)('Gets an operation from a document with named op (mutation)', () => {
        const doc = (0, parser_1.parse)('mutation Test { field }');
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(doc.definitions[0]);
    });
    (0, mocha_1.it)('Gets an operation from a document with named op (subscription)', () => {
        const doc = (0, parser_1.parse)('subscription Test { field }');
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(doc.definitions[0]);
    });
    (0, mocha_1.it)('Does not get missing operation', () => {
        const doc = (0, parser_1.parse)('type Foo { field: String }');
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(null);
    });
    (0, mocha_1.it)('Does not get ambiguous unnamed operation', () => {
        const doc = (0, parser_1.parse)(`
      { field }
      mutation Test { field }
      subscription TestSub { field }
    `);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(null);
    });
    (0, mocha_1.it)('Does not get ambiguous named operation', () => {
        const doc = (0, parser_1.parse)(`
      query TestQ { field }
      mutation TestM { field }
      subscription TestS { field }
    `);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc)).to.equal(null);
    });
    (0, mocha_1.it)('Does not get misnamed operation', () => {
        const doc = (0, parser_1.parse)(`
      { field }

      query TestQ { field }
      mutation TestM { field }
      subscription TestS { field }
    `);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc, 'Unknown')).to.equal(null);
    });
    (0, mocha_1.it)('Gets named operation', () => {
        const doc = (0, parser_1.parse)(`
      query TestQ { field }
      mutation TestM { field }
      subscription TestS { field }
    `);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc, 'TestQ')).to.equal(doc.definitions[0]);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc, 'TestM')).to.equal(doc.definitions[1]);
        (0, chai_1.expect)((0, getOperationAST_1.getOperationAST)(doc, 'TestS')).to.equal(doc.definitions[2]);
    });
});
//# sourceMappingURL=getOperationAST-test.js.map