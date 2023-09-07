"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const resolveOnNextTick_1 = require("../resolveOnNextTick");
(0, mocha_1.describe)('resolveOnNextTick', () => {
    (0, mocha_1.it)('resolves promise on the next tick', async () => {
        const output = [];
        const promise1 = (0, resolveOnNextTick_1.resolveOnNextTick)().then(() => {
            output.push('second');
        });
        const promise2 = (0, resolveOnNextTick_1.resolveOnNextTick)().then(() => {
            output.push('third');
        });
        output.push('first');
        await Promise.all([promise1, promise2]);
        (0, chai_1.expect)(output).to.deep.equal(['first', 'second', 'third']);
    });
});
//# sourceMappingURL=resolveOnNextTick-test.js.map