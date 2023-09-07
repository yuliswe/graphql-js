"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const simplePubSub_1 = require("./simplePubSub");
(0, mocha_1.describe)('SimplePubSub', () => {
    (0, mocha_1.it)('subscribe async-iterator mock', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const iterator = pubsub.getSubscriber((x) => x);
        // Queue up publishes
        (0, chai_1.expect)(pubsub.emit('Apple')).to.equal(true);
        (0, chai_1.expect)(pubsub.emit('Banana')).to.equal(true);
        // Read payloads
        (0, chai_1.expect)(await iterator.next()).to.deep.equal({
            done: false,
            value: 'Apple',
        });
        (0, chai_1.expect)(await iterator.next()).to.deep.equal({
            done: false,
            value: 'Banana',
        });
        // Read ahead
        const i3 = iterator.next().then((x) => x);
        const i4 = iterator.next().then((x) => x);
        // Publish
        (0, chai_1.expect)(pubsub.emit('Coconut')).to.equal(true);
        (0, chai_1.expect)(pubsub.emit('Durian')).to.equal(true);
        // Await out of order to get correct results
        (0, chai_1.expect)(await i4).to.deep.equal({ done: false, value: 'Durian' });
        (0, chai_1.expect)(await i3).to.deep.equal({ done: false, value: 'Coconut' });
        // Read ahead
        const i5 = iterator.next().then((x) => x);
        // Terminate queue
        await iterator.return();
        // Publish is not caught after terminate
        (0, chai_1.expect)(pubsub.emit('Fig')).to.equal(false);
        // Find that cancelled read-ahead got a "done" result
        (0, chai_1.expect)(await i5).to.deep.equal({ done: true, value: undefined });
        // And next returns empty completion value
        (0, chai_1.expect)(await iterator.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
});
//# sourceMappingURL=simplePubSub-test.js.map