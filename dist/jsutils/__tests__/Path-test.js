"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const Path_1 = require("../Path");
(0, mocha_1.describe)('Path', () => {
    (0, mocha_1.it)('can create a Path', () => {
        const first = (0, Path_1.addPath)(undefined, 1, 'First');
        (0, chai_1.expect)(first).to.deep.equal({
            prev: undefined,
            key: 1,
            typename: 'First',
        });
    });
    (0, mocha_1.it)('can add a new key to an existing Path', () => {
        const first = (0, Path_1.addPath)(undefined, 1, 'First');
        const second = (0, Path_1.addPath)(first, 'two', 'Second');
        (0, chai_1.expect)(second).to.deep.equal({
            prev: first,
            key: 'two',
            typename: 'Second',
        });
    });
    (0, mocha_1.it)('can convert a Path to an array of its keys', () => {
        const root = (0, Path_1.addPath)(undefined, 0, 'Root');
        const first = (0, Path_1.addPath)(root, 'one', 'First');
        const second = (0, Path_1.addPath)(first, 2, 'Second');
        const path = (0, Path_1.pathToArray)(second);
        (0, chai_1.expect)(path).to.deep.equal([0, 'one', 2]);
    });
});
//# sourceMappingURL=Path-test.js.map