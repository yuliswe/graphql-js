"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const resolveOnNextTick_1 = require("../../__testUtils__/resolveOnNextTick");
const invariant_1 = require("../../jsutils/invariant");
const isAsyncIterable_1 = require("../../jsutils/isAsyncIterable");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const subscribe_1 = require("../subscribe");
const simplePubSub_1 = require("./simplePubSub");
const EmailType = new definition_1.GraphQLObjectType({
    name: 'Email',
    fields: {
        from: { type: scalars_1.GraphQLString },
        subject: { type: scalars_1.GraphQLString },
        message: { type: scalars_1.GraphQLString },
        unread: { type: scalars_1.GraphQLBoolean },
    },
});
const InboxType = new definition_1.GraphQLObjectType({
    name: 'Inbox',
    fields: {
        total: {
            type: scalars_1.GraphQLInt,
            resolve: (inbox) => inbox.emails.length,
        },
        unread: {
            type: scalars_1.GraphQLInt,
            resolve: (inbox) => inbox.emails.filter((email) => email.unread).length,
        },
        emails: { type: new definition_1.GraphQLList(EmailType) },
    },
});
const QueryType = new definition_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        inbox: { type: InboxType },
    },
});
const EmailEventType = new definition_1.GraphQLObjectType({
    name: 'EmailEvent',
    fields: {
        email: { type: EmailType },
        inbox: { type: InboxType },
    },
});
const emailSchema = new schema_1.GraphQLSchema({
    query: QueryType,
    subscription: new definition_1.GraphQLObjectType({
        name: 'Subscription',
        fields: {
            importantEmail: {
                type: EmailEventType,
                args: {
                    priority: { type: scalars_1.GraphQLInt },
                },
            },
        },
    }),
});
function createSubscription(pubsub) {
    const document = (0, parser_1.parse)(`
    subscription ($priority: Int = 0) {
      importantEmail(priority: $priority) {
        email {
          from
          subject
        }
        inbox {
          unread
          total
        }
      }
    }
  `);
    const emails = [
        {
            from: 'joe@graphql.org',
            subject: 'Hello',
            message: 'Hello World',
            unread: false,
        },
    ];
    const data = {
        inbox: { emails },
        // FIXME: we shouldn't use mapAsyncIterator here since it makes tests way more complex
        importantEmail: pubsub.getSubscriber((newEmail) => {
            emails.push(newEmail);
            return {
                importantEmail: {
                    email: newEmail,
                    inbox: data.inbox,
                },
            };
        }),
    };
    return (0, subscribe_1.subscribe)({ schema: emailSchema, document, rootValue: data });
}
async function expectPromise(promise) {
    let caughtError;
    try {
        /* c8 ignore next 2 */
        await promise;
        chai_1.expect.fail('promise should have thrown but did not');
    }
    catch (error) {
        caughtError = error;
    }
    return {
        toReject() {
            (0, chai_1.expect)(caughtError).to.be.an.instanceOf(Error);
        },
        toRejectWith(message) {
            (0, chai_1.expect)(caughtError).to.be.an.instanceOf(Error);
            (0, chai_1.expect)(caughtError).to.have.property('message', message);
        },
    };
}
const DummyQueryType = new definition_1.GraphQLObjectType({
    name: 'Query',
    fields: {
        dummy: { type: scalars_1.GraphQLString },
    },
});
/* eslint-disable @typescript-eslint/require-await */
// Check all error cases when initializing the subscription.
(0, mocha_1.describe)('Subscription Initialization Phase', () => {
    (0, mocha_1.it)('accepts multiple subscription fields defined in schema', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                    bar: { type: scalars_1.GraphQLString },
                },
            }),
        });
        async function* fooGenerator() {
            yield { foo: 'FooValue' };
        }
        const subscription = await (0, subscribe_1.subscribe)({
            schema,
            document: (0, parser_1.parse)('subscription { foo }'),
            rootValue: { foo: fooGenerator },
        });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: { data: { foo: 'FooValue' } },
        });
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('accepts type definition with sync subscribe function', async () => {
        async function* fooGenerator() {
            yield { foo: 'FooValue' };
        }
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: {
                        type: scalars_1.GraphQLString,
                        subscribe: fooGenerator,
                    },
                },
            }),
        });
        const subscription = await (0, subscribe_1.subscribe)({
            schema,
            document: (0, parser_1.parse)('subscription { foo }'),
        });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: { data: { foo: 'FooValue' } },
        });
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('accepts type definition with async subscribe function', async () => {
        async function* fooGenerator() {
            yield { foo: 'FooValue' };
        }
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: {
                        type: scalars_1.GraphQLString,
                        async subscribe() {
                            await (0, resolveOnNextTick_1.resolveOnNextTick)();
                            return fooGenerator();
                        },
                    },
                },
            }),
        });
        const subscription = await (0, subscribe_1.subscribe)({
            schema,
            document: (0, parser_1.parse)('subscription { foo }'),
        });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: { data: { foo: 'FooValue' } },
        });
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('uses a custom default subscribeFieldResolver', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        async function* fooGenerator() {
            yield { foo: 'FooValue' };
        }
        const subscription = await (0, subscribe_1.subscribe)({
            schema,
            document: (0, parser_1.parse)('subscription { foo }'),
            rootValue: { customFoo: fooGenerator },
            subscribeFieldResolver: (root) => root.customFoo(),
        });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: { data: { foo: 'FooValue' } },
        });
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('should only resolve the first field of invalid multi-field', async () => {
        async function* fooGenerator() {
            yield { foo: 'FooValue' };
        }
        let didResolveFoo = false;
        let didResolveBar = false;
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: {
                        type: scalars_1.GraphQLString,
                        subscribe() {
                            didResolveFoo = true;
                            return fooGenerator();
                        },
                    },
                    bar: {
                        type: scalars_1.GraphQLString,
                        /* c8 ignore next 3 */
                        subscribe() {
                            didResolveBar = true;
                        },
                    },
                },
            }),
        });
        const subscription = await (0, subscribe_1.subscribe)({
            schema,
            document: (0, parser_1.parse)('subscription { foo bar }'),
        });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(didResolveFoo).to.equal(true);
        (0, chai_1.expect)(didResolveBar).to.equal(false);
        (0, chai_1.expect)(await subscription.next()).to.have.property('done', false);
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('throws an error if some of required arguments are missing', async () => {
        const document = (0, parser_1.parse)('subscription { foo }');
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        // @ts-expect-error (schema must not be null)
        (await expectPromise((0, subscribe_1.subscribe)({ schema: null, document }))).toRejectWith('Expected null to be a GraphQL schema.');
        // @ts-expect-error
        (await expectPromise((0, subscribe_1.subscribe)({ document }))).toRejectWith('Expected undefined to be a GraphQL schema.');
        // @ts-expect-error (document must not be null)
        (await expectPromise((0, subscribe_1.subscribe)({ schema, document: null }))).toRejectWith('Must provide document.');
        // @ts-expect-error
        (await expectPromise((0, subscribe_1.subscribe)({ schema }))).toRejectWith('Must provide document.');
    });
    (0, mocha_1.it)('Deprecated: allows positional arguments to createSourceEventStream', async () => {
        async function* fooGenerator() {
            /* c8 ignore next 2 */
            yield { foo: 'FooValue' };
        }
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString, subscribe: fooGenerator },
                },
            }),
        });
        const document = (0, parser_1.parse)('subscription { foo }');
        const eventStream = await (0, subscribe_1.createSourceEventStream)(schema, document);
        (0, chai_1.assert)((0, isAsyncIterable_1.isAsyncIterable)(eventStream));
    });
    (0, mocha_1.it)('Deprecated: throws an error if document is missing when using positional arguments', async () => {
        const document = (0, parser_1.parse)('subscription { foo }');
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        // @ts-expect-error (schema must not be null)
        (await expectPromise((0, subscribe_1.createSourceEventStream)(null, document))).toRejectWith('Expected null to be a GraphQL schema.');
        (await expectPromise((0, subscribe_1.createSourceEventStream)(
        // @ts-expect-error
        undefined, document))).toRejectWith('Expected undefined to be a GraphQL schema.');
        // @ts-expect-error (document must not be null)
        (await expectPromise((0, subscribe_1.createSourceEventStream)(schema, null))).toRejectWith('Must provide document.');
        // @ts-expect-error
        (await expectPromise((0, subscribe_1.createSourceEventStream)(schema))).toRejectWith('Must provide document.');
    });
    (0, mocha_1.it)('resolves to an error if schema does not support subscriptions', async () => {
        const schema = new schema_1.GraphQLSchema({ query: DummyQueryType });
        const document = (0, parser_1.parse)('subscription { unknownField }');
        const result = await (0, subscribe_1.subscribe)({ schema, document });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Schema is not configured to execute subscription operation.',
                    locations: [{ line: 1, column: 1 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('resolves to an error for unknown subscription field', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        const document = (0, parser_1.parse)('subscription { unknownField }');
        const result = await (0, subscribe_1.subscribe)({ schema, document });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'The subscription field "unknownField" is not defined.',
                    locations: [{ line: 1, column: 16 }],
                },
            ],
        });
    });
    (0, mocha_1.it)('should pass through unexpected errors thrown in subscribe', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: { type: scalars_1.GraphQLString },
                },
            }),
        });
        // @ts-expect-error
        (await expectPromise((0, subscribe_1.subscribe)({ schema, document: {} }))).toReject();
    });
    (0, mocha_1.it)('throws an error if subscribe does not return an iterator', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: {
                        type: scalars_1.GraphQLString,
                        subscribe: () => 'test',
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)('subscription { foo }');
        (await expectPromise((0, subscribe_1.subscribe)({ schema, document }))).toRejectWith('Subscription field must return Async Iterable. Received: "test".');
    });
    (0, mocha_1.it)('resolves to an error for subscription resolver errors', async () => {
        async function subscribeWithFn(subscribeFn) {
            const schema = new schema_1.GraphQLSchema({
                query: DummyQueryType,
                subscription: new definition_1.GraphQLObjectType({
                    name: 'Subscription',
                    fields: {
                        foo: { type: scalars_1.GraphQLString, subscribe: subscribeFn },
                    },
                }),
            });
            const document = (0, parser_1.parse)('subscription { foo }');
            const result = await (0, subscribe_1.subscribe)({ schema, document });
            (0, expectJSON_1.expectJSON)(await (0, subscribe_1.createSourceEventStream)(schema, document)).toDeepEqual(result);
            return result;
        }
        const expectedResult = {
            errors: [
                {
                    message: 'test error',
                    locations: [{ line: 1, column: 16 }],
                    path: ['foo'],
                },
            ],
        };
        (0, expectJSON_1.expectJSON)(
        // Returning an error
        await subscribeWithFn(() => new Error('test error'))).toDeepEqual(expectedResult);
        (0, expectJSON_1.expectJSON)(
        // Throwing an error
        await subscribeWithFn(() => {
            throw new Error('test error');
        })).toDeepEqual(expectedResult);
        (0, expectJSON_1.expectJSON)(
        // Resolving to an error
        await subscribeWithFn(() => Promise.resolve(new Error('test error')))).toDeepEqual(expectedResult);
        (0, expectJSON_1.expectJSON)(
        // Rejecting with an error
        await subscribeWithFn(() => Promise.reject(new Error('test error')))).toDeepEqual(expectedResult);
    });
    (0, mocha_1.it)('resolves to an error if variables were wrong type', async () => {
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    foo: {
                        type: scalars_1.GraphQLString,
                        args: { arg: { type: scalars_1.GraphQLInt } },
                    },
                },
            }),
        });
        const variableValues = { arg: 'meow' };
        const document = (0, parser_1.parse)(`
      subscription ($arg: Int) {
        foo(arg: $arg)
      }
    `);
        // If we receive variables that cannot be coerced correctly, subscribe() will
        // resolve to an ExecutionResult that contains an informative error description.
        const result = await (0, subscribe_1.subscribe)({ schema, document, variableValues });
        (0, expectJSON_1.expectJSON)(result).toDeepEqual({
            errors: [
                {
                    message: 'Variable "$arg" got invalid value "meow"; Int cannot represent non-integer value: "meow"',
                    locations: [{ line: 2, column: 21 }],
                },
            ],
        });
    });
});
// Once a subscription returns a valid AsyncIterator, it can still yield errors.
(0, mocha_1.describe)('Subscription Publish Phase', () => {
    (0, mocha_1.it)('produces a payload for multiple subscribe in same subscription', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        const secondSubscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(secondSubscription));
        const payload1 = subscription.next();
        const payload2 = secondSubscription.next();
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        const expectedPayload = {
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright',
                        },
                        inbox: {
                            unread: 1,
                            total: 2,
                        },
                    },
                },
            },
        };
        (0, chai_1.expect)(await payload1).to.deep.equal(expectedPayload);
        (0, chai_1.expect)(await payload2).to.deep.equal(expectedPayload);
    });
    (0, mocha_1.it)('produces a payload per subscription event', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        // Wait for the next subscription payload.
        const payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        // The previously waited on payload now has a value.
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright',
                        },
                        inbox: {
                            unread: 1,
                            total: 2,
                        },
                    },
                },
            },
        });
        // Another new email arrives, before subscription.next() is called.
        (0, chai_1.expect)(pubsub.emit({
            from: 'hyo@graphql.org',
            subject: 'Tools',
            message: 'I <3 making things',
            unread: true,
        })).to.equal(true);
        // The next waited on payload will have a value.
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'hyo@graphql.org',
                            subject: 'Tools',
                        },
                        inbox: {
                            unread: 2,
                            total: 3,
                        },
                    },
                },
            },
        });
        // The client decides to disconnect.
        (0, chai_1.expect)(await subscription.return()).to.deep.equal({
            done: true,
            value: undefined,
        });
        // Which may result in disconnecting upstream services as well.
        (0, chai_1.expect)(pubsub.emit({
            from: 'adam@graphql.org',
            subject: 'Important',
            message: 'Read me please',
            unread: true,
        })).to.equal(false); // No more listeners.
        // Awaiting a subscription after closing it results in completed results.
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('produces a payload when there are multiple events', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        let payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright',
                        },
                        inbox: {
                            unread: 1,
                            total: 2,
                        },
                    },
                },
            },
        });
        payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright 2',
            message: 'Tests are good 2',
            unread: true,
        })).to.equal(true);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright 2',
                        },
                        inbox: {
                            unread: 2,
                            total: 3,
                        },
                    },
                },
            },
        });
    });
    (0, mocha_1.it)('should not trigger when subscription is already done', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        let payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright',
                        },
                        inbox: {
                            unread: 1,
                            total: 2,
                        },
                    },
                },
            },
        });
        payload = subscription.next();
        await subscription.return();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright 2',
            message: 'Tests are good 2',
            unread: true,
        })).to.equal(false);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('should not trigger when subscription is thrown', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        let payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Alright',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Alright',
                        },
                        inbox: {
                            unread: 1,
                            total: 2,
                        },
                    },
                },
            },
        });
        payload = subscription.next();
        // Throw error
        let caughtError;
        try {
            /* c8 ignore next */
            await subscription.throw('ouch');
        }
        catch (e) {
            caughtError = e;
        }
        (0, chai_1.expect)(caughtError).to.equal('ouch');
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('event order is correct for multiple publishes', async () => {
        const pubsub = new simplePubSub_1.SimplePubSub();
        const subscription = await createSubscription(pubsub);
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        let payload = subscription.next();
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Message',
            message: 'Tests are good',
            unread: true,
        })).to.equal(true);
        // A new email arrives!
        (0, chai_1.expect)(pubsub.emit({
            from: 'yuzhi@graphql.org',
            subject: 'Message 2',
            message: 'Tests are good 2',
            unread: true,
        })).to.equal(true);
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Message',
                        },
                        inbox: {
                            unread: 2,
                            total: 3,
                        },
                    },
                },
            },
        });
        payload = subscription.next();
        (0, chai_1.expect)(await payload).to.deep.equal({
            done: false,
            value: {
                data: {
                    importantEmail: {
                        email: {
                            from: 'yuzhi@graphql.org',
                            subject: 'Message 2',
                        },
                        inbox: {
                            unread: 2,
                            total: 3,
                        },
                    },
                },
            },
        });
    });
    (0, mocha_1.it)('should handle error during execution of source event', async () => {
        async function* generateMessages() {
            yield 'Hello';
            yield 'Goodbye';
            yield 'Bonjour';
        }
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    newMessage: {
                        type: scalars_1.GraphQLString,
                        subscribe: generateMessages,
                        resolve(message) {
                            if (message === 'Goodbye') {
                                throw new Error('Never leave.');
                            }
                            return message;
                        },
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)('subscription { newMessage }');
        const subscription = await (0, subscribe_1.subscribe)({ schema, document });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: {
                data: { newMessage: 'Hello' },
            },
        });
        // An error in execution is presented as such.
        (0, expectJSON_1.expectJSON)(await subscription.next()).toDeepEqual({
            done: false,
            value: {
                data: { newMessage: null },
                errors: [
                    {
                        message: 'Never leave.',
                        locations: [{ line: 1, column: 16 }],
                        path: ['newMessage'],
                    },
                ],
            },
        });
        // However that does not close the response event stream.
        // Subsequent events are still executed.
        (0, expectJSON_1.expectJSON)(await subscription.next()).toDeepEqual({
            done: false,
            value: {
                data: { newMessage: 'Bonjour' },
            },
        });
        (0, expectJSON_1.expectJSON)(await subscription.next()).toDeepEqual({
            done: true,
            value: undefined,
        });
    });
    (0, mocha_1.it)('should pass through error thrown in source event stream', async () => {
        async function* generateMessages() {
            yield 'Hello';
            throw new Error('test error');
        }
        const schema = new schema_1.GraphQLSchema({
            query: DummyQueryType,
            subscription: new definition_1.GraphQLObjectType({
                name: 'Subscription',
                fields: {
                    newMessage: {
                        type: scalars_1.GraphQLString,
                        resolve: (message) => message,
                        subscribe: generateMessages,
                    },
                },
            }),
        });
        const document = (0, parser_1.parse)('subscription { newMessage }');
        const subscription = await (0, subscribe_1.subscribe)({ schema, document });
        (0, invariant_1.invariant)((0, isAsyncIterable_1.isAsyncIterable)(subscription));
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: false,
            value: {
                data: { newMessage: 'Hello' },
            },
        });
        (await expectPromise(subscription.next())).toRejectWith('test error');
        (0, chai_1.expect)(await subscription.next()).to.deep.equal({
            done: true,
            value: undefined,
        });
    });
});
//# sourceMappingURL=subscribe-test.js.map