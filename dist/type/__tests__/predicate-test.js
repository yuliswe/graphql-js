"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const directiveLocation_1 = require("../../language/directiveLocation");
const definition_1 = require("../definition");
const directives_1 = require("../directives");
const scalars_1 = require("../scalars");
const ObjectType = new definition_1.GraphQLObjectType({ name: 'Object', fields: {} });
const InterfaceType = new definition_1.GraphQLInterfaceType({
    name: 'Interface',
    fields: {},
});
const UnionType = new definition_1.GraphQLUnionType({ name: 'Union', types: [ObjectType] });
const EnumType = new definition_1.GraphQLEnumType({ name: 'Enum', values: { foo: {} } });
const InputObjectType = new definition_1.GraphQLInputObjectType({
    name: 'InputObject',
    fields: {},
});
const ScalarType = new definition_1.GraphQLScalarType({ name: 'Scalar' });
const Directive = new directives_1.GraphQLDirective({
    name: 'Directive',
    locations: [directiveLocation_1.DirectiveLocation.QUERY],
});
(0, mocha_1.describe)('Type predicates', () => {
    (0, mocha_1.describe)('isType', () => {
        (0, mocha_1.it)('returns true for unwrapped types', () => {
            (0, chai_1.expect)((0, definition_1.isType)(scalars_1.GraphQLString)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertType)(scalars_1.GraphQLString)).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isType)(ObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertType)(ObjectType)).to.not.throw();
        });
        (0, mocha_1.it)('returns true for wrapped types', () => {
            (0, chai_1.expect)((0, definition_1.isType)(new definition_1.GraphQLNonNull(scalars_1.GraphQLString))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertType)(new definition_1.GraphQLNonNull(scalars_1.GraphQLString))).to.not.throw();
        });
        (0, mocha_1.it)('returns false for type classes (rather than instances)', () => {
            (0, chai_1.expect)((0, definition_1.isType)(definition_1.GraphQLObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertType)(definition_1.GraphQLObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for random garbage', () => {
            (0, chai_1.expect)((0, definition_1.isType)({ what: 'is this' })).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertType)({ what: 'is this' })).to.throw();
        });
    });
    (0, mocha_1.describe)('isScalarType', () => {
        (0, mocha_1.it)('returns true for spec defined scalar', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)(scalars_1.GraphQLString)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(scalars_1.GraphQLString)).to.not.throw();
        });
        (0, mocha_1.it)('returns true for custom scalar', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)(ScalarType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(ScalarType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for scalar class (rather than instance)', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)(definition_1.GraphQLScalarType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(definition_1.GraphQLScalarType)).to.throw();
        });
        (0, mocha_1.it)('returns false for wrapped scalar', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)(new definition_1.GraphQLList(ScalarType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(new definition_1.GraphQLList(ScalarType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-scalar', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)(EnumType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(EnumType)).to.throw();
            (0, chai_1.expect)((0, definition_1.isScalarType)(Directive)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)(Directive)).to.throw();
        });
        (0, mocha_1.it)('returns false for random garbage', () => {
            (0, chai_1.expect)((0, definition_1.isScalarType)({ what: 'is this' })).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertScalarType)({ what: 'is this' })).to.throw();
        });
    });
    (0, mocha_1.describe)('isSpecifiedScalarType', () => {
        (0, mocha_1.it)('returns true for specified scalars', () => {
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(scalars_1.GraphQLString)).to.equal(true);
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(scalars_1.GraphQLInt)).to.equal(true);
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(scalars_1.GraphQLFloat)).to.equal(true);
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(scalars_1.GraphQLBoolean)).to.equal(true);
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(scalars_1.GraphQLID)).to.equal(true);
        });
        (0, mocha_1.it)('returns false for custom scalar', () => {
            (0, chai_1.expect)((0, scalars_1.isSpecifiedScalarType)(ScalarType)).to.equal(false);
        });
    });
    (0, mocha_1.describe)('isObjectType', () => {
        (0, mocha_1.it)('returns true for object type', () => {
            (0, chai_1.expect)((0, definition_1.isObjectType)(ObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertObjectType)(ObjectType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped object type', () => {
            (0, chai_1.expect)((0, definition_1.isObjectType)(new definition_1.GraphQLList(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertObjectType)(new definition_1.GraphQLList(ObjectType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-object type', () => {
            (0, chai_1.expect)((0, definition_1.isObjectType)(InterfaceType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertObjectType)(InterfaceType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isInterfaceType', () => {
        (0, mocha_1.it)('returns true for interface type', () => {
            (0, chai_1.expect)((0, definition_1.isInterfaceType)(InterfaceType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertInterfaceType)(InterfaceType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped interface type', () => {
            (0, chai_1.expect)((0, definition_1.isInterfaceType)(new definition_1.GraphQLList(InterfaceType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertInterfaceType)(new definition_1.GraphQLList(InterfaceType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-interface type', () => {
            (0, chai_1.expect)((0, definition_1.isInterfaceType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertInterfaceType)(ObjectType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isUnionType', () => {
        (0, mocha_1.it)('returns true for union type', () => {
            (0, chai_1.expect)((0, definition_1.isUnionType)(UnionType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertUnionType)(UnionType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped union type', () => {
            (0, chai_1.expect)((0, definition_1.isUnionType)(new definition_1.GraphQLList(UnionType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertUnionType)(new definition_1.GraphQLList(UnionType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-union type', () => {
            (0, chai_1.expect)((0, definition_1.isUnionType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertUnionType)(ObjectType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isEnumType', () => {
        (0, mocha_1.it)('returns true for enum type', () => {
            (0, chai_1.expect)((0, definition_1.isEnumType)(EnumType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertEnumType)(EnumType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped enum type', () => {
            (0, chai_1.expect)((0, definition_1.isEnumType)(new definition_1.GraphQLList(EnumType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertEnumType)(new definition_1.GraphQLList(EnumType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-enum type', () => {
            (0, chai_1.expect)((0, definition_1.isEnumType)(ScalarType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertEnumType)(ScalarType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isInputObjectType', () => {
        (0, mocha_1.it)('returns true for input object type', () => {
            (0, chai_1.expect)((0, definition_1.isInputObjectType)(InputObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertInputObjectType)(InputObjectType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped input object type', () => {
            (0, chai_1.expect)((0, definition_1.isInputObjectType)(new definition_1.GraphQLList(InputObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertInputObjectType)(new definition_1.GraphQLList(InputObjectType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-input-object type', () => {
            (0, chai_1.expect)((0, definition_1.isInputObjectType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertInputObjectType)(ObjectType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isListType', () => {
        (0, mocha_1.it)('returns true for a list wrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isListType)(new definition_1.GraphQLList(ObjectType))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertListType)(new definition_1.GraphQLList(ObjectType))).to.not.throw();
        });
        (0, mocha_1.it)('returns false for an unwrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isListType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertListType)(ObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for a non-list wrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isListType)(new definition_1.GraphQLNonNull(new definition_1.GraphQLList(ObjectType)))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertListType)(new definition_1.GraphQLNonNull(new definition_1.GraphQLList(ObjectType)))).to.throw();
        });
    });
    (0, mocha_1.describe)('isNonNullType', () => {
        (0, mocha_1.it)('returns true for a non-null wrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isNonNullType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertNonNullType)(new definition_1.GraphQLNonNull(ObjectType))).to.not.throw();
        });
        (0, mocha_1.it)('returns false for an unwrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isNonNullType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertNonNullType)(ObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for a not non-null wrapped type', () => {
            (0, chai_1.expect)((0, definition_1.isNonNullType)(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(ObjectType)))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertNonNullType)(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(ObjectType)))).to.throw();
        });
    });
    (0, mocha_1.describe)('isInputType', () => {
        function expectInputType(type) {
            (0, chai_1.expect)((0, definition_1.isInputType)(type)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertInputType)(type)).to.not.throw();
        }
        (0, mocha_1.it)('returns true for an input type', () => {
            expectInputType(scalars_1.GraphQLString);
            expectInputType(EnumType);
            expectInputType(InputObjectType);
        });
        (0, mocha_1.it)('returns true for a wrapped input type', () => {
            expectInputType(new definition_1.GraphQLList(scalars_1.GraphQLString));
            expectInputType(new definition_1.GraphQLList(EnumType));
            expectInputType(new definition_1.GraphQLList(InputObjectType));
            expectInputType(new definition_1.GraphQLNonNull(scalars_1.GraphQLString));
            expectInputType(new definition_1.GraphQLNonNull(EnumType));
            expectInputType(new definition_1.GraphQLNonNull(InputObjectType));
        });
        function expectNonInputType(type) {
            (0, chai_1.expect)((0, definition_1.isInputType)(type)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertInputType)(type)).to.throw();
        }
        (0, mocha_1.it)('returns false for an output type', () => {
            expectNonInputType(ObjectType);
            expectNonInputType(InterfaceType);
            expectNonInputType(UnionType);
        });
        (0, mocha_1.it)('returns false for a wrapped output type', () => {
            expectNonInputType(new definition_1.GraphQLList(ObjectType));
            expectNonInputType(new definition_1.GraphQLList(InterfaceType));
            expectNonInputType(new definition_1.GraphQLList(UnionType));
            expectNonInputType(new definition_1.GraphQLNonNull(ObjectType));
            expectNonInputType(new definition_1.GraphQLNonNull(InterfaceType));
            expectNonInputType(new definition_1.GraphQLNonNull(UnionType));
        });
    });
    (0, mocha_1.describe)('isOutputType', () => {
        function expectOutputType(type) {
            (0, chai_1.expect)((0, definition_1.isOutputType)(type)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertOutputType)(type)).to.not.throw();
        }
        (0, mocha_1.it)('returns true for an output type', () => {
            expectOutputType(scalars_1.GraphQLString);
            expectOutputType(ObjectType);
            expectOutputType(InterfaceType);
            expectOutputType(UnionType);
            expectOutputType(EnumType);
        });
        (0, mocha_1.it)('returns true for a wrapped output type', () => {
            expectOutputType(new definition_1.GraphQLList(scalars_1.GraphQLString));
            expectOutputType(new definition_1.GraphQLList(ObjectType));
            expectOutputType(new definition_1.GraphQLList(InterfaceType));
            expectOutputType(new definition_1.GraphQLList(UnionType));
            expectOutputType(new definition_1.GraphQLList(EnumType));
            expectOutputType(new definition_1.GraphQLNonNull(scalars_1.GraphQLString));
            expectOutputType(new definition_1.GraphQLNonNull(ObjectType));
            expectOutputType(new definition_1.GraphQLNonNull(InterfaceType));
            expectOutputType(new definition_1.GraphQLNonNull(UnionType));
            expectOutputType(new definition_1.GraphQLNonNull(EnumType));
        });
        function expectNonOutputType(type) {
            (0, chai_1.expect)((0, definition_1.isOutputType)(type)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertOutputType)(type)).to.throw();
        }
        (0, mocha_1.it)('returns false for an input type', () => {
            expectNonOutputType(InputObjectType);
        });
        (0, mocha_1.it)('returns false for a wrapped input type', () => {
            expectNonOutputType(new definition_1.GraphQLList(InputObjectType));
            expectNonOutputType(new definition_1.GraphQLNonNull(InputObjectType));
        });
    });
    (0, mocha_1.describe)('isLeafType', () => {
        (0, mocha_1.it)('returns true for scalar and enum types', () => {
            (0, chai_1.expect)((0, definition_1.isLeafType)(ScalarType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertLeafType)(ScalarType)).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isLeafType)(EnumType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertLeafType)(EnumType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped leaf type', () => {
            (0, chai_1.expect)((0, definition_1.isLeafType)(new definition_1.GraphQLList(ScalarType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertLeafType)(new definition_1.GraphQLList(ScalarType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-leaf type', () => {
            (0, chai_1.expect)((0, definition_1.isLeafType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertLeafType)(ObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for wrapped non-leaf type', () => {
            (0, chai_1.expect)((0, definition_1.isLeafType)(new definition_1.GraphQLList(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertLeafType)(new definition_1.GraphQLList(ObjectType))).to.throw();
        });
    });
    (0, mocha_1.describe)('isCompositeType', () => {
        (0, mocha_1.it)('returns true for object, interface, and union types', () => {
            (0, chai_1.expect)((0, definition_1.isCompositeType)(ObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(ObjectType)).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isCompositeType)(InterfaceType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(InterfaceType)).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isCompositeType)(UnionType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(UnionType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped composite type', () => {
            (0, chai_1.expect)((0, definition_1.isCompositeType)(new definition_1.GraphQLList(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(new definition_1.GraphQLList(ObjectType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-composite type', () => {
            (0, chai_1.expect)((0, definition_1.isCompositeType)(InputObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(InputObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for wrapped non-composite type', () => {
            (0, chai_1.expect)((0, definition_1.isCompositeType)(new definition_1.GraphQLList(InputObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertCompositeType)(new definition_1.GraphQLList(InputObjectType))).to.throw();
        });
    });
    (0, mocha_1.describe)('isAbstractType', () => {
        (0, mocha_1.it)('returns true for interface and union types', () => {
            (0, chai_1.expect)((0, definition_1.isAbstractType)(InterfaceType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertAbstractType)(InterfaceType)).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isAbstractType)(UnionType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertAbstractType)(UnionType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for wrapped abstract type', () => {
            (0, chai_1.expect)((0, definition_1.isAbstractType)(new definition_1.GraphQLList(InterfaceType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertAbstractType)(new definition_1.GraphQLList(InterfaceType))).to.throw();
        });
        (0, mocha_1.it)('returns false for non-abstract type', () => {
            (0, chai_1.expect)((0, definition_1.isAbstractType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertAbstractType)(ObjectType)).to.throw();
        });
        (0, mocha_1.it)('returns false for wrapped non-abstract type', () => {
            (0, chai_1.expect)((0, definition_1.isAbstractType)(new definition_1.GraphQLList(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertAbstractType)(new definition_1.GraphQLList(ObjectType))).to.throw();
        });
    });
    (0, mocha_1.describe)('isWrappingType', () => {
        (0, mocha_1.it)('returns true for list and non-null types', () => {
            (0, chai_1.expect)((0, definition_1.isWrappingType)(new definition_1.GraphQLList(ObjectType))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertWrappingType)(new definition_1.GraphQLList(ObjectType))).to.not.throw();
            (0, chai_1.expect)((0, definition_1.isWrappingType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertWrappingType)(new definition_1.GraphQLNonNull(ObjectType))).to.not.throw();
        });
        (0, mocha_1.it)('returns false for unwrapped types', () => {
            (0, chai_1.expect)((0, definition_1.isWrappingType)(ObjectType)).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertWrappingType)(ObjectType)).to.throw();
        });
    });
    (0, mocha_1.describe)('isNullableType', () => {
        (0, mocha_1.it)('returns true for unwrapped types', () => {
            (0, chai_1.expect)((0, definition_1.isNullableType)(ObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertNullableType)(ObjectType)).to.not.throw();
        });
        (0, mocha_1.it)('returns true for list of non-null types', () => {
            (0, chai_1.expect)((0, definition_1.isNullableType)(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(ObjectType)))).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertNullableType)(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(ObjectType)))).to.not.throw();
        });
        (0, mocha_1.it)('returns false for non-null types', () => {
            (0, chai_1.expect)((0, definition_1.isNullableType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertNullableType)(new definition_1.GraphQLNonNull(ObjectType))).to.throw();
        });
    });
    (0, mocha_1.describe)('getNullableType', () => {
        (0, mocha_1.it)('returns undefined for no type', () => {
            (0, chai_1.expect)((0, definition_1.getNullableType)(undefined)).to.equal(undefined);
            (0, chai_1.expect)((0, definition_1.getNullableType)(null)).to.equal(undefined);
        });
        (0, mocha_1.it)('returns self for a nullable type', () => {
            (0, chai_1.expect)((0, definition_1.getNullableType)(ObjectType)).to.equal(ObjectType);
            const listOfObj = new definition_1.GraphQLList(ObjectType);
            (0, chai_1.expect)((0, definition_1.getNullableType)(listOfObj)).to.equal(listOfObj);
        });
        (0, mocha_1.it)('unwraps non-null type', () => {
            (0, chai_1.expect)((0, definition_1.getNullableType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(ObjectType);
        });
    });
    (0, mocha_1.describe)('isNamedType', () => {
        (0, mocha_1.it)('returns true for unwrapped types', () => {
            (0, chai_1.expect)((0, definition_1.isNamedType)(ObjectType)).to.equal(true);
            (0, chai_1.expect)(() => (0, definition_1.assertNamedType)(ObjectType)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for list and non-null types', () => {
            (0, chai_1.expect)((0, definition_1.isNamedType)(new definition_1.GraphQLList(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertNamedType)(new definition_1.GraphQLList(ObjectType))).to.throw();
            (0, chai_1.expect)((0, definition_1.isNamedType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(false);
            (0, chai_1.expect)(() => (0, definition_1.assertNamedType)(new definition_1.GraphQLNonNull(ObjectType))).to.throw();
        });
    });
    (0, mocha_1.describe)('getNamedType', () => {
        (0, mocha_1.it)('returns undefined for no type', () => {
            (0, chai_1.expect)((0, definition_1.getNamedType)(undefined)).to.equal(undefined);
            (0, chai_1.expect)((0, definition_1.getNamedType)(null)).to.equal(undefined);
        });
        (0, mocha_1.it)('returns self for a unwrapped type', () => {
            (0, chai_1.expect)((0, definition_1.getNamedType)(ObjectType)).to.equal(ObjectType);
        });
        (0, mocha_1.it)('unwraps wrapper types', () => {
            (0, chai_1.expect)((0, definition_1.getNamedType)(new definition_1.GraphQLNonNull(ObjectType))).to.equal(ObjectType);
            (0, chai_1.expect)((0, definition_1.getNamedType)(new definition_1.GraphQLList(ObjectType))).to.equal(ObjectType);
        });
        (0, mocha_1.it)('unwraps deeply wrapper types', () => {
            (0, chai_1.expect)((0, definition_1.getNamedType)(new definition_1.GraphQLNonNull(new definition_1.GraphQLList(new definition_1.GraphQLNonNull(ObjectType))))).to.equal(ObjectType);
        });
    });
    (0, mocha_1.describe)('isRequiredArgument', () => {
        function buildArg(config) {
            return {
                name: 'someArg',
                type: config.type,
                description: undefined,
                defaultValue: config.defaultValue,
                deprecationReason: null,
                extensions: Object.create(null),
                astNode: undefined,
            };
        }
        (0, mocha_1.it)('returns true for required arguments', () => {
            const requiredArg = buildArg({
                type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            });
            (0, chai_1.expect)((0, definition_1.isRequiredArgument)(requiredArg)).to.equal(true);
        });
        (0, mocha_1.it)('returns false for optional arguments', () => {
            const optArg1 = buildArg({
                type: scalars_1.GraphQLString,
            });
            (0, chai_1.expect)((0, definition_1.isRequiredArgument)(optArg1)).to.equal(false);
            const optArg2 = buildArg({
                type: scalars_1.GraphQLString,
                defaultValue: null,
            });
            (0, chai_1.expect)((0, definition_1.isRequiredArgument)(optArg2)).to.equal(false);
            const optArg3 = buildArg({
                type: new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString)),
            });
            (0, chai_1.expect)((0, definition_1.isRequiredArgument)(optArg3)).to.equal(false);
            const optArg4 = buildArg({
                type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                defaultValue: 'default',
            });
            (0, chai_1.expect)((0, definition_1.isRequiredArgument)(optArg4)).to.equal(false);
        });
    });
    (0, mocha_1.describe)('isRequiredInputField', () => {
        function buildInputField(config) {
            return {
                name: 'someInputField',
                type: config.type,
                description: undefined,
                defaultValue: config.defaultValue,
                deprecationReason: null,
                extensions: Object.create(null),
                astNode: undefined,
            };
        }
        (0, mocha_1.it)('returns true for required input field', () => {
            const requiredField = buildInputField({
                type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
            });
            (0, chai_1.expect)((0, definition_1.isRequiredInputField)(requiredField)).to.equal(true);
        });
        (0, mocha_1.it)('returns false for optional input field', () => {
            const optField1 = buildInputField({
                type: scalars_1.GraphQLString,
            });
            (0, chai_1.expect)((0, definition_1.isRequiredInputField)(optField1)).to.equal(false);
            const optField2 = buildInputField({
                type: scalars_1.GraphQLString,
                defaultValue: null,
            });
            (0, chai_1.expect)((0, definition_1.isRequiredInputField)(optField2)).to.equal(false);
            const optField3 = buildInputField({
                type: new definition_1.GraphQLList(new definition_1.GraphQLNonNull(scalars_1.GraphQLString)),
            });
            (0, chai_1.expect)((0, definition_1.isRequiredInputField)(optField3)).to.equal(false);
            const optField4 = buildInputField({
                type: new definition_1.GraphQLNonNull(scalars_1.GraphQLString),
                defaultValue: 'default',
            });
            (0, chai_1.expect)((0, definition_1.isRequiredInputField)(optField4)).to.equal(false);
        });
    });
});
(0, mocha_1.describe)('Directive predicates', () => {
    (0, mocha_1.describe)('isDirective', () => {
        (0, mocha_1.it)('returns true for spec defined directive', () => {
            (0, chai_1.expect)((0, directives_1.isDirective)(directives_1.GraphQLSkipDirective)).to.equal(true);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)(directives_1.GraphQLSkipDirective)).to.not.throw();
        });
        (0, mocha_1.it)('returns true for custom directive', () => {
            (0, chai_1.expect)((0, directives_1.isDirective)(Directive)).to.equal(true);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)(Directive)).to.not.throw();
        });
        (0, mocha_1.it)('returns false for directive class (rather than instance)', () => {
            (0, chai_1.expect)((0, directives_1.isDirective)(directives_1.GraphQLDirective)).to.equal(false);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)(directives_1.GraphQLDirective)).to.throw();
        });
        (0, mocha_1.it)('returns false for non-directive', () => {
            (0, chai_1.expect)((0, directives_1.isDirective)(EnumType)).to.equal(false);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)(EnumType)).to.throw();
            (0, chai_1.expect)((0, directives_1.isDirective)(ScalarType)).to.equal(false);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)(ScalarType)).to.throw();
        });
        (0, mocha_1.it)('returns false for random garbage', () => {
            (0, chai_1.expect)((0, directives_1.isDirective)({ what: 'is this' })).to.equal(false);
            (0, chai_1.expect)(() => (0, directives_1.assertDirective)({ what: 'is this' })).to.throw();
        });
    });
    (0, mocha_1.describe)('isSpecifiedDirective', () => {
        (0, mocha_1.it)('returns true for specified directives', () => {
            (0, chai_1.expect)((0, directives_1.isSpecifiedDirective)(directives_1.GraphQLIncludeDirective)).to.equal(true);
            (0, chai_1.expect)((0, directives_1.isSpecifiedDirective)(directives_1.GraphQLSkipDirective)).to.equal(true);
            (0, chai_1.expect)((0, directives_1.isSpecifiedDirective)(directives_1.GraphQLDeprecatedDirective)).to.equal(true);
        });
        (0, mocha_1.it)('returns false for custom directive', () => {
            (0, chai_1.expect)((0, directives_1.isSpecifiedDirective)(Directive)).to.equal(false);
        });
    });
});
//# sourceMappingURL=predicate-test.js.map