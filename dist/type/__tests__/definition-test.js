"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../../jsutils/identityFunc");
const inspect_1 = require("../../jsutils/inspect");
const parser_1 = require("../../language/parser");
const definition_1 = require("../definition");
const ScalarType = new definition_1.GraphQLScalarType({ name: 'Scalar' });
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
const ListOfScalarsType = new definition_1.GraphQLList(ScalarType);
const NonNullScalarType = new definition_1.GraphQLNonNull(ScalarType);
const ListOfNonNullScalarsType = new definition_1.GraphQLList(NonNullScalarType);
const NonNullListOfScalars = new definition_1.GraphQLNonNull(ListOfScalarsType);
/* c8 ignore next */
const dummyFunc = () => chai_1.expect.fail('Never called and used as a placeholder');
(0, mocha_1.describe)('Type System: Scalars', () => {
    (0, mocha_1.it)('accepts a Scalar type defining serialize', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({ name: 'SomeScalar' })).to.not.throw();
    });
    (0, mocha_1.it)('accepts a Scalar type defining specifiedByURL', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            specifiedByURL: 'https://example.com/foo_spec',
        })).not.to.throw();
    });
    (0, mocha_1.it)('accepts a Scalar type defining parseValue and parseLiteral', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            parseValue: dummyFunc,
            parseLiteral: dummyFunc,
        })).to.not.throw();
    });
    (0, mocha_1.it)('provides default methods if omitted', () => {
        const scalar = new definition_1.GraphQLScalarType({ name: 'Foo' });
        (0, chai_1.expect)(scalar.serialize).to.equal(identityFunc_1.identityFunc);
        (0, chai_1.expect)(scalar.parseValue).to.equal(identityFunc_1.identityFunc);
        (0, chai_1.expect)(scalar.parseLiteral).to.be.a('function');
    });
    (0, mocha_1.it)('use parseValue for parsing literals if parseLiteral omitted', () => {
        const scalar = new definition_1.GraphQLScalarType({
            name: 'Foo',
            parseValue(value) {
                return 'parseValue: ' + (0, inspect_1.inspect)(value);
            },
        });
        (0, chai_1.expect)(scalar.parseLiteral((0, parser_1.parseValue)('null'))).to.equal('parseValue: null');
        (0, chai_1.expect)(scalar.parseLiteral((0, parser_1.parseValue)('{ foo: "bar" }'))).to.equal('parseValue: { foo: "bar" }');
        (0, chai_1.expect)(scalar.parseLiteral((0, parser_1.parseValue)('{ foo: { bar: $var } }'), { var: 'baz' })).to.equal('parseValue: { foo: { bar: "baz" } }');
    });
    (0, mocha_1.it)('rejects a Scalar type without name', () => {
        // @ts-expect-error
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({})).to.throw('Must provide name.');
    });
    (0, mocha_1.it)('rejects a Scalar type defining serialize with an incorrect type', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            // @ts-expect-error
            serialize: {},
        })).to.throw('SomeScalar must provide "serialize" function. If this custom Scalar is also used as an input type, ensure "parseValue" and "parseLiteral" functions are also provided.');
    });
    (0, mocha_1.it)('rejects a Scalar type defining parseLiteral but not parseValue', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            parseLiteral: dummyFunc,
        })).to.throw('SomeScalar must provide both "parseValue" and "parseLiteral" functions.');
    });
    (0, mocha_1.it)('rejects a Scalar type defining parseValue and parseLiteral with an incorrect type', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            // @ts-expect-error
            parseValue: {},
            // @ts-expect-error
            parseLiteral: {},
        })).to.throw('SomeScalar must provide both "parseValue" and "parseLiteral" functions.');
    });
    (0, mocha_1.it)('rejects a Scalar type defining specifiedByURL with an incorrect type', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLScalarType({
            name: 'SomeScalar',
            // @ts-expect-error
            specifiedByURL: {},
        })).to.throw('SomeScalar must provide "specifiedByURL" as a string, but got: {}.');
    });
});
(0, mocha_1.describe)('Type System: Objects', () => {
    (0, mocha_1.it)('does not mutate passed field definitions', () => {
        const outputFields = {
            field1: { type: ScalarType },
            field2: {
                type: ScalarType,
                args: {
                    id: { type: ScalarType },
                },
            },
        };
        const testObject1 = new definition_1.GraphQLObjectType({
            name: 'Test1',
            fields: outputFields,
        });
        const testObject2 = new definition_1.GraphQLObjectType({
            name: 'Test2',
            fields: outputFields,
        });
        (0, chai_1.expect)(testObject1.getFields()).to.deep.equal(testObject2.getFields());
        (0, chai_1.expect)(outputFields).to.deep.equal({
            field1: {
                type: ScalarType,
            },
            field2: {
                type: ScalarType,
                args: {
                    id: { type: ScalarType },
                },
            },
        });
        const inputFields = {
            field1: { type: ScalarType },
            field2: { type: ScalarType },
        };
        const testInputObject1 = new definition_1.GraphQLInputObjectType({
            name: 'Test1',
            fields: inputFields,
        });
        const testInputObject2 = new definition_1.GraphQLInputObjectType({
            name: 'Test2',
            fields: inputFields,
        });
        (0, chai_1.expect)(testInputObject1.getFields()).to.deep.equal(testInputObject2.getFields());
        (0, chai_1.expect)(inputFields).to.deep.equal({
            field1: { type: ScalarType },
            field2: { type: ScalarType },
        });
    });
    (0, mocha_1.it)('defines an object type with deprecated field', () => {
        const TypeWithDeprecatedField = new definition_1.GraphQLObjectType({
            name: 'foo',
            fields: {
                bar: {
                    type: ScalarType,
                    deprecationReason: 'A terrible reason',
                },
                baz: {
                    type: ScalarType,
                    deprecationReason: '',
                },
            },
        });
        (0, chai_1.expect)(TypeWithDeprecatedField.getFields().bar).to.include({
            name: 'bar',
            deprecationReason: 'A terrible reason',
        });
        (0, chai_1.expect)(TypeWithDeprecatedField.getFields().baz).to.include({
            name: 'baz',
            deprecationReason: '',
        });
    });
    (0, mocha_1.it)('accepts an Object type with a field function', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: () => ({
                f: { type: ScalarType },
            }),
        });
        (0, chai_1.expect)(objType.getFields()).to.deep.equal({
            f: {
                name: 'f',
                description: undefined,
                type: ScalarType,
                args: [],
                resolve: undefined,
                subscribe: undefined,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
        });
    });
    (0, mocha_1.it)('accepts an Object type with field args', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                f: {
                    type: ScalarType,
                    args: {
                        arg: { type: ScalarType },
                    },
                },
            },
        });
        (0, chai_1.expect)(objType.getFields()).to.deep.equal({
            f: {
                name: 'f',
                description: undefined,
                type: ScalarType,
                args: [
                    {
                        name: 'arg',
                        description: undefined,
                        type: ScalarType,
                        defaultValue: undefined,
                        deprecationReason: undefined,
                        extensions: {},
                        astNode: undefined,
                    },
                ],
                resolve: undefined,
                subscribe: undefined,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
        });
    });
    (0, mocha_1.it)('accepts an Object type with array interfaces', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {},
            interfaces: [InterfaceType],
        });
        (0, chai_1.expect)(objType.getInterfaces()).to.deep.equal([InterfaceType]);
    });
    (0, mocha_1.it)('accepts an Object type with interfaces as a function returning an array', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {},
            interfaces: () => [InterfaceType],
        });
        (0, chai_1.expect)(objType.getInterfaces()).to.deep.equal([InterfaceType]);
    });
    (0, mocha_1.it)('accepts a lambda as an Object field resolver', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                f: {
                    type: ScalarType,
                    resolve: dummyFunc,
                },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.not.throw();
    });
    (0, mocha_1.it)('rejects an Object type with invalid name', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLObjectType({ name: 'bad-name', fields: {} })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Object type field with undefined config', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                // @ts-expect-error (must not be undefined)
                f: undefined,
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('SomeObject.f field config must be an object.');
    });
    (0, mocha_1.it)('rejects an Object type with incorrectly typed fields', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            // @ts-expect-error
            fields: [{ field: ScalarType }],
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('SomeObject fields must be an object with field names as keys or a function which returns such an object.');
    });
    (0, mocha_1.it)('rejects an Object type with incorrectly named fields', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                'bad-name': { type: ScalarType },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Object type with a field function that returns incorrect type', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            // @ts-expect-error (Wrong type of return)
            fields() {
                return [{ field: ScalarType }];
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw();
    });
    (0, mocha_1.it)('rejects an Object type with incorrectly typed field args', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                badField: {
                    type: ScalarType,
                    // @ts-expect-error
                    args: [{ badArg: ScalarType }],
                },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('SomeObject.badField args must be an object with argument names as keys.');
    });
    (0, mocha_1.it)('rejects an Object type with incorrectly named field args', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                badField: {
                    type: ScalarType,
                    args: {
                        'bad-name': { type: ScalarType },
                    },
                },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Object type with incorrectly typed interfaces', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {},
            // @ts-expect-error
            interfaces: {},
        });
        (0, chai_1.expect)(() => objType.getInterfaces()).to.throw('SomeObject interfaces must be an Array or a function which returns an Array.');
    });
    (0, mocha_1.it)('rejects an Object type with interfaces as a function returning an incorrect type', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {},
            // @ts-expect-error (Expected interfaces to return array)
            interfaces() {
                return {};
            },
        });
        (0, chai_1.expect)(() => objType.getInterfaces()).to.throw('SomeObject interfaces must be an Array or a function which returns an Array.');
    });
    (0, mocha_1.it)('rejects an empty Object field resolver', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                // @ts-expect-error (Expected resolve to be a function)
                field: { type: ScalarType, resolve: {} },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('SomeObject.field field resolver must be a function if provided, but got: {}.');
    });
    (0, mocha_1.it)('rejects a constant scalar value resolver', () => {
        const objType = new definition_1.GraphQLObjectType({
            name: 'SomeObject',
            fields: {
                // @ts-expect-error (Expected resolve to be a function)
                field: { type: ScalarType, resolve: 0 },
            },
        });
        (0, chai_1.expect)(() => objType.getFields()).to.throw('SomeObject.field field resolver must be a function if provided, but got: 0.');
    });
    (0, mocha_1.it)('rejects an Object type with an incorrect type for isTypeOf', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLObjectType({
            name: 'AnotherObject',
            fields: {},
            // @ts-expect-error
            isTypeOf: {},
        })).to.throw('AnotherObject must provide "isTypeOf" as a function, but got: {}.');
    });
});
(0, mocha_1.describe)('Type System: Interfaces', () => {
    (0, mocha_1.it)('accepts an Interface type defining resolveType', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: { f: { type: ScalarType } },
        })).to.not.throw();
    });
    (0, mocha_1.it)('accepts an Interface type with an array of interfaces', () => {
        const implementing = new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: {},
            interfaces: [InterfaceType],
        });
        (0, chai_1.expect)(implementing.getInterfaces()).to.deep.equal([InterfaceType]);
    });
    (0, mocha_1.it)('accepts an Interface type with interfaces as a function returning an array', () => {
        const implementing = new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: {},
            interfaces: () => [InterfaceType],
        });
        (0, chai_1.expect)(implementing.getInterfaces()).to.deep.equal([InterfaceType]);
    });
    (0, mocha_1.it)('rejects an Interface type with invalid name', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLInterfaceType({ name: 'bad-name', fields: {} })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Interface type with incorrectly typed interfaces', () => {
        const objType = new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: {},
            // @ts-expect-error
            interfaces: {},
        });
        (0, chai_1.expect)(() => objType.getInterfaces()).to.throw('AnotherInterface interfaces must be an Array or a function which returns an Array.');
    });
    (0, mocha_1.it)('rejects an Interface type with interfaces as a function returning an incorrect type', () => {
        const objType = new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: {},
            // @ts-expect-error (Expected Array return)
            interfaces() {
                return {};
            },
        });
        (0, chai_1.expect)(() => objType.getInterfaces()).to.throw('AnotherInterface interfaces must be an Array or a function which returns an Array.');
    });
    (0, mocha_1.it)('rejects an Interface type with an incorrect type for resolveType', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLInterfaceType({
            name: 'AnotherInterface',
            fields: {},
            // @ts-expect-error
            resolveType: {},
        })).to.throw('AnotherInterface must provide "resolveType" as a function, but got: {}.');
    });
});
(0, mocha_1.describe)('Type System: Unions', () => {
    (0, mocha_1.it)('accepts a Union type defining resolveType', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: [ObjectType],
        })).to.not.throw();
    });
    (0, mocha_1.it)('accepts a Union type with array types', () => {
        const unionType = new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: [ObjectType],
        });
        (0, chai_1.expect)(unionType.getTypes()).to.deep.equal([ObjectType]);
    });
    (0, mocha_1.it)('accepts a Union type with function returning an array of types', () => {
        const unionType = new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: () => [ObjectType],
        });
        (0, chai_1.expect)(unionType.getTypes()).to.deep.equal([ObjectType]);
    });
    (0, mocha_1.it)('accepts a Union type without types', () => {
        const unionType = new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: [],
        });
        (0, chai_1.expect)(unionType.getTypes()).to.deep.equal([]);
    });
    (0, mocha_1.it)('rejects an Union type with invalid name', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLUnionType({ name: 'bad-name', types: [] })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Union type with an incorrect type for resolveType', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            types: [],
            // @ts-expect-error
            resolveType: {},
        })).to.throw('SomeUnion must provide "resolveType" as a function, but got: {}.');
    });
    (0, mocha_1.it)('rejects a Union type with incorrectly typed types', () => {
        const unionType = new definition_1.GraphQLUnionType({
            name: 'SomeUnion',
            // @ts-expect-error
            types: { ObjectType },
        });
        (0, chai_1.expect)(() => unionType.getTypes()).to.throw('Must provide Array of types or a function which returns such an array for Union SomeUnion.');
    });
});
(0, mocha_1.describe)('Type System: Enums', () => {
    (0, mocha_1.it)('defines an enum type with deprecated value', () => {
        const EnumTypeWithDeprecatedValue = new definition_1.GraphQLEnumType({
            name: 'EnumWithDeprecatedValue',
            values: {
                foo: { deprecationReason: 'Just because' },
                bar: { deprecationReason: '' },
            },
        });
        (0, chai_1.expect)(EnumTypeWithDeprecatedValue.getValues()[0]).to.include({
            name: 'foo',
            deprecationReason: 'Just because',
        });
        (0, chai_1.expect)(EnumTypeWithDeprecatedValue.getValues()[1]).to.include({
            name: 'bar',
            deprecationReason: '',
        });
    });
    (0, mocha_1.it)('defines an enum type with a value of `null` and `undefined`', () => {
        const EnumTypeWithNullishValue = new definition_1.GraphQLEnumType({
            name: 'EnumWithNullishValue',
            values: {
                NULL: { value: null },
                NAN: { value: NaN },
                NO_CUSTOM_VALUE: { value: undefined },
            },
        });
        (0, chai_1.expect)(EnumTypeWithNullishValue.getValues()).to.deep.equal([
            {
                name: 'NULL',
                description: undefined,
                value: null,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
            {
                name: 'NAN',
                description: undefined,
                value: NaN,
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
            {
                name: 'NO_CUSTOM_VALUE',
                description: undefined,
                value: 'NO_CUSTOM_VALUE',
                deprecationReason: undefined,
                extensions: {},
                astNode: undefined,
            },
        ]);
    });
    (0, mocha_1.it)('accepts a well defined Enum type with empty value definition', () => {
        const enumType = new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            values: {
                FOO: {},
                BAR: {},
            },
        });
        (0, chai_1.expect)(enumType.getValue('FOO')).has.property('value', 'FOO');
        (0, chai_1.expect)(enumType.getValue('BAR')).has.property('value', 'BAR');
    });
    (0, mocha_1.it)('accepts a well defined Enum type with internal value definition', () => {
        const enumType = new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            values: {
                FOO: { value: 10 },
                BAR: { value: 20 },
            },
        });
        (0, chai_1.expect)(enumType.getValue('FOO')).has.property('value', 10);
        (0, chai_1.expect)(enumType.getValue('BAR')).has.property('value', 20);
    });
    (0, mocha_1.it)('rejects an Enum type with invalid name', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLEnumType({ name: 'bad-name', values: {} })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Enum type with incorrectly typed values', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            // @ts-expect-error
            values: [{ FOO: 10 }],
        })).to.throw('SomeEnum values must be an object with value names as keys.');
    });
    (0, mocha_1.it)('rejects an Enum type with incorrectly named values', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            values: {
                'bad-name': {},
            },
        })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
    });
    (0, mocha_1.it)('rejects an Enum type with missing value definition', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            // @ts-expect-error (must not be null)
            values: { FOO: null },
        })).to.throw('SomeEnum.FOO must refer to an object with a "value" key representing an internal value but got: null.');
    });
    (0, mocha_1.it)('rejects an Enum type with incorrectly typed value definition', () => {
        (0, chai_1.expect)(() => new definition_1.GraphQLEnumType({
            name: 'SomeEnum',
            // @ts-expect-error
            values: { FOO: 10 },
        })).to.throw('SomeEnum.FOO must refer to an object with a "value" key representing an internal value but got: 10.');
    });
});
(0, mocha_1.describe)('Type System: Input Objects', () => {
    (0, mocha_1.describe)('Input Objects must have fields', () => {
        (0, mocha_1.it)('accepts an Input Object type with fields', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    f: { type: ScalarType },
                },
            });
            (0, chai_1.expect)(inputObjType.getFields()).to.deep.equal({
                f: {
                    name: 'f',
                    description: undefined,
                    type: ScalarType,
                    defaultValue: undefined,
                    deprecationReason: undefined,
                    extensions: {},
                    astNode: undefined,
                },
            });
        });
        (0, mocha_1.it)('accepts an Input Object type with a field function', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: () => ({
                    f: { type: ScalarType },
                }),
            });
            (0, chai_1.expect)(inputObjType.getFields()).to.deep.equal({
                f: {
                    name: 'f',
                    description: undefined,
                    type: ScalarType,
                    defaultValue: undefined,
                    extensions: {},
                    deprecationReason: undefined,
                    astNode: undefined,
                },
            });
        });
        (0, mocha_1.it)('rejects an Input Object type with invalid name', () => {
            (0, chai_1.expect)(() => new definition_1.GraphQLInputObjectType({ name: 'bad-name', fields: {} })).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
        });
        (0, mocha_1.it)('rejects an Input Object type with incorrect fields', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                // @ts-expect-error
                fields: [],
            });
            (0, chai_1.expect)(() => inputObjType.getFields()).to.throw('SomeInputObject fields must be an object with field names as keys or a function which returns such an object.');
        });
        (0, mocha_1.it)('rejects an Input Object type with fields function that returns incorrect type', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                // @ts-expect-error
                fields: () => [],
            });
            (0, chai_1.expect)(() => inputObjType.getFields()).to.throw('SomeInputObject fields must be an object with field names as keys or a function which returns such an object.');
        });
        (0, mocha_1.it)('rejects an Input Object type with incorrectly named fields', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    'bad-name': { type: ScalarType },
                },
            });
            (0, chai_1.expect)(() => inputObjType.getFields()).to.throw('Names must only contain [_a-zA-Z0-9] but "bad-name" does not.');
        });
    });
    (0, mocha_1.describe)('Input Object fields must not have resolvers', () => {
        (0, mocha_1.it)('rejects an Input Object type with resolvers', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    // @ts-expect-error (Input fields cannot have resolvers)
                    f: { type: ScalarType, resolve: dummyFunc },
                },
            });
            (0, chai_1.expect)(() => inputObjType.getFields()).to.throw('SomeInputObject.f field has a resolve property, but Input Types cannot define resolvers.');
        });
        (0, mocha_1.it)('rejects an Input Object type with resolver constant', () => {
            const inputObjType = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    // @ts-expect-error (Input fields cannot have resolvers)
                    f: { type: ScalarType, resolve: {} },
                },
            });
            (0, chai_1.expect)(() => inputObjType.getFields()).to.throw('SomeInputObject.f field has a resolve property, but Input Types cannot define resolvers.');
        });
    });
    (0, mocha_1.it)('Deprecation reason is preserved on fields', () => {
        const inputObjType = new definition_1.GraphQLInputObjectType({
            name: 'SomeInputObject',
            fields: {
                deprecatedField: {
                    type: ScalarType,
                    deprecationReason: 'not used anymore',
                },
            },
        });
        (0, chai_1.expect)(inputObjType.toConfig()).to.have.nested.property('fields.deprecatedField.deprecationReason', 'not used anymore');
    });
});
(0, mocha_1.describe)('Type System: List', () => {
    function expectList(type) {
        return (0, chai_1.expect)(() => new definition_1.GraphQLList(type));
    }
    (0, mocha_1.it)('accepts an type as item type of list', () => {
        expectList(ScalarType).to.not.throw();
        expectList(ObjectType).to.not.throw();
        expectList(UnionType).to.not.throw();
        expectList(InterfaceType).to.not.throw();
        expectList(EnumType).to.not.throw();
        expectList(InputObjectType).to.not.throw();
        expectList(ListOfScalarsType).to.not.throw();
        expectList(NonNullScalarType).to.not.throw();
    });
    (0, mocha_1.it)('rejects a non-type as item type of list', () => {
        // @ts-expect-error
        expectList({}).to.throw('Expected {} to be a GraphQL type.');
        // @ts-expect-error
        expectList(String).to.throw('Expected [function String] to be a GraphQL type.');
        // @ts-expect-error (must provide type)
        expectList(null).to.throw('Expected null to be a GraphQL type.');
        // @ts-expect-error (must provide type)
        expectList(undefined).to.throw('Expected undefined to be a GraphQL type.');
    });
});
(0, mocha_1.describe)('Type System: Non-Null', () => {
    function expectNonNull(type) {
        return (0, chai_1.expect)(() => new definition_1.GraphQLNonNull(type));
    }
    (0, mocha_1.it)('accepts an type as nullable type of non-null', () => {
        expectNonNull(ScalarType).to.not.throw();
        expectNonNull(ObjectType).to.not.throw();
        expectNonNull(UnionType).to.not.throw();
        expectNonNull(InterfaceType).to.not.throw();
        expectNonNull(EnumType).to.not.throw();
        expectNonNull(InputObjectType).to.not.throw();
        expectNonNull(ListOfScalarsType).to.not.throw();
        expectNonNull(ListOfNonNullScalarsType).to.not.throw();
    });
    (0, mocha_1.it)('rejects a non-type as nullable type of non-null', () => {
        expectNonNull(NonNullScalarType).to.throw('Expected Scalar! to be a GraphQL nullable type.');
        // @ts-expect-error
        expectNonNull({}).to.throw('Expected {} to be a GraphQL nullable type.');
        // @ts-expect-error
        expectNonNull(String).to.throw('Expected [function String] to be a GraphQL nullable type.');
        // @ts-expect-error (must provide type)
        expectNonNull(null).to.throw('Expected null to be a GraphQL nullable type.');
        // @ts-expect-error (must provide type)
        expectNonNull(undefined).to.throw('Expected undefined to be a GraphQL nullable type.');
    });
});
(0, mocha_1.describe)('Type System: test utility methods', () => {
    (0, mocha_1.it)('stringifies types', () => {
        (0, chai_1.expect)(String(ScalarType)).to.equal('Scalar');
        (0, chai_1.expect)(String(ObjectType)).to.equal('Object');
        (0, chai_1.expect)(String(InterfaceType)).to.equal('Interface');
        (0, chai_1.expect)(String(UnionType)).to.equal('Union');
        (0, chai_1.expect)(String(EnumType)).to.equal('Enum');
        (0, chai_1.expect)(String(InputObjectType)).to.equal('InputObject');
        (0, chai_1.expect)(String(NonNullScalarType)).to.equal('Scalar!');
        (0, chai_1.expect)(String(ListOfScalarsType)).to.equal('[Scalar]');
        (0, chai_1.expect)(String(NonNullListOfScalars)).to.equal('[Scalar]!');
        (0, chai_1.expect)(String(ListOfNonNullScalarsType)).to.equal('[Scalar!]');
        (0, chai_1.expect)(String(new definition_1.GraphQLList(ListOfScalarsType))).to.equal('[[Scalar]]');
    });
    (0, mocha_1.it)('JSON.stringifies types', () => {
        (0, chai_1.expect)(JSON.stringify(ScalarType)).to.equal('"Scalar"');
        (0, chai_1.expect)(JSON.stringify(ObjectType)).to.equal('"Object"');
        (0, chai_1.expect)(JSON.stringify(InterfaceType)).to.equal('"Interface"');
        (0, chai_1.expect)(JSON.stringify(UnionType)).to.equal('"Union"');
        (0, chai_1.expect)(JSON.stringify(EnumType)).to.equal('"Enum"');
        (0, chai_1.expect)(JSON.stringify(InputObjectType)).to.equal('"InputObject"');
        (0, chai_1.expect)(JSON.stringify(NonNullScalarType)).to.equal('"Scalar!"');
        (0, chai_1.expect)(JSON.stringify(ListOfScalarsType)).to.equal('"[Scalar]"');
        (0, chai_1.expect)(JSON.stringify(NonNullListOfScalars)).to.equal('"[Scalar]!"');
        (0, chai_1.expect)(JSON.stringify(ListOfNonNullScalarsType)).to.equal('"[Scalar!]"');
        (0, chai_1.expect)(JSON.stringify(new definition_1.GraphQLList(ListOfScalarsType))).to.equal('"[[Scalar]]"');
    });
    (0, mocha_1.it)('Object.toStringifies types', () => {
        function toString(obj) {
            return Object.prototype.toString.call(obj);
        }
        (0, chai_1.expect)(toString(ScalarType)).to.equal('[object GraphQLScalarType]');
        (0, chai_1.expect)(toString(ObjectType)).to.equal('[object GraphQLObjectType]');
        (0, chai_1.expect)(toString(InterfaceType)).to.equal('[object GraphQLInterfaceType]');
        (0, chai_1.expect)(toString(UnionType)).to.equal('[object GraphQLUnionType]');
        (0, chai_1.expect)(toString(EnumType)).to.equal('[object GraphQLEnumType]');
        (0, chai_1.expect)(toString(InputObjectType)).to.equal('[object GraphQLInputObjectType]');
        (0, chai_1.expect)(toString(NonNullScalarType)).to.equal('[object GraphQLNonNull]');
        (0, chai_1.expect)(toString(ListOfScalarsType)).to.equal('[object GraphQLList]');
    });
});
//# sourceMappingURL=definition-test.js.map