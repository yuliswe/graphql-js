"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const genFuzzStrings_1 = require("../../__testUtils__/genFuzzStrings");
const inspectStr_1 = require("../../__testUtils__/inspectStr");
const invariant_1 = require("../../jsutils/invariant");
const blockString_1 = require("../blockString");
const lexer_1 = require("../lexer");
const source_1 = require("../source");
function lexValue(str) {
    const lexer = new lexer_1.Lexer(new source_1.Source(str));
    const value = lexer.advance().value;
    (0, invariant_1.invariant)(typeof value === 'string');
    (0, invariant_1.invariant)(lexer.advance().kind === '<EOF>', 'Expected EOF');
    return value;
}
function testPrintableBlockString(testValue, options) {
    const blockString = (0, blockString_1.printBlockString)(testValue, options);
    const printedValue = lexValue(blockString);
    (0, invariant_1.invariant)(testValue === printedValue, (0, dedent_1.dedent) `
      Expected lexValue(${(0, inspectStr_1.inspectStr)(blockString)})
         to equal ${(0, inspectStr_1.inspectStr)(testValue)}
         but got  ${(0, inspectStr_1.inspectStr)(printedValue)}
     `);
}
function testNonPrintableBlockString(testValue) {
    const blockString = (0, blockString_1.printBlockString)(testValue);
    const printedValue = lexValue(blockString);
    (0, invariant_1.invariant)(testValue !== printedValue, (0, dedent_1.dedent) `
      Expected lexValue(${(0, inspectStr_1.inspectStr)(blockString)})
        to not equal ${(0, inspectStr_1.inspectStr)(testValue)}
    `);
}
(0, mocha_1.describe)('printBlockString', () => {
    (0, mocha_1.it)('correctly print random strings', () => {
        // Testing with length >7 is taking exponentially more time. However it is
        // highly recommended to test with increased limit if you make any change.
        for (const fuzzStr of (0, genFuzzStrings_1.genFuzzStrings)({
            allowedChars: ['\n', '\t', ' ', '"', 'a', '\\'],
            maxLength: 7,
        })) {
            if (!(0, blockString_1.isPrintableAsBlockString)(fuzzStr)) {
                testNonPrintableBlockString(fuzzStr);
                continue;
            }
            testPrintableBlockString(fuzzStr);
            testPrintableBlockString(fuzzStr, { minimize: true });
        }
    }).timeout(20000);
});
//# sourceMappingURL=blockString-fuzz.js.map