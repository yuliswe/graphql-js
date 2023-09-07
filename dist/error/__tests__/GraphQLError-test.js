"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const invariant_1 = require("../../jsutils/invariant");
const kinds_1 = require("../../language/kinds");
const parser_1 = require("../../language/parser");
const source_1 = require("../../language/source");
const GraphQLError_1 = require("../GraphQLError");
const source = new source_1.Source((0, dedent_1.dedent) `
  {
    field
  }
`);
const ast = (0, parser_1.parse)(source);
const operationNode = ast.definitions[0];
(0, invariant_1.invariant)(operationNode.kind === kinds_1.Kind.OPERATION_DEFINITION);
const fieldNode = operationNode.selectionSet.selections[0];
(0, invariant_1.invariant)(fieldNode);
(0, mocha_1.describe)('GraphQLError', () => {
    (0, mocha_1.it)('is a class and is a subclass of Error', () => {
        (0, chai_1.expect)(new GraphQLError_1.GraphQLError('str')).to.be.instanceof(Error);
        (0, chai_1.expect)(new GraphQLError_1.GraphQLError('str')).to.be.instanceof(GraphQLError_1.GraphQLError);
    });
    (0, mocha_1.it)('has a name, message, extensions, and stack trace', () => {
        const e = new GraphQLError_1.GraphQLError('msg');
        (0, chai_1.expect)(e).to.deep.include({
            name: 'GraphQLError',
            message: 'msg',
            extensions: {},
        });
        (0, chai_1.expect)(e.stack).to.be.a('string');
    });
    (0, mocha_1.it)('enumerate only properties prescribed by the spec', () => {
        const e = new GraphQLError_1.GraphQLError('msg' /* message */, {
            nodes: [fieldNode],
            source,
            positions: [1, 2, 3],
            path: ['a', 'b', 'c'],
            originalError: new Error('test'),
            extensions: { foo: 'bar' },
        });
        (0, chai_1.expect)(Object.keys(e)).to.deep.equal([
            'message',
            'path',
            'locations',
            'extensions',
        ]);
    });
    (0, mocha_1.it)('uses the stack of an original error', () => {
        const original = new Error('original');
        const e = new GraphQLError_1.GraphQLError('msg', {
            originalError: original,
        });
        (0, chai_1.expect)(e).to.include({
            name: 'GraphQLError',
            message: 'msg',
            stack: original.stack,
            originalError: original,
        });
    });
    (0, mocha_1.it)('creates new stack if original error has no stack', () => {
        const original = new Error('original');
        const e = new GraphQLError_1.GraphQLError('msg', { originalError: original });
        (0, chai_1.expect)(e).to.include({
            name: 'GraphQLError',
            message: 'msg',
            originalError: original,
        });
        (0, chai_1.expect)(e.stack).to.be.a('string');
    });
    (0, mocha_1.it)('converts nodes to positions and locations', () => {
        const e = new GraphQLError_1.GraphQLError('msg', { nodes: [fieldNode] });
        (0, chai_1.expect)(e).to.deep.include({
            source,
            nodes: [fieldNode],
            positions: [4],
            locations: [{ line: 2, column: 3 }],
        });
    });
    (0, mocha_1.it)('converts single node to positions and locations', () => {
        const e = new GraphQLError_1.GraphQLError('msg', { nodes: fieldNode }); // Non-array value.
        (0, chai_1.expect)(e).to.deep.include({
            source,
            nodes: [fieldNode],
            positions: [4],
            locations: [{ line: 2, column: 3 }],
        });
    });
    (0, mocha_1.it)('converts node with loc.start === 0 to positions and locations', () => {
        const e = new GraphQLError_1.GraphQLError('msg', { nodes: operationNode });
        (0, chai_1.expect)(e).to.deep.include({
            source,
            nodes: [operationNode],
            positions: [0],
            locations: [{ line: 1, column: 1 }],
        });
    });
    (0, mocha_1.it)('converts node without location to undefined source, positions and locations', () => {
        const fieldNodeNoLocation = {
            ...fieldNode,
            loc: undefined,
        };
        const e = new GraphQLError_1.GraphQLError('msg', { nodes: fieldNodeNoLocation });
        (0, chai_1.expect)(e).to.deep.include({
            nodes: [fieldNodeNoLocation],
            source: undefined,
            positions: undefined,
            locations: undefined,
        });
    });
    (0, mocha_1.it)('converts source and positions to locations', () => {
        const e = new GraphQLError_1.GraphQLError('msg', { source, positions: [6] });
        (0, chai_1.expect)(e).to.deep.include({
            source,
            nodes: undefined,
            positions: [6],
            locations: [{ line: 2, column: 5 }],
        });
    });
    (0, mocha_1.it)('defaults to original error extension only if extensions argument is not passed', () => {
        class ErrorWithExtensions extends Error {
            constructor(message) {
                super(message);
                this.extensions = { original: 'extensions' };
            }
        }
        const original = new ErrorWithExtensions('original');
        const inheritedExtensions = new GraphQLError_1.GraphQLError('InheritedExtensions', {
            originalError: original,
        });
        (0, chai_1.expect)(inheritedExtensions).to.deep.include({
            message: 'InheritedExtensions',
            originalError: original,
            extensions: { original: 'extensions' },
        });
        const ownExtensions = new GraphQLError_1.GraphQLError('OwnExtensions', {
            originalError: original,
            extensions: { own: 'extensions' },
        });
        (0, chai_1.expect)(ownExtensions).to.deep.include({
            message: 'OwnExtensions',
            originalError: original,
            extensions: { own: 'extensions' },
        });
        const ownEmptyExtensions = new GraphQLError_1.GraphQLError('OwnEmptyExtensions', {
            originalError: original,
            extensions: {},
        });
        (0, chai_1.expect)(ownEmptyExtensions).to.deep.include({
            message: 'OwnEmptyExtensions',
            originalError: original,
            extensions: {},
        });
    });
    (0, mocha_1.it)('serializes to include all standard fields', () => {
        const eShort = new GraphQLError_1.GraphQLError('msg');
        (0, chai_1.expect)(JSON.stringify(eShort, null, 2)).to.equal((0, dedent_1.dedent) `
      {
        "message": "msg"
      }
    `);
        const path = ['path', 2, 'field'];
        const extensions = { foo: 'bar' };
        const eFull = new GraphQLError_1.GraphQLError('msg', {
            nodes: fieldNode,
            path,
            extensions,
        });
        // We should try to keep order of fields stable
        // Changing it wouldn't be breaking change but will fail some tests in other libraries.
        (0, chai_1.expect)(JSON.stringify(eFull, null, 2)).to.equal((0, dedent_1.dedent) `
      {
        "message": "msg",
        "locations": [
          {
            "line": 2,
            "column": 3
          }
        ],
        "path": [
          "path",
          2,
          "field"
        ],
        "extensions": {
          "foo": "bar"
        }
      }
    `);
    });
});
(0, mocha_1.describe)('toString', () => {
    (0, mocha_1.it)('Deprecated: prints an error using printError', () => {
        const error = new GraphQLError_1.GraphQLError('Error');
        (0, chai_1.expect)((0, GraphQLError_1.printError)(error)).to.equal('Error');
    });
    (0, mocha_1.it)('prints an error without location', () => {
        const error = new GraphQLError_1.GraphQLError('Error without location');
        (0, chai_1.expect)(error.toString()).to.equal('Error without location');
    });
    (0, mocha_1.it)('prints an error using node without location', () => {
        const error = new GraphQLError_1.GraphQLError('Error attached to node without location', {
            nodes: (0, parser_1.parse)('{ foo }', { noLocation: true }),
        });
        (0, chai_1.expect)(error.toString()).to.equal('Error attached to node without location');
    });
    (0, mocha_1.it)('prints an error with nodes from different sources', () => {
        const docA = (0, parser_1.parse)(new source_1.Source((0, dedent_1.dedent) `
          type Foo {
            field: String
          }
        `, 'SourceA'));
        const opA = docA.definitions[0];
        (0, invariant_1.invariant)(opA.kind === kinds_1.Kind.OBJECT_TYPE_DEFINITION && opA.fields);
        const fieldA = opA.fields[0];
        const docB = (0, parser_1.parse)(new source_1.Source((0, dedent_1.dedent) `
          type Foo {
            field: Int
          }
        `, 'SourceB'));
        const opB = docB.definitions[0];
        (0, invariant_1.invariant)(opB.kind === kinds_1.Kind.OBJECT_TYPE_DEFINITION && opB.fields);
        const fieldB = opB.fields[0];
        const error = new GraphQLError_1.GraphQLError('Example error with two nodes', [
            fieldA.type,
            fieldB.type,
        ]);
        (0, chai_1.expect)(error.toString()).to.equal((0, dedent_1.dedent) `
      Example error with two nodes

      SourceA:2:10
      1 | type Foo {
      2 |   field: String
        |          ^
      3 | }

      SourceB:2:10
      1 | type Foo {
      2 |   field: Int
        |          ^
      3 | }
    `);
    });
});
(0, mocha_1.describe)('toJSON', () => {
    (0, mocha_1.it)('Deprecated: format an error using formatError', () => {
        const error = new GraphQLError_1.GraphQLError('Example Error');
        (0, chai_1.expect)((0, GraphQLError_1.formatError)(error)).to.deep.equal({
            message: 'Example Error',
        });
    });
    (0, mocha_1.it)('includes path', () => {
        const error = new GraphQLError_1.GraphQLError('msg', { path: ['path', 3, 'to', 'field'] });
        (0, chai_1.expect)(error.toJSON()).to.deep.equal({
            message: 'msg',
            path: ['path', 3, 'to', 'field'],
        });
    });
    (0, mocha_1.it)('includes extension fields', () => {
        const error = new GraphQLError_1.GraphQLError('msg', {
            extensions: { foo: 'bar' },
        });
        (0, chai_1.expect)(error.toJSON()).to.deep.equal({
            message: 'msg',
            extensions: { foo: 'bar' },
        });
    });
    (0, mocha_1.it)('can be created with the legacy argument list', () => {
        const error = new GraphQLError_1.GraphQLError('msg', [operationNode], source, [6], ['path', 2, 'a'], new Error('I like turtles'), { hee: 'I like turtles' });
        (0, chai_1.expect)(error.toJSON()).to.deep.equal({
            message: 'msg',
            locations: [{ column: 5, line: 2 }],
            path: ['path', 2, 'a'],
            extensions: { hee: 'I like turtles' },
        });
    });
});
//# sourceMappingURL=GraphQLError-test.js.map