"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const kitchenSinkQuery_1 = require("../../__testUtils__/kitchenSinkQuery");
const ast_1 = require("../ast");
const kinds_1 = require("../kinds");
const parser_1 = require("../parser");
const visitor_1 = require("../visitor");
function checkVisitorFnArgs(ast, args, isEdited = false) {
    const [node, key, parent, path, ancestors] = args;
    (0, chai_1.expect)(node).to.be.an.instanceof(Object);
    (0, chai_1.expect)(node.kind).to.be.oneOf(Object.values(kinds_1.Kind));
    const isRoot = key === undefined;
    if (isRoot) {
        if (!isEdited) {
            (0, chai_1.expect)(node).to.equal(ast);
        }
        (0, chai_1.expect)(parent).to.equal(undefined);
        (0, chai_1.expect)(path).to.deep.equal([]);
        (0, chai_1.expect)(ancestors).to.deep.equal([]);
        return;
    }
    (0, chai_1.expect)(typeof key).to.be.oneOf(['number', 'string']);
    (0, chai_1.expect)(parent).to.have.property(key);
    (0, chai_1.expect)(path).to.be.an.instanceof(Array);
    (0, chai_1.expect)(path[path.length - 1]).to.equal(key);
    (0, chai_1.expect)(ancestors).to.be.an.instanceof(Array);
    (0, chai_1.expect)(ancestors.length).to.equal(path.length - 1);
    if (!isEdited) {
        let currentNode = ast;
        for (let i = 0; i < ancestors.length; ++i) {
            (0, chai_1.expect)(ancestors[i]).to.equal(currentNode);
            currentNode = currentNode[path[i]];
            (0, chai_1.expect)(currentNode).to.not.equal(undefined);
        }
        (0, chai_1.expect)(parent).to.equal(currentNode);
        (0, chai_1.expect)(parent[key]).to.equal(node);
    }
}
function getValue(node) {
    return 'value' in node ? node.value : undefined;
}
(0, mocha_1.describe)('Visitor', () => {
    (0, mocha_1.it)('handles empty visitor', () => {
        const ast = (0, parser_1.parse)('{ a }', { noLocation: true });
        (0, chai_1.expect)(() => (0, visitor_1.visit)(ast, {})).to.not.throw();
    });
    (0, mocha_1.it)('validates path argument', () => {
        const visited = [];
        const ast = (0, parser_1.parse)('{ a }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            enter(_node, _key, _parent, path) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', path.slice()]);
            },
            leave(_node, _key, _parent, path) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['leave', path.slice()]);
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', []],
            ['enter', ['definitions', 0]],
            ['enter', ['definitions', 0, 'selectionSet']],
            ['enter', ['definitions', 0, 'selectionSet', 'selections', 0]],
            ['enter', ['definitions', 0, 'selectionSet', 'selections', 0, 'name']],
            ['leave', ['definitions', 0, 'selectionSet', 'selections', 0, 'name']],
            ['leave', ['definitions', 0, 'selectionSet', 'selections', 0]],
            ['leave', ['definitions', 0, 'selectionSet']],
            ['leave', ['definitions', 0]],
            ['leave', []],
        ]);
    });
    (0, mocha_1.it)('validates ancestors argument', () => {
        const ast = (0, parser_1.parse)('{ a }', { noLocation: true });
        const visitedNodes = [];
        (0, visitor_1.visit)(ast, {
            enter(node, key, parent, _path, ancestors) {
                const inArray = typeof key === 'number';
                if (inArray) {
                    visitedNodes.push(parent);
                }
                visitedNodes.push(node);
                const expectedAncestors = visitedNodes.slice(0, -2);
                (0, chai_1.expect)(ancestors).to.deep.equal(expectedAncestors);
            },
            leave(_node, key, _parent, _path, ancestors) {
                const expectedAncestors = visitedNodes.slice(0, -2);
                (0, chai_1.expect)(ancestors).to.deep.equal(expectedAncestors);
                const inArray = typeof key === 'number';
                if (inArray) {
                    visitedNodes.pop();
                }
                visitedNodes.pop();
            },
        });
    });
    (0, mocha_1.it)('allows editing a node both on enter and on leave', () => {
        const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
        let selectionSet;
        const editedAST = (0, visitor_1.visit)(ast, {
            OperationDefinition: {
                enter(node) {
                    checkVisitorFnArgs(ast, arguments);
                    selectionSet = node.selectionSet;
                    return {
                        ...node,
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [],
                        },
                        didEnter: true,
                    };
                },
                leave(node) {
                    checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                    return {
                        ...node,
                        selectionSet,
                        didLeave: true,
                    };
                },
            },
        });
        (0, chai_1.expect)(editedAST).to.deep.equal({
            ...ast,
            definitions: [
                {
                    ...ast.definitions[0],
                    didEnter: true,
                    didLeave: true,
                },
            ],
        });
    });
    (0, mocha_1.it)('allows editing the root node on enter and on leave', () => {
        const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
        const { definitions } = ast;
        const editedAST = (0, visitor_1.visit)(ast, {
            Document: {
                enter(node) {
                    checkVisitorFnArgs(ast, arguments);
                    return {
                        ...node,
                        definitions: [],
                        didEnter: true,
                    };
                },
                leave(node) {
                    checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                    return {
                        ...node,
                        definitions,
                        didLeave: true,
                    };
                },
            },
        });
        (0, chai_1.expect)(editedAST).to.deep.equal({
            ...ast,
            didEnter: true,
            didLeave: true,
        });
    });
    (0, mocha_1.it)('allows for editing on enter', () => {
        const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
        const editedAST = (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments);
                if (node.kind === 'Field' && node.name.value === 'b') {
                    return null;
                }
            },
        });
        (0, chai_1.expect)(ast).to.deep.equal((0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true }));
        (0, chai_1.expect)(editedAST).to.deep.equal((0, parser_1.parse)('{ a,    c { a,    c } }', { noLocation: true }));
    });
    (0, mocha_1.it)('allows for editing on leave', () => {
        const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
        const editedAST = (0, visitor_1.visit)(ast, {
            leave(node) {
                checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                if (node.kind === 'Field' && node.name.value === 'b') {
                    return null;
                }
            },
        });
        (0, chai_1.expect)(ast).to.deep.equal((0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true }));
        (0, chai_1.expect)(editedAST).to.deep.equal((0, parser_1.parse)('{ a,    c { a,    c } }', { noLocation: true }));
    });
    (0, mocha_1.it)('ignores false returned on leave', () => {
        const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
        const returnedAST = (0, visitor_1.visit)(ast, {
            leave() {
                return false;
            },
        });
        (0, chai_1.expect)(returnedAST).to.deep.equal((0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true }));
    });
    (0, mocha_1.it)('visits edited node', () => {
        const addedField = {
            kind: 'Field',
            name: {
                kind: 'Name',
                value: '__typename',
            },
        };
        let didVisitAddedField;
        const ast = (0, parser_1.parse)('{ a { x } }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                if (node.kind === 'Field' && node.name.value === 'a') {
                    return {
                        kind: 'Field',
                        selectionSet: [addedField, node.selectionSet],
                    };
                }
                if (node === addedField) {
                    didVisitAddedField = true;
                }
            },
        });
        (0, chai_1.expect)(didVisitAddedField).to.equal(true);
    });
    (0, mocha_1.it)('allows skipping a sub-tree', () => {
        const visited = [];
        const ast = (0, parser_1.parse)('{ a, b { x }, c }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', node.kind, getValue(node)]);
                if (node.kind === 'Field' && node.name.value === 'b') {
                    return false;
                }
            },
            leave(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['leave', node.kind, getValue(node)]);
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined],
            ['enter', 'OperationDefinition', undefined],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'a'],
            ['leave', 'Name', 'a'],
            ['leave', 'Field', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'c'],
            ['leave', 'Name', 'c'],
            ['leave', 'Field', undefined],
            ['leave', 'SelectionSet', undefined],
            ['leave', 'OperationDefinition', undefined],
            ['leave', 'Document', undefined],
        ]);
    });
    (0, mocha_1.it)('allows early exit while visiting', () => {
        const visited = [];
        const ast = (0, parser_1.parse)('{ a, b { x }, c }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', node.kind, getValue(node)]);
                if (node.kind === 'Name' && node.value === 'x') {
                    return visitor_1.BREAK;
                }
            },
            leave(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['leave', node.kind, getValue(node)]);
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined],
            ['enter', 'OperationDefinition', undefined],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'a'],
            ['leave', 'Name', 'a'],
            ['leave', 'Field', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'b'],
            ['leave', 'Name', 'b'],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'x'],
        ]);
    });
    (0, mocha_1.it)('allows early exit while leaving', () => {
        const visited = [];
        const ast = (0, parser_1.parse)('{ a, b { x }, c }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', node.kind, getValue(node)]);
            },
            leave(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['leave', node.kind, getValue(node)]);
                if (node.kind === 'Name' && node.value === 'x') {
                    return visitor_1.BREAK;
                }
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined],
            ['enter', 'OperationDefinition', undefined],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'a'],
            ['leave', 'Name', 'a'],
            ['leave', 'Field', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'b'],
            ['leave', 'Name', 'b'],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'x'],
            ['leave', 'Name', 'x'],
        ]);
    });
    (0, mocha_1.it)('allows a named functions visitor API', () => {
        const visited = [];
        const ast = (0, parser_1.parse)('{ a, b { x }, c }', { noLocation: true });
        (0, visitor_1.visit)(ast, {
            Name(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', node.kind, getValue(node)]);
            },
            SelectionSet: {
                enter(node) {
                    checkVisitorFnArgs(ast, arguments);
                    visited.push(['enter', node.kind, getValue(node)]);
                },
                leave(node) {
                    checkVisitorFnArgs(ast, arguments);
                    visited.push(['leave', node.kind, getValue(node)]);
                },
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Name', 'a'],
            ['enter', 'Name', 'b'],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Name', 'x'],
            ['leave', 'SelectionSet', undefined],
            ['enter', 'Name', 'c'],
            ['leave', 'SelectionSet', undefined],
        ]);
    });
    (0, mocha_1.it)('visits only the specified `Kind` in visitorKeyMap', () => {
        const visited = [];
        const visitorKeyMap = {
            Document: ['definitions'],
            OperationDefinition: ['name'],
        };
        const visitor = {
            enter(node) {
                visited.push(['enter', node.kind, getValue(node)]);
            },
            leave(node) {
                visited.push(['leave', node.kind, getValue(node)]);
            },
        };
        const exampleDocumentAST = (0, parser_1.parse)(`
      query ExampleOperation {
        someField
      }
    `);
        (0, visitor_1.visit)(exampleDocumentAST, visitor, visitorKeyMap);
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined],
            ['enter', 'OperationDefinition', undefined],
            ['enter', 'Name', 'ExampleOperation'],
            ['leave', 'Name', 'ExampleOperation'],
            ['leave', 'OperationDefinition', undefined],
            ['leave', 'Document', undefined],
        ]);
    });
    (0, mocha_1.it)('Legacy: visits variables defined in fragments', () => {
        const ast = (0, parser_1.parse)('fragment a($v: Boolean = false) on t { f }', {
            noLocation: true,
            allowLegacyFragmentVariables: true,
        });
        const visited = [];
        (0, visitor_1.visit)(ast, {
            enter(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['enter', node.kind, getValue(node)]);
            },
            leave(node) {
                checkVisitorFnArgs(ast, arguments);
                visited.push(['leave', node.kind, getValue(node)]);
            },
        });
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined],
            ['enter', 'FragmentDefinition', undefined],
            ['enter', 'Name', 'a'],
            ['leave', 'Name', 'a'],
            ['enter', 'VariableDefinition', undefined],
            ['enter', 'Variable', undefined],
            ['enter', 'Name', 'v'],
            ['leave', 'Name', 'v'],
            ['leave', 'Variable', undefined],
            ['enter', 'NamedType', undefined],
            ['enter', 'Name', 'Boolean'],
            ['leave', 'Name', 'Boolean'],
            ['leave', 'NamedType', undefined],
            ['enter', 'BooleanValue', false],
            ['leave', 'BooleanValue', false],
            ['leave', 'VariableDefinition', undefined],
            ['enter', 'NamedType', undefined],
            ['enter', 'Name', 't'],
            ['leave', 'Name', 't'],
            ['leave', 'NamedType', undefined],
            ['enter', 'SelectionSet', undefined],
            ['enter', 'Field', undefined],
            ['enter', 'Name', 'f'],
            ['leave', 'Name', 'f'],
            ['leave', 'Field', undefined],
            ['leave', 'SelectionSet', undefined],
            ['leave', 'FragmentDefinition', undefined],
            ['leave', 'Document', undefined],
        ]);
    });
    (0, mocha_1.it)('visits kitchen sink', () => {
        const ast = (0, parser_1.parse)(kitchenSinkQuery_1.kitchenSinkQuery);
        const visited = [];
        const argsStack = [];
        (0, visitor_1.visit)(ast, {
            enter(node, key, parent) {
                visited.push([
                    'enter',
                    node.kind,
                    key,
                    (0, ast_1.isNode)(parent) ? parent.kind : undefined,
                ]);
                checkVisitorFnArgs(ast, arguments);
                argsStack.push([...arguments]);
            },
            leave(node, key, parent) {
                visited.push([
                    'leave',
                    node.kind,
                    key,
                    (0, ast_1.isNode)(parent) ? parent.kind : undefined,
                ]);
                (0, chai_1.expect)(argsStack.pop()).to.deep.equal([...arguments]);
            },
        });
        (0, chai_1.expect)(argsStack).to.deep.equal([]);
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', undefined, undefined],
            ['enter', 'OperationDefinition', 0, undefined],
            ['enter', 'Name', 'name', 'OperationDefinition'],
            ['leave', 'Name', 'name', 'OperationDefinition'],
            ['enter', 'VariableDefinition', 0, undefined],
            ['enter', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'NamedType', 'type', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'NamedType'],
            ['leave', 'Name', 'name', 'NamedType'],
            ['leave', 'NamedType', 'type', 'VariableDefinition'],
            ['leave', 'VariableDefinition', 0, undefined],
            ['enter', 'VariableDefinition', 1, undefined],
            ['enter', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'NamedType', 'type', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'NamedType'],
            ['leave', 'Name', 'name', 'NamedType'],
            ['leave', 'NamedType', 'type', 'VariableDefinition'],
            ['enter', 'EnumValue', 'defaultValue', 'VariableDefinition'],
            ['leave', 'EnumValue', 'defaultValue', 'VariableDefinition'],
            ['leave', 'VariableDefinition', 1, undefined],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'alias', 'Field'],
            ['leave', 'Name', 'alias', 'Field'],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'ListValue', 'value', 'Argument'],
            ['enter', 'IntValue', 0, undefined],
            ['leave', 'IntValue', 0, undefined],
            ['enter', 'IntValue', 1, undefined],
            ['leave', 'IntValue', 1, undefined],
            ['leave', 'ListValue', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['enter', 'InlineFragment', 1, undefined],
            ['enter', 'NamedType', 'typeCondition', 'InlineFragment'],
            ['enter', 'Name', 'name', 'NamedType'],
            ['leave', 'Name', 'name', 'NamedType'],
            ['leave', 'NamedType', 'typeCondition', 'InlineFragment'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['enter', 'Field', 1, undefined],
            ['enter', 'Name', 'alias', 'Field'],
            ['leave', 'Name', 'alias', 'Field'],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'IntValue', 'value', 'Argument'],
            ['leave', 'IntValue', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'Argument', 1, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 1, undefined],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['enter', 'FragmentSpread', 1, undefined],
            ['enter', 'Name', 'name', 'FragmentSpread'],
            ['leave', 'Name', 'name', 'FragmentSpread'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['leave', 'FragmentSpread', 1, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 1, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['leave', 'InlineFragment', 1, undefined],
            ['enter', 'InlineFragment', 2, undefined],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['leave', 'InlineFragment', 2, undefined],
            ['enter', 'InlineFragment', 3, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'InlineFragment'],
            ['leave', 'InlineFragment', 3, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['leave', 'OperationDefinition', 0, undefined],
            ['enter', 'OperationDefinition', 1, undefined],
            ['enter', 'Name', 'name', 'OperationDefinition'],
            ['leave', 'Name', 'name', 'OperationDefinition'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'IntValue', 'value', 'Argument'],
            ['leave', 'IntValue', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['leave', 'OperationDefinition', 1, undefined],
            ['enter', 'OperationDefinition', 2, undefined],
            ['enter', 'Name', 'name', 'OperationDefinition'],
            ['leave', 'Name', 'name', 'OperationDefinition'],
            ['enter', 'VariableDefinition', 0, undefined],
            ['enter', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'variable', 'VariableDefinition'],
            ['enter', 'NamedType', 'type', 'VariableDefinition'],
            ['enter', 'Name', 'name', 'NamedType'],
            ['leave', 'Name', 'name', 'NamedType'],
            ['leave', 'NamedType', 'type', 'VariableDefinition'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['leave', 'VariableDefinition', 0, undefined],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['enter', 'Field', 1, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'SelectionSet', 'selectionSet', 'Field'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 1, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['leave', 'OperationDefinition', 2, undefined],
            ['enter', 'FragmentDefinition', 3, undefined],
            ['enter', 'Name', 'name', 'FragmentDefinition'],
            ['leave', 'Name', 'name', 'FragmentDefinition'],
            ['enter', 'NamedType', 'typeCondition', 'FragmentDefinition'],
            ['enter', 'Name', 'name', 'NamedType'],
            ['leave', 'Name', 'name', 'NamedType'],
            ['leave', 'NamedType', 'typeCondition', 'FragmentDefinition'],
            ['enter', 'Directive', 0, undefined],
            ['enter', 'Name', 'name', 'Directive'],
            ['leave', 'Name', 'name', 'Directive'],
            ['leave', 'Directive', 0, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'FragmentDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'Argument', 1, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'Variable', 'value', 'Argument'],
            ['enter', 'Name', 'name', 'Variable'],
            ['leave', 'Name', 'name', 'Variable'],
            ['leave', 'Variable', 'value', 'Argument'],
            ['leave', 'Argument', 1, undefined],
            ['enter', 'Argument', 2, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'ObjectValue', 'value', 'Argument'],
            ['enter', 'ObjectField', 0, undefined],
            ['enter', 'Name', 'name', 'ObjectField'],
            ['leave', 'Name', 'name', 'ObjectField'],
            ['enter', 'StringValue', 'value', 'ObjectField'],
            ['leave', 'StringValue', 'value', 'ObjectField'],
            ['leave', 'ObjectField', 0, undefined],
            ['enter', 'ObjectField', 1, undefined],
            ['enter', 'Name', 'name', 'ObjectField'],
            ['leave', 'Name', 'name', 'ObjectField'],
            ['enter', 'StringValue', 'value', 'ObjectField'],
            ['leave', 'StringValue', 'value', 'ObjectField'],
            ['leave', 'ObjectField', 1, undefined],
            ['leave', 'ObjectValue', 'value', 'Argument'],
            ['leave', 'Argument', 2, undefined],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'FragmentDefinition'],
            ['leave', 'FragmentDefinition', 3, undefined],
            ['enter', 'OperationDefinition', 4, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['enter', 'Argument', 0, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'BooleanValue', 'value', 'Argument'],
            ['leave', 'BooleanValue', 'value', 'Argument'],
            ['leave', 'Argument', 0, undefined],
            ['enter', 'Argument', 1, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'BooleanValue', 'value', 'Argument'],
            ['leave', 'BooleanValue', 'value', 'Argument'],
            ['leave', 'Argument', 1, undefined],
            ['enter', 'Argument', 2, undefined],
            ['enter', 'Name', 'name', 'Argument'],
            ['leave', 'Name', 'name', 'Argument'],
            ['enter', 'NullValue', 'value', 'Argument'],
            ['leave', 'NullValue', 'value', 'Argument'],
            ['leave', 'Argument', 2, undefined],
            ['leave', 'Field', 0, undefined],
            ['enter', 'Field', 1, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 1, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['leave', 'OperationDefinition', 4, undefined],
            ['enter', 'OperationDefinition', 5, undefined],
            ['enter', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['enter', 'Field', 0, undefined],
            ['enter', 'Name', 'name', 'Field'],
            ['leave', 'Name', 'name', 'Field'],
            ['leave', 'Field', 0, undefined],
            ['leave', 'SelectionSet', 'selectionSet', 'OperationDefinition'],
            ['leave', 'OperationDefinition', 5, undefined],
            ['leave', 'Document', undefined, undefined],
        ]);
    });
    (0, mocha_1.describe)('visitInParallel', () => {
        // Note: nearly identical to the above test of the same test but
        // using visitInParallel.
        (0, mocha_1.it)('allows skipping a sub-tree', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a, b { x }, c }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['enter', node.kind, getValue(node)]);
                        if (node.kind === 'Field' && node.name.value === 'b') {
                            return false;
                        }
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['enter', 'Document', undefined],
                ['enter', 'OperationDefinition', undefined],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'c'],
                ['leave', 'Name', 'c'],
                ['leave', 'Field', undefined],
                ['leave', 'SelectionSet', undefined],
                ['leave', 'OperationDefinition', undefined],
                ['leave', 'Document', undefined],
            ]);
        });
        (0, mocha_1.it)('allows skipping different sub-trees', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a { x }, b { y} }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['no-a', 'enter', node.kind, getValue(node)]);
                        if (node.kind === 'Field' && node.name.value === 'a') {
                            return false;
                        }
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['no-a', 'leave', node.kind, getValue(node)]);
                    },
                },
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['no-b', 'enter', node.kind, getValue(node)]);
                        if (node.kind === 'Field' && node.name.value === 'b') {
                            return false;
                        }
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['no-b', 'leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['no-a', 'enter', 'Document', undefined],
                ['no-b', 'enter', 'Document', undefined],
                ['no-a', 'enter', 'OperationDefinition', undefined],
                ['no-b', 'enter', 'OperationDefinition', undefined],
                ['no-a', 'enter', 'SelectionSet', undefined],
                ['no-b', 'enter', 'SelectionSet', undefined],
                ['no-a', 'enter', 'Field', undefined],
                ['no-b', 'enter', 'Field', undefined],
                ['no-b', 'enter', 'Name', 'a'],
                ['no-b', 'leave', 'Name', 'a'],
                ['no-b', 'enter', 'SelectionSet', undefined],
                ['no-b', 'enter', 'Field', undefined],
                ['no-b', 'enter', 'Name', 'x'],
                ['no-b', 'leave', 'Name', 'x'],
                ['no-b', 'leave', 'Field', undefined],
                ['no-b', 'leave', 'SelectionSet', undefined],
                ['no-b', 'leave', 'Field', undefined],
                ['no-a', 'enter', 'Field', undefined],
                ['no-b', 'enter', 'Field', undefined],
                ['no-a', 'enter', 'Name', 'b'],
                ['no-a', 'leave', 'Name', 'b'],
                ['no-a', 'enter', 'SelectionSet', undefined],
                ['no-a', 'enter', 'Field', undefined],
                ['no-a', 'enter', 'Name', 'y'],
                ['no-a', 'leave', 'Name', 'y'],
                ['no-a', 'leave', 'Field', undefined],
                ['no-a', 'leave', 'SelectionSet', undefined],
                ['no-a', 'leave', 'Field', undefined],
                ['no-a', 'leave', 'SelectionSet', undefined],
                ['no-b', 'leave', 'SelectionSet', undefined],
                ['no-a', 'leave', 'OperationDefinition', undefined],
                ['no-b', 'leave', 'OperationDefinition', undefined],
                ['no-a', 'leave', 'Document', undefined],
                ['no-b', 'leave', 'Document', undefined],
            ]);
        });
        // Note: nearly identical to the above test of the same test but
        // using visitInParallel.
        (0, mocha_1.it)('allows early exit while visiting', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a, b { x }, c }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['enter', node.kind, getValue(node)]);
                        if (node.kind === 'Name' && node.value === 'x') {
                            return visitor_1.BREAK;
                        }
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['enter', 'Document', undefined],
                ['enter', 'OperationDefinition', undefined],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'b'],
                ['leave', 'Name', 'b'],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'x'],
            ]);
        });
        (0, mocha_1.it)('allows early exit from different points', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a { y }, b { x } }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-a', 'enter', node.kind, getValue(node)]);
                        if (node.kind === 'Name' && node.value === 'a') {
                            return visitor_1.BREAK;
                        }
                    },
                    /* c8 ignore next 3 */
                    leave() {
                        chai_1.expect.fail('Should not be called');
                    },
                },
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-b', 'enter', node.kind, getValue(node)]);
                        if (node.kind === 'Name' && node.value === 'b') {
                            return visitor_1.BREAK;
                        }
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-b', 'leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['break-a', 'enter', 'Document', undefined],
                ['break-b', 'enter', 'Document', undefined],
                ['break-a', 'enter', 'OperationDefinition', undefined],
                ['break-b', 'enter', 'OperationDefinition', undefined],
                ['break-a', 'enter', 'SelectionSet', undefined],
                ['break-b', 'enter', 'SelectionSet', undefined],
                ['break-a', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-a', 'enter', 'Name', 'a'],
                ['break-b', 'enter', 'Name', 'a'],
                ['break-b', 'leave', 'Name', 'a'],
                ['break-b', 'enter', 'SelectionSet', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Name', 'y'],
                ['break-b', 'leave', 'Name', 'y'],
                ['break-b', 'leave', 'Field', undefined],
                ['break-b', 'leave', 'SelectionSet', undefined],
                ['break-b', 'leave', 'Field', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Name', 'b'],
            ]);
        });
        // Note: nearly identical to the above test of the same test but
        // using visitInParallel.
        (0, mocha_1.it)('allows early exit while leaving', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a, b { x }, c }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['enter', node.kind, getValue(node)]);
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['leave', node.kind, getValue(node)]);
                        if (node.kind === 'Name' && node.value === 'x') {
                            return visitor_1.BREAK;
                        }
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['enter', 'Document', undefined],
                ['enter', 'OperationDefinition', undefined],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'b'],
                ['leave', 'Name', 'b'],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'x'],
                ['leave', 'Name', 'x'],
            ]);
        });
        (0, mocha_1.it)('allows early exit from leaving different points', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a { y }, b { x } }');
            (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-a', 'enter', node.kind, getValue(node)]);
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-a', 'leave', node.kind, getValue(node)]);
                        if (node.kind === 'Field' && node.name.value === 'a') {
                            return visitor_1.BREAK;
                        }
                    },
                },
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-b', 'enter', node.kind, getValue(node)]);
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['break-b', 'leave', node.kind, getValue(node)]);
                        if (node.kind === 'Field' && node.name.value === 'b') {
                            return visitor_1.BREAK;
                        }
                    },
                },
            ]));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['break-a', 'enter', 'Document', undefined],
                ['break-b', 'enter', 'Document', undefined],
                ['break-a', 'enter', 'OperationDefinition', undefined],
                ['break-b', 'enter', 'OperationDefinition', undefined],
                ['break-a', 'enter', 'SelectionSet', undefined],
                ['break-b', 'enter', 'SelectionSet', undefined],
                ['break-a', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-a', 'enter', 'Name', 'a'],
                ['break-b', 'enter', 'Name', 'a'],
                ['break-a', 'leave', 'Name', 'a'],
                ['break-b', 'leave', 'Name', 'a'],
                ['break-a', 'enter', 'SelectionSet', undefined],
                ['break-b', 'enter', 'SelectionSet', undefined],
                ['break-a', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-a', 'enter', 'Name', 'y'],
                ['break-b', 'enter', 'Name', 'y'],
                ['break-a', 'leave', 'Name', 'y'],
                ['break-b', 'leave', 'Name', 'y'],
                ['break-a', 'leave', 'Field', undefined],
                ['break-b', 'leave', 'Field', undefined],
                ['break-a', 'leave', 'SelectionSet', undefined],
                ['break-b', 'leave', 'SelectionSet', undefined],
                ['break-a', 'leave', 'Field', undefined],
                ['break-b', 'leave', 'Field', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Name', 'b'],
                ['break-b', 'leave', 'Name', 'b'],
                ['break-b', 'enter', 'SelectionSet', undefined],
                ['break-b', 'enter', 'Field', undefined],
                ['break-b', 'enter', 'Name', 'x'],
                ['break-b', 'leave', 'Name', 'x'],
                ['break-b', 'leave', 'Field', undefined],
                ['break-b', 'leave', 'SelectionSet', undefined],
                ['break-b', 'leave', 'Field', undefined],
            ]);
        });
        (0, mocha_1.it)('allows for editing on enter', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
            const editedAST = (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        if (node.kind === 'Field' && node.name.value === 'b') {
                            return null;
                        }
                    },
                },
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['enter', node.kind, getValue(node)]);
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                        visited.push(['leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(ast).to.deep.equal((0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true }));
            (0, chai_1.expect)(editedAST).to.deep.equal((0, parser_1.parse)('{ a,    c { a,    c } }', { noLocation: true }));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['enter', 'Document', undefined],
                ['enter', 'OperationDefinition', undefined],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'c'],
                ['leave', 'Name', 'c'],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'c'],
                ['leave', 'Name', 'c'],
                ['leave', 'Field', undefined],
                ['leave', 'SelectionSet', undefined],
                ['leave', 'Field', undefined],
                ['leave', 'SelectionSet', undefined],
                ['leave', 'OperationDefinition', undefined],
                ['leave', 'Document', undefined],
            ]);
        });
        (0, mocha_1.it)('allows for editing on leave', () => {
            const visited = [];
            const ast = (0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true });
            const editedAST = (0, visitor_1.visit)(ast, (0, visitor_1.visitInParallel)([
                {
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                        if (node.kind === 'Field' && node.name.value === 'b') {
                            return null;
                        }
                    },
                },
                {
                    enter(node) {
                        checkVisitorFnArgs(ast, arguments);
                        visited.push(['enter', node.kind, getValue(node)]);
                    },
                    leave(node) {
                        checkVisitorFnArgs(ast, arguments, /* isEdited */ true);
                        visited.push(['leave', node.kind, getValue(node)]);
                    },
                },
            ]));
            (0, chai_1.expect)(ast).to.deep.equal((0, parser_1.parse)('{ a, b, c { a, b, c } }', { noLocation: true }));
            (0, chai_1.expect)(editedAST).to.deep.equal((0, parser_1.parse)('{ a,    c { a,    c } }', { noLocation: true }));
            (0, chai_1.expect)(visited).to.deep.equal([
                ['enter', 'Document', undefined],
                ['enter', 'OperationDefinition', undefined],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'b'],
                ['leave', 'Name', 'b'],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'c'],
                ['leave', 'Name', 'c'],
                ['enter', 'SelectionSet', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'a'],
                ['leave', 'Name', 'a'],
                ['leave', 'Field', undefined],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'b'],
                ['leave', 'Name', 'b'],
                ['enter', 'Field', undefined],
                ['enter', 'Name', 'c'],
                ['leave', 'Name', 'c'],
                ['leave', 'Field', undefined],
                ['leave', 'SelectionSet', undefined],
                ['leave', 'Field', undefined],
                ['leave', 'SelectionSet', undefined],
                ['leave', 'OperationDefinition', undefined],
                ['leave', 'Document', undefined],
            ]);
        });
    });
});
//# sourceMappingURL=visitor-test.js.map