"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePubSub = void 0;
const invariant_1 = require("../../jsutils/invariant");
/**
 * Create an AsyncIterator from an EventEmitter. Useful for mocking a
 * PubSub system for tests.
 */
class SimplePubSub {
    constructor() {
        this._subscribers = new Set();
    }
    emit(event) {
        for (const subscriber of this._subscribers) {
            subscriber(event);
        }
        return this._subscribers.size > 0;
    }
    getSubscriber(transform) {
        const pullQueue = [];
        const pushQueue = [];
        let listening = true;
        this._subscribers.add(pushValue);
        const emptyQueue = () => {
            listening = false;
            this._subscribers.delete(pushValue);
            for (const resolve of pullQueue) {
                resolve({ value: undefined, done: true });
            }
            pullQueue.length = 0;
            pushQueue.length = 0;
        };
        return {
            next() {
                if (!listening) {
                    return Promise.resolve({ value: undefined, done: true });
                }
                if (pushQueue.length > 0) {
                    const value = pushQueue[0];
                    pushQueue.shift();
                    return Promise.resolve({ value, done: false });
                }
                return new Promise((resolve) => pullQueue.push(resolve));
            },
            return() {
                emptyQueue();
                return Promise.resolve({ value: undefined, done: true });
            },
            throw(error) {
                emptyQueue();
                return Promise.reject(error);
            },
            [Symbol.asyncIterator]() {
                return this;
            },
        };
        function pushValue(event) {
            const value = transform(event);
            if (pullQueue.length > 0) {
                const receiver = pullQueue.shift();
                (0, invariant_1.invariant)(receiver);
                receiver({ value, done: false });
            }
            else {
                pushQueue.push(value);
            }
        }
    }
}
exports.SimplePubSub = SimplePubSub;
//# sourceMappingURL=simplePubSub.js.map