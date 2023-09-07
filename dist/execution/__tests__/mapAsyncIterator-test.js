"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const mapAsyncIterator_1 = require("../mapAsyncIterator");
/* eslint-disable @typescript-eslint/require-await */
(0, mocha_1.describe)('mapAsyncIterator', () => {
    (0, mocha_1.it)('maps over async generator', async () => {
        async function* source() {
            yield 1;
            yield 2;
            yield 3;
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 6, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('maps over async iterable', async () => {
        const items = [1, 2, 3];
        const iterable = {
            [Symbol.asyncIterator]() {
                return this;
            },
            next() {
                if (items.length > 0) {
                    const value = items[0];
                    items.shift();
                    return Promise.resolve({ done: false, value });
                }
                return Promise.resolve({ done: true, value: undefined });
            },
        };
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(iterable, (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 6, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('compatible with for-await-of', async () => {
        async function* source() {
            yield 1;
            yield 2;
            yield 3;
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        const result = [];
        for await (const x of doubles) {
            result.push(x);
        }
        (0, chai_1.expect)(result).to.deep.equal([2, 4, 6]);
    });
    (0, mocha_1.it)('maps over async values with async function', async () => {
        async function* source() {
            yield 1;
            yield 2;
            yield 3;
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => Promise.resolve(x + x));
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 6, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('allows returning early from mapped async generator', async () => {
        async function* source() {
            try {
                yield 1;
                /* c8 ignore next 2 */
                yield 2;
                yield 3; // Shouldn't be reached.
            }
            finally {
                // eslint-disable-next-line no-unsafe-finally
                return 'The End';
            }
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        // Early return
        (0, chai_1.expect)(await doubles.return('')).to.deep.equal({
            value: 'The End',
            done: true,
        });
        // Subsequent next calls
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('allows returning early from mapped async iterable', async () => {
        const items = [1, 2, 3];
        const iterable = {
            [Symbol.asyncIterator]() {
                return this;
            },
            next() {
                const value = items[0];
                items.shift();
                return Promise.resolve({
                    done: items.length === 0,
                    value,
                });
            },
        };
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(iterable, (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        // Early return
        (0, chai_1.expect)(await doubles.return(0)).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('passes through early return from async values', async () => {
        async function* source() {
            try {
                yield 'a';
                /* c8 ignore next 2 */
                yield 'b';
                yield 'c'; // Shouldn't be reached.
            }
            finally {
                yield 'Done';
                yield 'Last';
            }
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 'aa', done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 'bb', done: false });
        // Early return
        (0, chai_1.expect)(await doubles.return()).to.deep.equal({
            value: 'DoneDone',
            done: false,
        });
        // Subsequent next calls may yield from finally block
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: 'LastLast',
            done: false,
        });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('allows throwing errors through async iterable', async () => {
        const items = [1, 2, 3];
        const iterable = {
            [Symbol.asyncIterator]() {
                return this;
            },
            next() {
                const value = items[0];
                items.shift();
                return Promise.resolve({
                    done: items.length === 0,
                    value,
                });
            },
        };
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(iterable, (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        // Throw error
        let caughtError;
        try {
            /* c8 ignore next */
            await doubles.throw('ouch');
        }
        catch (e) {
            caughtError = e;
        }
        (0, chai_1.expect)(caughtError).to.equal('ouch');
    });
    (0, mocha_1.it)('passes through caught errors through async generators', async () => {
        async function* source() {
            try {
                yield 1;
                /* c8 ignore next 2 */
                yield 2;
                yield 3; // Shouldn't be reached.
            }
            catch (e) {
                yield e;
            }
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 2, done: false });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({ value: 4, done: false });
        // Throw error
        (0, chai_1.expect)(await doubles.throw('Ouch')).to.deep.equal({
            value: 'OuchOuch',
            done: false,
        });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
    });
    (0, mocha_1.it)('does not normally map over thrown errors', async () => {
        async function* source() {
            yield 'Hello';
            throw new Error('Goodbye');
        }
        const doubles = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), (x) => x + x);
        (0, chai_1.expect)(await doubles.next()).to.deep.equal({
            value: 'HelloHello',
            done: false,
        });
        let caughtError;
        try {
            /* c8 ignore next */
            await doubles.next();
        }
        catch (e) {
            caughtError = e;
        }
        (0, chai_1.expect)(caughtError)
            .to.be.an.instanceOf(Error)
            .with.property('message', 'Goodbye');
    });
    async function testClosesSourceWithMapper(mapper) {
        let didVisitFinally = false;
        async function* source() {
            try {
                yield 1;
                /* c8 ignore next 2 */
                yield 2;
                yield 3; // Shouldn't be reached.
            }
            finally {
                didVisitFinally = true;
                yield 1000;
            }
        }
        const throwOver1 = (0, mapAsyncIterator_1.mapAsyncIterator)(source(), mapper);
        (0, chai_1.expect)(await throwOver1.next()).to.deep.equal({ value: 1, done: false });
        let expectedError;
        try {
            /* c8 ignore next */
            await throwOver1.next();
        }
        catch (error) {
            expectedError = error;
        }
        (0, chai_1.expect)(expectedError)
            .to.be.an.instanceOf(Error)
            .with.property('message', 'Cannot count to 2');
        (0, chai_1.expect)(await throwOver1.next()).to.deep.equal({
            value: undefined,
            done: true,
        });
        (0, chai_1.expect)(didVisitFinally).to.equal(true);
    }
    (0, mocha_1.it)('closes source if mapper throws an error', async () => {
        await testClosesSourceWithMapper((x) => {
            if (x > 1) {
                throw new Error('Cannot count to ' + x);
            }
            return x;
        });
    });
    (0, mocha_1.it)('closes source if mapper rejects', async () => {
        await testClosesSourceWithMapper((x) => x > 1
            ? Promise.reject(new Error('Cannot count to ' + x))
            : Promise.resolve(x));
    });
});
//# sourceMappingURL=mapAsyncIterator-test.js.map