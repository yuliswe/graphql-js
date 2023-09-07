"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genFuzzStrings = void 0;
/**
 * Generator that produces all possible combinations of allowed characters.
 */
function* genFuzzStrings(options) {
    const { allowedChars, maxLength } = options;
    const numAllowedChars = allowedChars.length;
    let numCombinations = 0;
    for (let length = 1; length <= maxLength; ++length) {
        numCombinations += numAllowedChars ** length;
    }
    yield ''; // special case for empty string
    for (let combination = 0; combination < numCombinations; ++combination) {
        let permutation = '';
        let leftOver = combination;
        while (leftOver >= 0) {
            const reminder = leftOver % numAllowedChars;
            permutation = allowedChars[reminder] + permutation;
            leftOver = (leftOver - reminder) / numAllowedChars - 1;
        }
        yield permutation;
    }
}
exports.genFuzzStrings = genFuzzStrings;
//# sourceMappingURL=genFuzzStrings.js.map