"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const invariant_1 = require("../../jsutils/invariant");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const visitor_1 = require("../../language/visitor");
const definition_1 = require("../../type/definition");
const schema_1 = require("../../type/schema");
const buildASTSchema_1 = require("../buildASTSchema");
const TypeInfo_1 = require("../TypeInfo");
const testSchema = (0, buildASTSchema_1.buildSchema)(`
  interface Pet {
    name: String
  }

  type Dog implements Pet {
    name: String
  }

  type Cat implements Pet {
    name: String
  }

  type Human {
    name: String
    pets: [Pet]
  }

  type Alien {
    name(surname: Boolean): String
  }

  type QueryRoot {
    human(id: ID): Human
    alien: Alien
  }

  schema {
    query: QueryRoot
  }
`);
(0, mocha_1.describe)('TypeInfo', () => {
    const schema = new schema_1.GraphQLSchema({});
    (0, mocha_1.it)('can be Object.toStringified', () => {
        const typeInfo = new TypeInfo_1.TypeInfo(schema);
        (0, chai_1.expect)(Object.prototype.toString.call(typeInfo)).to.equal('[object TypeInfo]');
    });
    (0, mocha_1.it)('allow all methods to be called before entering any node', () => {
        const typeInfo = new TypeInfo_1.TypeInfo(schema);
        (0, chai_1.expect)(typeInfo.getType()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getParentType()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getInputType()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getParentInputType()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getFieldDef()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getDefaultValue()).to.equal(undefined);
        (0, chai_1.expect)(typeInfo.getDirective()).to.equal(null);
        (0, chai_1.expect)(typeInfo.getArgument()).to.equal(null);
        (0, chai_1.expect)(typeInfo.getEnumValue()).to.equal(null);
    });
});
(0, mocha_1.describe)('visitWithTypeInfo', () => {
    (0, mocha_1.it)('supports different operation types', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      schema {
        query: QueryRoot
        mutation: MutationRoot
        subscription: SubscriptionRoot
      }

      type QueryRoot {
        foo: String
      }

      type MutationRoot {
        bar: String
      }

      type SubscriptionRoot {
        baz: String
      }
    `);
        const ast = (0, parser_1.parse)(`
      query { foo }
      mutation { bar }
      subscription { baz }
    `);
        const typeInfo = new TypeInfo_1.TypeInfo(schema);
        const rootTypes = {};
        (0, visitor_1.visit)(ast, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            OperationDefinition(node) {
                rootTypes[node.operation] = String(typeInfo.getType());
            },
        }));
        (0, chai_1.expect)(rootTypes).to.deep.equal({
            query: 'QueryRoot',
            mutation: 'MutationRoot',
            subscription: 'SubscriptionRoot',
        });
    });
    (0, mocha_1.it)('provide exact same arguments to wrapped visitor', () => {
        const ast = (0, parser_1.parse)('{ human(id: 4) { name, pets { ... { name } }, unknown } }');
        const visitorArgs = [];
        (0, visitor_1.visit)(ast, {
            enter(...args) {
                visitorArgs.push(['enter', ...args]);
            },
            leave(...args) {
                visitorArgs.push(['leave', ...args]);
            },
        });
        const wrappedVisitorArgs = [];
        const typeInfo = new TypeInfo_1.TypeInfo(testSchema);
        (0, visitor_1.visit)(ast, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            enter(...args) {
                wrappedVisitorArgs.push(['enter', ...args]);
            },
            leave(...args) {
                wrappedVisitorArgs.push(['leave', ...args]);
            },
        }));
        (0, chai_1.expect)(visitorArgs).to.deep.equal(wrappedVisitorArgs);
    });
    (0, mocha_1.it)('maintains type info during visit', () => {
        const visited = [];
        const typeInfo = new TypeInfo_1.TypeInfo(testSchema);
        const ast = (0, parser_1.parse)('{ human(id: 4) { name, pets { ... { name } }, unknown } }');
        (0, visitor_1.visit)(ast, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            enter(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                const inputType = typeInfo.getInputType();
                visited.push([
                    'enter',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    parentType ? String(parentType) : null,
                    type ? String(type) : null,
                    inputType ? String(inputType) : null,
                ]);
            },
            leave(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                const inputType = typeInfo.getInputType();
                visited.push([
                    'leave',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    parentType ? String(parentType) : null,
                    type ? String(type) : null,
                    inputType ? String(inputType) : null,
                ]);
            },
        }));
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', null, null, null, null],
            ['enter', 'OperationDefinition', null, null, 'QueryRoot', null],
            ['enter', 'SelectionSet', null, 'QueryRoot', 'QueryRoot', null],
            ['enter', 'Field', null, 'QueryRoot', 'Human', null],
            ['enter', 'Name', 'human', 'QueryRoot', 'Human', null],
            ['leave', 'Name', 'human', 'QueryRoot', 'Human', null],
            ['enter', 'Argument', null, 'QueryRoot', 'Human', 'ID'],
            ['enter', 'Name', 'id', 'QueryRoot', 'Human', 'ID'],
            ['leave', 'Name', 'id', 'QueryRoot', 'Human', 'ID'],
            ['enter', 'IntValue', null, 'QueryRoot', 'Human', 'ID'],
            ['leave', 'IntValue', null, 'QueryRoot', 'Human', 'ID'],
            ['leave', 'Argument', null, 'QueryRoot', 'Human', 'ID'],
            ['enter', 'SelectionSet', null, 'Human', 'Human', null],
            ['enter', 'Field', null, 'Human', 'String', null],
            ['enter', 'Name', 'name', 'Human', 'String', null],
            ['leave', 'Name', 'name', 'Human', 'String', null],
            ['leave', 'Field', null, 'Human', 'String', null],
            ['enter', 'Field', null, 'Human', '[Pet]', null],
            ['enter', 'Name', 'pets', 'Human', '[Pet]', null],
            ['leave', 'Name', 'pets', 'Human', '[Pet]', null],
            ['enter', 'SelectionSet', null, 'Pet', '[Pet]', null],
            ['enter', 'InlineFragment', null, 'Pet', 'Pet', null],
            ['enter', 'SelectionSet', null, 'Pet', 'Pet', null],
            ['enter', 'Field', null, 'Pet', 'String', null],
            ['enter', 'Name', 'name', 'Pet', 'String', null],
            ['leave', 'Name', 'name', 'Pet', 'String', null],
            ['leave', 'Field', null, 'Pet', 'String', null],
            ['leave', 'SelectionSet', null, 'Pet', 'Pet', null],
            ['leave', 'InlineFragment', null, 'Pet', 'Pet', null],
            ['leave', 'SelectionSet', null, 'Pet', '[Pet]', null],
            ['leave', 'Field', null, 'Human', '[Pet]', null],
            ['enter', 'Field', null, 'Human', null, null],
            ['enter', 'Name', 'unknown', 'Human', null, null],
            ['leave', 'Name', 'unknown', 'Human', null, null],
            ['leave', 'Field', null, 'Human', null, null],
            ['leave', 'SelectionSet', null, 'Human', 'Human', null],
            ['leave', 'Field', null, 'QueryRoot', 'Human', null],
            ['leave', 'SelectionSet', null, 'QueryRoot', 'QueryRoot', null],
            ['leave', 'OperationDefinition', null, null, 'QueryRoot', null],
            ['leave', 'Document', null, null, null, null],
        ]);
    });
    (0, mocha_1.it)('maintains type info during edit', () => {
        const visited = [];
        const typeInfo = new TypeInfo_1.TypeInfo(testSchema);
        const ast = (0, parser_1.parse)('{ human(id: 4) { name, pets }, alien }');
        const editedAST = (0, visitor_1.visit)(ast, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            enter(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                const inputType = typeInfo.getInputType();
                visited.push([
                    'enter',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    parentType ? String(parentType) : null,
                    type ? String(type) : null,
                    inputType ? String(inputType) : null,
                ]);
                // Make a query valid by adding missing selection sets.
                if (node.kind === 'Field' &&
                    !node.selectionSet &&
                    (0, definition_1.isCompositeType)((0, definition_1.getNamedType)(type))) {
                    return {
                        ...node,
                        selectionSet: {
                            kind: 'SelectionSet',
                            selections: [
                                {
                                    kind: 'Field',
                                    name: { kind: 'Name', value: '__typename' },
                                },
                            ],
                        },
                    };
                }
            },
            leave(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                const inputType = typeInfo.getInputType();
                visited.push([
                    'leave',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    parentType ? String(parentType) : null,
                    type ? String(type) : null,
                    inputType ? String(inputType) : null,
                ]);
            },
        }));
        (0, chai_1.expect)((0, printer_1.print)(ast)).to.deep.equal((0, printer_1.print)((0, parser_1.parse)('{ human(id: 4) { name, pets }, alien }')));
        (0, chai_1.expect)((0, printer_1.print)(editedAST)).to.deep.equal((0, printer_1.print)((0, parser_1.parse)('{ human(id: 4) { name, pets { __typename } }, alien { __typename } }')));
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'Document', null, null, null, null],
            ['enter', 'OperationDefinition', null, null, 'QueryRoot', null],
            ['enter', 'SelectionSet', null, 'QueryRoot', 'QueryRoot', null],
            ['enter', 'Field', null, 'QueryRoot', 'Human', null],
            ['enter', 'Name', 'human', 'QueryRoot', 'Human', null],
            ['leave', 'Name', 'human', 'QueryRoot', 'Human', null],
            ['enter', 'Argument', null, 'QueryRoot', 'Human', 'ID'],
            ['enter', 'Name', 'id', 'QueryRoot', 'Human', 'ID'],
            ['leave', 'Name', 'id', 'QueryRoot', 'Human', 'ID'],
            ['enter', 'IntValue', null, 'QueryRoot', 'Human', 'ID'],
            ['leave', 'IntValue', null, 'QueryRoot', 'Human', 'ID'],
            ['leave', 'Argument', null, 'QueryRoot', 'Human', 'ID'],
            ['enter', 'SelectionSet', null, 'Human', 'Human', null],
            ['enter', 'Field', null, 'Human', 'String', null],
            ['enter', 'Name', 'name', 'Human', 'String', null],
            ['leave', 'Name', 'name', 'Human', 'String', null],
            ['leave', 'Field', null, 'Human', 'String', null],
            ['enter', 'Field', null, 'Human', '[Pet]', null],
            ['enter', 'Name', 'pets', 'Human', '[Pet]', null],
            ['leave', 'Name', 'pets', 'Human', '[Pet]', null],
            ['enter', 'SelectionSet', null, 'Pet', '[Pet]', null],
            ['enter', 'Field', null, 'Pet', 'String!', null],
            ['enter', 'Name', '__typename', 'Pet', 'String!', null],
            ['leave', 'Name', '__typename', 'Pet', 'String!', null],
            ['leave', 'Field', null, 'Pet', 'String!', null],
            ['leave', 'SelectionSet', null, 'Pet', '[Pet]', null],
            ['leave', 'Field', null, 'Human', '[Pet]', null],
            ['leave', 'SelectionSet', null, 'Human', 'Human', null],
            ['leave', 'Field', null, 'QueryRoot', 'Human', null],
            ['enter', 'Field', null, 'QueryRoot', 'Alien', null],
            ['enter', 'Name', 'alien', 'QueryRoot', 'Alien', null],
            ['leave', 'Name', 'alien', 'QueryRoot', 'Alien', null],
            ['enter', 'SelectionSet', null, 'Alien', 'Alien', null],
            ['enter', 'Field', null, 'Alien', 'String!', null],
            ['enter', 'Name', '__typename', 'Alien', 'String!', null],
            ['leave', 'Name', '__typename', 'Alien', 'String!', null],
            ['leave', 'Field', null, 'Alien', 'String!', null],
            ['leave', 'SelectionSet', null, 'Alien', 'Alien', null],
            ['leave', 'Field', null, 'QueryRoot', 'Alien', null],
            ['leave', 'SelectionSet', null, 'QueryRoot', 'QueryRoot', null],
            ['leave', 'OperationDefinition', null, null, 'QueryRoot', null],
            ['leave', 'Document', null, null, null, null],
        ]);
    });
    (0, mocha_1.it)('supports traversals of input values', () => {
        const schema = (0, buildASTSchema_1.buildSchema)(`
      input ComplexInput {
        stringListField: [String]
      }
    `);
        const ast = (0, parser_1.parseValue)('{ stringListField: ["foo"] }');
        const complexInputType = schema.getType('ComplexInput');
        (0, invariant_1.invariant)(complexInputType != null);
        const typeInfo = new TypeInfo_1.TypeInfo(schema, complexInputType);
        const visited = [];
        (0, visitor_1.visit)(ast, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            enter(node) {
                const type = typeInfo.getInputType();
                visited.push([
                    'enter',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    String(type),
                ]);
            },
            leave(node) {
                const type = typeInfo.getInputType();
                visited.push([
                    'leave',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    String(type),
                ]);
            },
        }));
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'ObjectValue', null, 'ComplexInput'],
            ['enter', 'ObjectField', null, '[String]'],
            ['enter', 'Name', 'stringListField', '[String]'],
            ['leave', 'Name', 'stringListField', '[String]'],
            ['enter', 'ListValue', null, 'String'],
            ['enter', 'StringValue', null, 'String'],
            ['leave', 'StringValue', null, 'String'],
            ['leave', 'ListValue', null, 'String'],
            ['leave', 'ObjectField', null, '[String]'],
            ['leave', 'ObjectValue', null, 'ComplexInput'],
        ]);
    });
    (0, mocha_1.it)('supports traversals of selection sets', () => {
        const humanType = testSchema.getType('Human');
        (0, invariant_1.invariant)(humanType != null);
        const typeInfo = new TypeInfo_1.TypeInfo(testSchema, humanType);
        const ast = (0, parser_1.parse)('{ name, pets { name } }');
        const operationNode = ast.definitions[0];
        (0, invariant_1.invariant)(operationNode.kind === 'OperationDefinition');
        const visited = [];
        (0, visitor_1.visit)(operationNode.selectionSet, (0, TypeInfo_1.visitWithTypeInfo)(typeInfo, {
            enter(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                visited.push([
                    'enter',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    String(parentType),
                    String(type),
                ]);
            },
            leave(node) {
                const parentType = typeInfo.getParentType();
                const type = typeInfo.getType();
                visited.push([
                    'leave',
                    node.kind,
                    node.kind === 'Name' ? node.value : null,
                    String(parentType),
                    String(type),
                ]);
            },
        }));
        (0, chai_1.expect)(visited).to.deep.equal([
            ['enter', 'SelectionSet', null, 'Human', 'Human'],
            ['enter', 'Field', null, 'Human', 'String'],
            ['enter', 'Name', 'name', 'Human', 'String'],
            ['leave', 'Name', 'name', 'Human', 'String'],
            ['leave', 'Field', null, 'Human', 'String'],
            ['enter', 'Field', null, 'Human', '[Pet]'],
            ['enter', 'Name', 'pets', 'Human', '[Pet]'],
            ['leave', 'Name', 'pets', 'Human', '[Pet]'],
            ['enter', 'SelectionSet', null, 'Pet', '[Pet]'],
            ['enter', 'Field', null, 'Pet', 'String'],
            ['enter', 'Name', 'name', 'Pet', 'String'],
            ['leave', 'Name', 'name', 'Pet', 'String'],
            ['leave', 'Field', null, 'Pet', 'String'],
            ['leave', 'SelectionSet', null, 'Pet', '[Pet]'],
            ['leave', 'Field', null, 'Human', '[Pet]'],
            ['leave', 'SelectionSet', null, 'Human', 'Human'],
        ]);
    });
});
//# sourceMappingURL=TypeInfo-test.js.map