"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const typeComparators_1 = require("../typeComparators");
(0, mocha_1.describe)('typeComparators', () => {
    (0, mocha_1.describe)('isEqualType', () => {
        (0, mocha_1.it)('same reference are equal', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(scalars_1.GraphQLString, scalars_1.GraphQLString)).to.equal(true);
        });
        (0, mocha_1.it)('int and float are not equal', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(scalars_1.GraphQLInt, scalars_1.GraphQLFloat)).to.equal(false);
        });
        (0, mocha_1.it)('lists of same type are equal', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(new definition_1.GraphQLList(scalars_1.GraphQLInt), new definition_1.GraphQLList(scalars_1.GraphQLInt))).to.equal(true);
        });
        (0, mocha_1.it)('lists is not equal to item', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(new definition_1.GraphQLList(scalars_1.GraphQLInt), scalars_1.GraphQLInt)).to.equal(false);
        });
        (0, mocha_1.it)('non-null of same type are equal', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(new definition_1.GraphQLNonNull(scalars_1.GraphQLInt), new definition_1.GraphQLNonNull(scalars_1.GraphQLInt))).to.equal(true);
        });
        (0, mocha_1.it)('non-null is not equal to nullable', () => {
            (0, chai_1.expect)((0, typeComparators_1.isEqualType)(new definition_1.GraphQLNonNull(scalars_1.GraphQLInt), scalars_1.GraphQLInt)).to.equal(false);
        });
    });
    (0, mocha_1.describe)('isTypeSubTypeOf', () => {
        function testSchema(fields) {
            return new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields,
                }),
            });
        }
        (0, mocha_1.it)('same reference is subtype', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, scalars_1.GraphQLString, scalars_1.GraphQLString)).to.equal(true);
        });
        (0, mocha_1.it)('int is not subtype of float', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, scalars_1.GraphQLInt, scalars_1.GraphQLFloat)).to.equal(false);
        });
        (0, mocha_1.it)('non-null is subtype of nullable', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, new definition_1.GraphQLNonNull(scalars_1.GraphQLInt), scalars_1.GraphQLInt)).to.equal(true);
        });
        (0, mocha_1.it)('nullable is not subtype of non-null', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, scalars_1.GraphQLInt, new definition_1.GraphQLNonNull(scalars_1.GraphQLInt))).to.equal(false);
        });
        (0, mocha_1.it)('item is not subtype of list', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, scalars_1.GraphQLInt, new definition_1.GraphQLList(scalars_1.GraphQLInt))).to.equal(false);
        });
        (0, mocha_1.it)('list is not subtype of item', () => {
            const schema = testSchema({ field: { type: scalars_1.GraphQLString } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, new definition_1.GraphQLList(scalars_1.GraphQLInt), scalars_1.GraphQLInt)).to.equal(false);
        });
        (0, mocha_1.it)('member is subtype of union', () => {
            const member = new definition_1.GraphQLObjectType({
                name: 'Object',
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const union = new definition_1.GraphQLUnionType({ name: 'Union', types: [member] });
            const schema = testSchema({ field: { type: union } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, member, union)).to.equal(true);
        });
        (0, mocha_1.it)('implementing object is subtype of interface', () => {
            const iface = new definition_1.GraphQLInterfaceType({
                name: 'Interface',
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const impl = new definition_1.GraphQLObjectType({
                name: 'Object',
                interfaces: [iface],
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const schema = testSchema({ field: { type: impl } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, impl, iface)).to.equal(true);
        });
        (0, mocha_1.it)('implementing interface is subtype of interface', () => {
            const iface = new definition_1.GraphQLInterfaceType({
                name: 'Interface',
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const iface2 = new definition_1.GraphQLInterfaceType({
                name: 'Interface2',
                interfaces: [iface],
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const impl = new definition_1.GraphQLObjectType({
                name: 'Object',
                interfaces: [iface2, iface],
                fields: {
                    field: { type: scalars_1.GraphQLString },
                },
            });
            const schema = testSchema({ field: { type: impl } });
            (0, chai_1.expect)((0, typeComparators_1.isTypeSubTypeOf)(schema, iface2, iface)).to.equal(true);
        });
    });
});
//# sourceMappingURL=typeComparators-test.js.map