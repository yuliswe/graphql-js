"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const invariant_1 = require("../../jsutils/invariant");
const definition_1 = require("../definition");
const directives_1 = require("../directives");
const schema_1 = require("../schema");
const dummyType = new definition_1.GraphQLScalarType({ name: 'DummyScalar' });
function expectObjMap(value) {
    (0, invariant_1.invariant)(value != null && typeof value === 'object');
    (0, chai_1.expect)(Object.getPrototypeOf(value)).to.equal(null);
    return (0, chai_1.expect)(value);
}
(0, mocha_1.describe)('Type System: Extensions', () => {
    (0, mocha_1.describe)('GraphQLScalarType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someScalar = new definition_1.GraphQLScalarType({ name: 'SomeScalar' });
            (0, chai_1.expect)(someScalar.extensions).to.deep.equal({});
            const config = someScalar.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const scalarExtensions = Object.freeze({ SomeScalarExt: 'scalar' });
            const someScalar = new definition_1.GraphQLScalarType({
                name: 'SomeScalar',
                extensions: scalarExtensions,
            });
            expectObjMap(someScalar.extensions).to.deep.equal(scalarExtensions);
            const config = someScalar.toConfig();
            expectObjMap(config.extensions).to.deep.equal(scalarExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLObjectType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someObject = new definition_1.GraphQLObjectType({
                name: 'SomeObject',
                fields: {
                    someField: {
                        type: dummyType,
                        args: {
                            someArg: {
                                type: dummyType,
                            },
                        },
                    },
                },
            });
            (0, chai_1.expect)(someObject.extensions).to.deep.equal({});
            const someField = someObject.getFields().someField;
            (0, chai_1.expect)(someField.extensions).to.deep.equal({});
            const someArg = someField.args[0];
            (0, chai_1.expect)(someArg.extensions).to.deep.equal({});
            const config = someObject.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
            const someFieldConfig = config.fields.someField;
            (0, chai_1.expect)(someFieldConfig.extensions).to.deep.equal({});
            (0, invariant_1.invariant)(someFieldConfig.args);
            const someArgConfig = someFieldConfig.args.someArg;
            (0, chai_1.expect)(someArgConfig.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const objectExtensions = Object.freeze({ SomeObjectExt: 'object' });
            const fieldExtensions = Object.freeze({ SomeFieldExt: 'field' });
            const argExtensions = Object.freeze({ SomeArgExt: 'arg' });
            const someObject = new definition_1.GraphQLObjectType({
                name: 'SomeObject',
                fields: {
                    someField: {
                        type: dummyType,
                        args: {
                            someArg: {
                                type: dummyType,
                                extensions: argExtensions,
                            },
                        },
                        extensions: fieldExtensions,
                    },
                },
                extensions: objectExtensions,
            });
            expectObjMap(someObject.extensions).to.deep.equal(objectExtensions);
            const someField = someObject.getFields().someField;
            expectObjMap(someField.extensions).to.deep.equal(fieldExtensions);
            const someArg = someField.args[0];
            expectObjMap(someArg.extensions).to.deep.equal(argExtensions);
            const config = someObject.toConfig();
            expectObjMap(config.extensions).to.deep.equal(objectExtensions);
            const someFieldConfig = config.fields.someField;
            expectObjMap(someFieldConfig.extensions).to.deep.equal(fieldExtensions);
            (0, invariant_1.invariant)(someFieldConfig.args);
            const someArgConfig = someFieldConfig.args.someArg;
            expectObjMap(someArgConfig.extensions).to.deep.equal(argExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLInterfaceType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someInterface = new definition_1.GraphQLInterfaceType({
                name: 'SomeInterface',
                fields: {
                    someField: {
                        type: dummyType,
                        args: {
                            someArg: {
                                type: dummyType,
                            },
                        },
                    },
                },
            });
            (0, chai_1.expect)(someInterface.extensions).to.deep.equal({});
            const someField = someInterface.getFields().someField;
            (0, chai_1.expect)(someField.extensions).to.deep.equal({});
            const someArg = someField.args[0];
            (0, chai_1.expect)(someArg.extensions).to.deep.equal({});
            const config = someInterface.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
            const someFieldConfig = config.fields.someField;
            (0, chai_1.expect)(someFieldConfig.extensions).to.deep.equal({});
            (0, invariant_1.invariant)(someFieldConfig.args);
            const someArgConfig = someFieldConfig.args.someArg;
            (0, chai_1.expect)(someArgConfig.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const interfaceExtensions = Object.freeze({
                SomeInterfaceExt: 'interface',
            });
            const fieldExtensions = Object.freeze({ SomeFieldExt: 'field' });
            const argExtensions = Object.freeze({ SomeArgExt: 'arg' });
            const someInterface = new definition_1.GraphQLInterfaceType({
                name: 'SomeInterface',
                fields: {
                    someField: {
                        type: dummyType,
                        args: {
                            someArg: {
                                type: dummyType,
                                extensions: argExtensions,
                            },
                        },
                        extensions: fieldExtensions,
                    },
                },
                extensions: interfaceExtensions,
            });
            expectObjMap(someInterface.extensions).to.deep.equal(interfaceExtensions);
            const someField = someInterface.getFields().someField;
            expectObjMap(someField.extensions).to.deep.equal(fieldExtensions);
            const someArg = someField.args[0];
            expectObjMap(someArg.extensions).to.deep.equal(argExtensions);
            const config = someInterface.toConfig();
            expectObjMap(config.extensions).to.deep.equal(interfaceExtensions);
            const someFieldConfig = config.fields.someField;
            expectObjMap(someFieldConfig.extensions).to.deep.equal(fieldExtensions);
            (0, invariant_1.invariant)(someFieldConfig.args);
            const someArgConfig = someFieldConfig.args.someArg;
            expectObjMap(someArgConfig.extensions).to.deep.equal(argExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLUnionType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someUnion = new definition_1.GraphQLUnionType({
                name: 'SomeUnion',
                types: [],
            });
            (0, chai_1.expect)(someUnion.extensions).to.deep.equal({});
            const config = someUnion.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const unionExtensions = Object.freeze({ SomeUnionExt: 'union' });
            const someUnion = new definition_1.GraphQLUnionType({
                name: 'SomeUnion',
                types: [],
                extensions: unionExtensions,
            });
            expectObjMap(someUnion.extensions).to.deep.equal(unionExtensions);
            const config = someUnion.toConfig();
            expectObjMap(config.extensions).to.deep.equal(unionExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLEnumType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someEnum = new definition_1.GraphQLEnumType({
                name: 'SomeEnum',
                values: {
                    SOME_VALUE: {},
                },
            });
            (0, chai_1.expect)(someEnum.extensions).to.deep.equal({});
            const someValue = someEnum.getValues()[0];
            (0, chai_1.expect)(someValue.extensions).to.deep.equal({});
            const config = someEnum.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
            const someValueConfig = config.values.SOME_VALUE;
            (0, chai_1.expect)(someValueConfig.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const enumExtensions = Object.freeze({ SomeEnumExt: 'enum' });
            const valueExtensions = Object.freeze({ SomeValueExt: 'value' });
            const someEnum = new definition_1.GraphQLEnumType({
                name: 'SomeEnum',
                values: {
                    SOME_VALUE: {
                        extensions: valueExtensions,
                    },
                },
                extensions: enumExtensions,
            });
            expectObjMap(someEnum.extensions).to.deep.equal(enumExtensions);
            const someValue = someEnum.getValues()[0];
            expectObjMap(someValue.extensions).to.deep.equal(valueExtensions);
            const config = someEnum.toConfig();
            expectObjMap(config.extensions).to.deep.equal(enumExtensions);
            const someValueConfig = config.values.SOME_VALUE;
            expectObjMap(someValueConfig.extensions).to.deep.equal(valueExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLInputObjectType', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someInputObject = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    someInputField: {
                        type: dummyType,
                    },
                },
            });
            (0, chai_1.expect)(someInputObject.extensions).to.deep.equal({});
            const someInputField = someInputObject.getFields().someInputField;
            (0, chai_1.expect)(someInputField.extensions).to.deep.equal({});
            const config = someInputObject.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
            const someInputFieldConfig = config.fields.someInputField;
            (0, chai_1.expect)(someInputFieldConfig.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const inputObjectExtensions = Object.freeze({
                SomeInputObjectExt: 'inputObject',
            });
            const inputFieldExtensions = Object.freeze({
                SomeInputFieldExt: 'inputField',
            });
            const someInputObject = new definition_1.GraphQLInputObjectType({
                name: 'SomeInputObject',
                fields: {
                    someInputField: {
                        type: dummyType,
                        extensions: inputFieldExtensions,
                    },
                },
                extensions: inputObjectExtensions,
            });
            expectObjMap(someInputObject.extensions).to.deep.equal(inputObjectExtensions);
            const someInputField = someInputObject.getFields().someInputField;
            expectObjMap(someInputField.extensions).to.deep.equal(inputFieldExtensions);
            const config = someInputObject.toConfig();
            expectObjMap(config.extensions).to.deep.equal(inputObjectExtensions);
            const someInputFieldConfig = config.fields.someInputField;
            expectObjMap(someInputFieldConfig.extensions).to.deep.equal(inputFieldExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLDirective', () => {
        (0, mocha_1.it)('without extensions', () => {
            const someDirective = new directives_1.GraphQLDirective({
                name: 'SomeDirective',
                args: {
                    someArg: {
                        type: dummyType,
                    },
                },
                locations: [],
            });
            (0, chai_1.expect)(someDirective.extensions).to.deep.equal({});
            const someArg = someDirective.args[0];
            (0, chai_1.expect)(someArg.extensions).to.deep.equal({});
            const config = someDirective.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
            const someArgConfig = config.args.someArg;
            (0, chai_1.expect)(someArgConfig.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const directiveExtensions = Object.freeze({
                SomeDirectiveExt: 'directive',
            });
            const argExtensions = Object.freeze({ SomeArgExt: 'arg' });
            const someDirective = new directives_1.GraphQLDirective({
                name: 'SomeDirective',
                args: {
                    someArg: {
                        type: dummyType,
                        extensions: argExtensions,
                    },
                },
                locations: [],
                extensions: directiveExtensions,
            });
            expectObjMap(someDirective.extensions).to.deep.equal(directiveExtensions);
            const someArg = someDirective.args[0];
            expectObjMap(someArg.extensions).to.deep.equal(argExtensions);
            const config = someDirective.toConfig();
            expectObjMap(config.extensions).to.deep.equal(directiveExtensions);
            const someArgConfig = config.args.someArg;
            expectObjMap(someArgConfig.extensions).to.deep.equal(argExtensions);
        });
    });
    (0, mocha_1.describe)('GraphQLSchema', () => {
        (0, mocha_1.it)('without extensions', () => {
            const schema = new schema_1.GraphQLSchema({});
            (0, chai_1.expect)(schema.extensions).to.deep.equal({});
            const config = schema.toConfig();
            (0, chai_1.expect)(config.extensions).to.deep.equal({});
        });
        (0, mocha_1.it)('with extensions', () => {
            const schemaExtensions = Object.freeze({
                schemaExtension: 'schema',
            });
            const schema = new schema_1.GraphQLSchema({ extensions: schemaExtensions });
            expectObjMap(schema.extensions).to.deep.equal(schemaExtensions);
            const config = schema.toConfig();
            expectObjMap(config.extensions).to.deep.equal(schemaExtensions);
        });
    });
});
//# sourceMappingURL=extensions-test.js.map