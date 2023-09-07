"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const genFuzzStrings_1 = require("../../__testUtils__/genFuzzStrings");
const inspectStr_1 = require("../../__testUtils__/inspectStr");
const invariant_1 = require("../../jsutils/invariant");
const lexer_1 = require("../../language/lexer");
const source_1 = require("../../language/source");
const stripIgnoredCharacters_1 = require("../stripIgnoredCharacters");
function lexValue(str) {
    const lexer = new lexer_1.Lexer(new source_1.Source(str));
    const value = lexer.advance().value;
    (0, invariant_1.invariant)(lexer.advance().kind === '<EOF>', 'Expected EOF');
    return value;
}
(0, mocha_1.describe)('stripIgnoredCharacters', () => {
    (0, mocha_1.it)('strips ignored characters inside random block strings', () => {
        // Testing with length >7 is taking exponentially more time. However it is
        // highly recommended to test with increased limit if you make any change.
        for (const fuzzStr of (0, genFuzzStrings_1.genFuzzStrings)({
            allowedChars: ['\n', '\t', ' ', '"', 'a', '\\'],
            maxLength: 7,
        })) {
            const testStr = '"""' + fuzzStr + '"""';
            let testValue;
            try {
                testValue = lexValue(testStr);
            }
            catch (e) {
                continue; // skip invalid values
            }
            const strippedValue = lexValue((0, stripIgnoredCharacters_1.stripIgnoredCharacters)(testStr));
            (0, invariant_1.invariant)(testValue === strippedValue, (0, dedent_1.dedent) `
          Expected lexValue(stripIgnoredCharacters(${(0, inspectStr_1.inspectStr)(testStr)}))
            to equal ${(0, inspectStr_1.inspectStr)(testValue)}
            but got  ${(0, inspectStr_1.inspectStr)(strippedValue)}
        `);
        }
    }).timeout(20000);
});
//# sourceMappingURL=stripIgnoredCharacters-fuzz.js.map