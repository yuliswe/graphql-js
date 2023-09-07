"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const source_1 = require("../../language/source");
const concatAST_1 = require("../concatAST");
(0, mocha_1.describe)('concatAST', () => {
    (0, mocha_1.it)('concatenates two ASTs together', () => {
        const sourceA = new source_1.Source(`
      { a, b, ...Frag }
    `);
        const sourceB = new source_1.Source(`
      fragment Frag on T {
        c
      }
    `);
        const astA = (0, parser_1.parse)(sourceA);
        const astB = (0, parser_1.parse)(sourceB);
        const astC = (0, concatAST_1.concatAST)([astA, astB]);
        (0, chai_1.expect)((0, printer_1.print)(astC)).to.equal((0, dedent_1.dedent) `
      {
        a
        b
        ...Frag
      }

      fragment Frag on T {
        c
      }
    `);
    });
});
//# sourceMappingURL=concatAST-test.js.map