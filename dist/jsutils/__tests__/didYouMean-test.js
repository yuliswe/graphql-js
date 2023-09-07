"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const didYouMean_1 = require("../didYouMean");
(0, mocha_1.describe)('didYouMean', () => {
    (0, mocha_1.it)('Does accept an empty list', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)([])).to.equal('');
    });
    (0, mocha_1.it)('Handles single suggestion', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)(['A'])).to.equal(' Did you mean "A"?');
    });
    (0, mocha_1.it)('Handles two suggestions', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)(['A', 'B'])).to.equal(' Did you mean "A" or "B"?');
    });
    (0, mocha_1.it)('Handles multiple suggestions', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)(['A', 'B', 'C'])).to.equal(' Did you mean "A", "B", or "C"?');
    });
    (0, mocha_1.it)('Limits to five suggestions', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)(['A', 'B', 'C', 'D', 'E', 'F'])).to.equal(' Did you mean "A", "B", "C", "D", or "E"?');
    });
    (0, mocha_1.it)('Adds sub-message', () => {
        (0, chai_1.expect)((0, didYouMean_1.didYouMean)('the letter', ['A'])).to.equal(' Did you mean the letter "A"?');
    });
});
//# sourceMappingURL=didYouMean-test.js.map