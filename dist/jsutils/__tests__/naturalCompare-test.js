"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const naturalCompare_1 = require("../naturalCompare");
(0, mocha_1.describe)('naturalCompare', () => {
    (0, mocha_1.it)('Handles empty strings', () => {
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('', '')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('', 'a')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('', '1')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a', '')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('1', '')).to.equal(1);
    });
    (0, mocha_1.it)('Handles strings of different length', () => {
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('A', 'A')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('A1', 'A1')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('A', 'AA')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('A1', 'A1A')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('AA', 'A')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('A1A', 'A1')).to.equal(1);
    });
    (0, mocha_1.it)('Handles numbers', () => {
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('0', '0')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('1', '1')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('1', '2')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('2', '1')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('2', '11')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('11', '2')).to.equal(1);
    });
    (0, mocha_1.it)('Handles numbers with leading zeros', () => {
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('00', '00')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('0', '00')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('00', '0')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('02', '11')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('11', '02')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('011', '200')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('200', '011')).to.equal(1);
    });
    (0, mocha_1.it)('Handles numbers embedded into names', () => {
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a0a', 'a0a')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a0a', 'a9a')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a9a', 'a0a')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a00a', 'a00a')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a00a', 'a09a')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a09a', 'a00a')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a0a1', 'a0a1')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a0a1', 'a0a9')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a0a9', 'a0a1')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a11a', 'a10a11a')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a11a', 'a10a19a')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a19a', 'a10a11a')).to.equal(1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a11a', 'a10a11a')).to.equal(0);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a11a', 'a10a11b')).to.equal(-1);
        (0, chai_1.expect)((0, naturalCompare_1.naturalCompare)('a10a11b', 'a10a11a')).to.equal(1);
    });
});
//# sourceMappingURL=naturalCompare-test.js.map