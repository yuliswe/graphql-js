"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const kinds_1 = require("../kinds");
const parser_1 = require("../parser");
const predicates_1 = require("../predicates");
function filterNodes(predicate) {
    return Object.values(kinds_1.Kind).filter(
    // @ts-expect-error create node only with kind
    (kind) => predicate({ kind }));
}
(0, mocha_1.describe)('AST node predicates', () => {
    (0, mocha_1.it)('isDefinitionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isDefinitionNode)).to.deep.equal([
            'OperationDefinition',
            'FragmentDefinition',
            'SchemaDefinition',
            'ScalarTypeDefinition',
            'ObjectTypeDefinition',
            'InterfaceTypeDefinition',
            'UnionTypeDefinition',
            'EnumTypeDefinition',
            'InputObjectTypeDefinition',
            'DirectiveDefinition',
            'SchemaExtension',
            'ScalarTypeExtension',
            'ObjectTypeExtension',
            'InterfaceTypeExtension',
            'UnionTypeExtension',
            'EnumTypeExtension',
            'InputObjectTypeExtension',
        ]);
    });
    (0, mocha_1.it)('isExecutableDefinitionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isExecutableDefinitionNode)).to.deep.equal([
            'OperationDefinition',
            'FragmentDefinition',
        ]);
    });
    (0, mocha_1.it)('isSelectionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isSelectionNode)).to.deep.equal([
            'Field',
            'FragmentSpread',
            'InlineFragment',
        ]);
    });
    (0, mocha_1.it)('isValueNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isValueNode)).to.deep.equal([
            'Variable',
            'IntValue',
            'FloatValue',
            'StringValue',
            'BooleanValue',
            'NullValue',
            'EnumValue',
            'ListValue',
            'ObjectValue',
        ]);
    });
    (0, mocha_1.it)('isConstValueNode', () => {
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('"value"'))).to.equal(true);
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('$var'))).to.equal(false);
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('{ field: "value" }'))).to.equal(true);
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('{ field: $var }'))).to.equal(false);
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('[ "value" ]'))).to.equal(true);
        (0, chai_1.expect)((0, predicates_1.isConstValueNode)((0, parser_1.parseValue)('[ $var ]'))).to.equal(false);
    });
    (0, mocha_1.it)('isTypeNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isTypeNode)).to.deep.equal([
            'NamedType',
            'ListType',
            'NonNullType',
        ]);
    });
    (0, mocha_1.it)('isTypeSystemDefinitionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isTypeSystemDefinitionNode)).to.deep.equal([
            'SchemaDefinition',
            'ScalarTypeDefinition',
            'ObjectTypeDefinition',
            'InterfaceTypeDefinition',
            'UnionTypeDefinition',
            'EnumTypeDefinition',
            'InputObjectTypeDefinition',
            'DirectiveDefinition',
        ]);
    });
    (0, mocha_1.it)('isTypeDefinitionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isTypeDefinitionNode)).to.deep.equal([
            'ScalarTypeDefinition',
            'ObjectTypeDefinition',
            'InterfaceTypeDefinition',
            'UnionTypeDefinition',
            'EnumTypeDefinition',
            'InputObjectTypeDefinition',
        ]);
    });
    (0, mocha_1.it)('isTypeSystemExtensionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isTypeSystemExtensionNode)).to.deep.equal([
            'SchemaExtension',
            'ScalarTypeExtension',
            'ObjectTypeExtension',
            'InterfaceTypeExtension',
            'UnionTypeExtension',
            'EnumTypeExtension',
            'InputObjectTypeExtension',
        ]);
    });
    (0, mocha_1.it)('isTypeExtensionNode', () => {
        (0, chai_1.expect)(filterNodes(predicates_1.isTypeExtensionNode)).to.deep.equal([
            'ScalarTypeExtension',
            'ObjectTypeExtension',
            'InterfaceTypeExtension',
            'UnionTypeExtension',
            'EnumTypeExtension',
            'InputObjectTypeExtension',
        ]);
    });
});
//# sourceMappingURL=predicates-test.js.map