"use strict";
/**
 * NOTE: the `graphql/subscription` module has been deprecated with its
 * exported functions integrated into the `graphql/execution` module, to
 * better conform with the terminology of the GraphQL specification.
 *
 * For backwards compatibility, the `graphql/subscription` module
 * currently re-exports the moved functions from the `graphql/execution`
 * module. In the next major release, the `graphql/subscription` module
 * will be dropped entirely.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSourceEventStream = exports.subscribe = void 0;
var subscribe_1 = require("../execution/subscribe");
Object.defineProperty(exports, "subscribe", { enumerable: true, get: function () { return subscribe_1.subscribe; } });
Object.defineProperty(exports, "createSourceEventStream", { enumerable: true, get: function () { return subscribe_1.createSourceEventStream; } });
//# sourceMappingURL=index.js.map