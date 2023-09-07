"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSource = exports.Source = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const inspect_1 = require("../jsutils/inspect");
const instanceOf_1 = require("../jsutils/instanceOf");
/**
 * A representation of source input to GraphQL. The `name` and `locationOffset` parameters are
 * optional, but they are useful for clients who store GraphQL documents in source files.
 * For example, if the GraphQL input starts at line 40 in a file named `Foo.graphql`, it might
 * be useful for `name` to be `"Foo.graphql"` and location to be `{ line: 40, column: 1 }`.
 * The `line` and `column` properties in `locationOffset` are 1-indexed.
 */
class Source {
    constructor(body, name = 'GraphQL request', locationOffset = { line: 1, column: 1 }) {
        (0, devAssert_1.devAssert)(typeof body === 'string', `Body must be a string. Received: ${(0, inspect_1.inspect)(body)}.`);
        this.body = body;
        this.name = name;
        this.locationOffset = locationOffset;
        (0, devAssert_1.devAssert)(this.locationOffset.line > 0, 'line in locationOffset is 1-indexed and must be positive.');
        (0, devAssert_1.devAssert)(this.locationOffset.column > 0, 'column in locationOffset is 1-indexed and must be positive.');
    }
    get [Symbol.toStringTag]() {
        return 'Source';
    }
}
exports.Source = Source;
/**
 * Test if the given value is a Source object.
 *
 * @internal
 */
function isSource(source) {
    return (0, instanceOf_1.instanceOf)(source, Source);
}
exports.isSource = isSource;
//# sourceMappingURL=source.js.map