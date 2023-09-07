"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendSchemaImpl = exports.extendSchema = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const inspect_1 = require("../jsutils/inspect");
const invariant_1 = require("../jsutils/invariant");
const keyMap_1 = require("../jsutils/keyMap");
const mapValue_1 = require("../jsutils/mapValue");
const kinds_1 = require("../language/kinds");
const predicates_1 = require("../language/predicates");
const definition_1 = require("../type/definition");
const directives_1 = require("../type/directives");
const introspection_1 = require("../type/introspection");
const scalars_1 = require("../type/scalars");
const schema_1 = require("../type/schema");
const validate_1 = require("../validation/validate");
const values_1 = require("../execution/values");
const valueFromAST_1 = require("./valueFromAST");
/**
 * Produces a new schema given an existing schema and a document which may
 * contain GraphQL type extensions and definitions. The original schema will
 * remain unaltered.
 *
 * Because a schema represents a graph of references, a schema cannot be
 * extended without effectively making an entire copy. We do not know until it's
 * too late if subgraphs remain unchanged.
 *
 * This algorithm copies the provided schema, applying extensions while
 * producing the copy. The original schema remains unaltered.
 */
function extendSchema(schema, documentAST, options) {
    (0, schema_1.assertSchema)(schema);
    (0, devAssert_1.devAssert)(documentAST != null && documentAST.kind === kinds_1.Kind.DOCUMENT, 'Must provide valid Document AST.');
    if ((options === null || options === void 0 ? void 0 : options.assumeValid) !== true && (options === null || options === void 0 ? void 0 : options.assumeValidSDL) !== true) {
        (0, validate_1.assertValidSDLExtension)(documentAST, schema);
    }
    const schemaConfig = schema.toConfig();
    const extendedConfig = extendSchemaImpl(schemaConfig, documentAST, options);
    return schemaConfig === extendedConfig
        ? schema
        : new schema_1.GraphQLSchema(extendedConfig);
}
exports.extendSchema = extendSchema;
/**
 * @internal
 */
function extendSchemaImpl(schemaConfig, documentAST, options) {
    var _a, _b, _c;
    // Collect the type definitions and extensions found in the document.
    const typeDefs = [];
    const typeExtensionsMap = Object.create(null);
    // New directives and types are separate because a directives and types can
    // have the same name. For example, a type named "skip".
    const directiveDefs = [];
    let schemaDef;
    // Schema extensions are collected which may add additional operation types.
    const schemaExtensions = [];
    for (const def of documentAST.definitions) {
        if (def.kind === kinds_1.Kind.SCHEMA_DEFINITION) {
            schemaDef = def;
        }
        else if (def.kind === kinds_1.Kind.SCHEMA_EXTENSION) {
            schemaExtensions.push(def);
        }
        else if ((0, predicates_1.isTypeDefinitionNode)(def)) {
            typeDefs.push(def);
        }
        else if ((0, predicates_1.isTypeExtensionNode)(def)) {
            const extendedTypeName = def.name.value;
            const existingTypeExtensions = typeExtensionsMap[extendedTypeName];
            typeExtensionsMap[extendedTypeName] = existingTypeExtensions
                ? existingTypeExtensions.concat([def])
                : [def];
        }
        else if (def.kind === kinds_1.Kind.DIRECTIVE_DEFINITION) {
            directiveDefs.push(def);
        }
    }
    // If this document contains no new types, extensions, or directives then
    // return the same unmodified GraphQLSchema instance.
    if (Object.keys(typeExtensionsMap).length === 0 &&
        typeDefs.length === 0 &&
        directiveDefs.length === 0 &&
        schemaExtensions.length === 0 &&
        schemaDef == null) {
        return schemaConfig;
    }
    const typeMap = Object.create(null);
    for (const existingType of schemaConfig.types) {
        typeMap[existingType.name] = extendNamedType(existingType);
    }
    for (const typeNode of typeDefs) {
        const name = typeNode.name.value;
        typeMap[name] = (_a = stdTypeMap[name]) !== null && _a !== void 0 ? _a : buildType(typeNode);
    }
    const operationTypes = {
        // Get the extended root operation types.
        query: schemaConfig.query && replaceNamedType(schemaConfig.query),
        mutation: schemaConfig.mutation && replaceNamedType(schemaConfig.mutation),
        subscription: schemaConfig.subscription && replaceNamedType(schemaConfig.subscription),
        // Then, incorporate schema definition and all schema extensions.
        ...(schemaDef && getOperationTypes([schemaDef])),
        ...getOperationTypes(schemaExtensions),
    };
    // Then produce and return a Schema config with these types.
    return {
        description: (_b = schemaDef === null || schemaDef === void 0 ? void 0 : schemaDef.description) === null || _b === void 0 ? void 0 : _b.value,
        ...operationTypes,
        types: Object.values(typeMap),
        directives: [
            ...schemaConfig.directives.map(replaceDirective),
            ...directiveDefs.map(buildDirective),
        ],
        extensions: Object.create(null),
        astNode: schemaDef !== null && schemaDef !== void 0 ? schemaDef : schemaConfig.astNode,
        extensionASTNodes: schemaConfig.extensionASTNodes.concat(schemaExtensions),
        assumeValid: (_c = options === null || options === void 0 ? void 0 : options.assumeValid) !== null && _c !== void 0 ? _c : false,
    };
    // Below are functions used for producing this schema that have closed over
    // this scope and have access to the schema, cache, and newly defined types.
    function replaceType(type) {
        if ((0, definition_1.isListType)(type)) {
            // @ts-expect-error
            return new definition_1.GraphQLList(replaceType(type.ofType));
        }
        if ((0, definition_1.isNonNullType)(type)) {
            // @ts-expect-error
            return new definition_1.GraphQLNonNull(replaceType(type.ofType));
        }
        // @ts-expect-error FIXME
        return replaceNamedType(type);
    }
    function replaceNamedType(type) {
        // Note: While this could make early assertions to get the correctly
        // typed values, that would throw immediately while type system
        // validation with validateSchema() will produce more actionable results.
        return typeMap[type.name];
    }
    function replaceDirective(directive) {
        const config = directive.toConfig();
        return new directives_1.GraphQLDirective({
            ...config,
            args: (0, mapValue_1.mapValue)(config.args, extendArg),
        });
    }
    function extendNamedType(type) {
        if ((0, introspection_1.isIntrospectionType)(type) || (0, scalars_1.isSpecifiedScalarType)(type)) {
            // Builtin types are not extended.
            return type;
        }
        if ((0, definition_1.isScalarType)(type)) {
            return extendScalarType(type);
        }
        if ((0, definition_1.isObjectType)(type)) {
            return extendObjectType(type);
        }
        if ((0, definition_1.isInterfaceType)(type)) {
            return extendInterfaceType(type);
        }
        if ((0, definition_1.isUnionType)(type)) {
            return extendUnionType(type);
        }
        if ((0, definition_1.isEnumType)(type)) {
            return extendEnumType(type);
        }
        if ((0, definition_1.isInputObjectType)(type)) {
            return extendInputObjectType(type);
        }
        /* c8 ignore next 3 */
        // Not reachable, all possible type definition nodes have been considered.
        (0, invariant_1.invariant)(false, 'Unexpected type: ' + (0, inspect_1.inspect)(type));
    }
    function extendInputObjectType(type) {
        var _a;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[config.name]) !== null && _a !== void 0 ? _a : [];
        return new definition_1.GraphQLInputObjectType({
            ...config,
            fields: () => ({
                ...(0, mapValue_1.mapValue)(config.fields, (field) => ({
                    ...field,
                    type: replaceType(field.type),
                })),
                ...buildInputFieldMap(extensions),
            }),
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendEnumType(type) {
        var _a;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[type.name]) !== null && _a !== void 0 ? _a : [];
        return new definition_1.GraphQLEnumType({
            ...config,
            values: {
                ...config.values,
                ...buildEnumValueMap(extensions),
            },
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendScalarType(type) {
        var _a, _b;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[config.name]) !== null && _a !== void 0 ? _a : [];
        let specifiedByURL = config.specifiedByURL;
        for (const extensionNode of extensions) {
            specifiedByURL = (_b = getSpecifiedByURL(extensionNode)) !== null && _b !== void 0 ? _b : specifiedByURL;
        }
        return new definition_1.GraphQLScalarType({
            ...config,
            specifiedByURL,
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendObjectType(type) {
        var _a;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[config.name]) !== null && _a !== void 0 ? _a : [];
        return new definition_1.GraphQLObjectType({
            ...config,
            interfaces: () => [
                ...type.getInterfaces().map(replaceNamedType),
                ...buildInterfaces(extensions),
            ],
            fields: () => ({
                ...(0, mapValue_1.mapValue)(config.fields, extendField),
                ...buildFieldMap(extensions),
            }),
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendInterfaceType(type) {
        var _a;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[config.name]) !== null && _a !== void 0 ? _a : [];
        return new definition_1.GraphQLInterfaceType({
            ...config,
            interfaces: () => [
                ...type.getInterfaces().map(replaceNamedType),
                ...buildInterfaces(extensions),
            ],
            fields: () => ({
                ...(0, mapValue_1.mapValue)(config.fields, extendField),
                ...buildFieldMap(extensions),
            }),
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendUnionType(type) {
        var _a;
        const config = type.toConfig();
        const extensions = (_a = typeExtensionsMap[config.name]) !== null && _a !== void 0 ? _a : [];
        return new definition_1.GraphQLUnionType({
            ...config,
            types: () => [
                ...type.getTypes().map(replaceNamedType),
                ...buildUnionTypes(extensions),
            ],
            extensionASTNodes: config.extensionASTNodes.concat(extensions),
        });
    }
    function extendField(field) {
        return {
            ...field,
            type: replaceType(field.type),
            args: field.args && (0, mapValue_1.mapValue)(field.args, extendArg),
        };
    }
    function extendArg(arg) {
        return {
            ...arg,
            type: replaceType(arg.type),
        };
    }
    function getOperationTypes(nodes) {
        var _a;
        const opTypes = {};
        for (const node of nodes) {
            // FIXME: https://github.com/graphql/graphql-js/issues/2203
            const operationTypesNodes = 
            /* c8 ignore next */ (_a = node.operationTypes) !== null && _a !== void 0 ? _a : [];
            for (const operationType of operationTypesNodes) {
                // Note: While this could make early assertions to get the correctly
                // typed values below, that would throw immediately while type system
                // validation with validateSchema() will produce more actionable results.
                // @ts-expect-error
                opTypes[operationType.operation] = getNamedType(operationType.type);
            }
        }
        return opTypes;
    }
    function getNamedType(node) {
        var _a;
        const name = node.name.value;
        const type = (_a = stdTypeMap[name]) !== null && _a !== void 0 ? _a : typeMap[name];
        if (type === undefined) {
            throw new Error(`Unknown type: "${name}".`);
        }
        return type;
    }
    function getWrappedType(node) {
        if (node.kind === kinds_1.Kind.LIST_TYPE) {
            return new definition_1.GraphQLList(getWrappedType(node.type));
        }
        if (node.kind === kinds_1.Kind.NON_NULL_TYPE) {
            return new definition_1.GraphQLNonNull(getWrappedType(node.type));
        }
        return getNamedType(node);
    }
    function buildDirective(node) {
        var _a;
        return new directives_1.GraphQLDirective({
            name: node.name.value,
            description: (_a = node.description) === null || _a === void 0 ? void 0 : _a.value,
            // @ts-expect-error
            locations: node.locations.map(({ value }) => value),
            isRepeatable: node.repeatable,
            args: buildArgumentMap(node.arguments),
            astNode: node,
        });
    }
    function buildFieldMap(nodes) {
        var _a, _b;
        const fieldConfigMap = Object.create(null);
        for (const node of nodes) {
            // FIXME: https://github.com/graphql/graphql-js/issues/2203
            const nodeFields = /* c8 ignore next */ (_a = node.fields) !== null && _a !== void 0 ? _a : [];
            for (const field of nodeFields) {
                fieldConfigMap[field.name.value] = {
                    // Note: While this could make assertions to get the correctly typed
                    // value, that would throw immediately while type system validation
                    // with validateSchema() will produce more actionable results.
                    type: getWrappedType(field.type),
                    description: (_b = field.description) === null || _b === void 0 ? void 0 : _b.value,
                    args: buildArgumentMap(field.arguments),
                    deprecationReason: getDeprecationReason(field),
                    astNode: field,
                };
            }
        }
        return fieldConfigMap;
    }
    function buildArgumentMap(args) {
        var _a;
        // FIXME: https://github.com/graphql/graphql-js/issues/2203
        const argsNodes = /* c8 ignore next */ args !== null && args !== void 0 ? args : [];
        const argConfigMap = Object.create(null);
        for (const arg of argsNodes) {
            // Note: While this could make assertions to get the correctly typed
            // value, that would throw immediately while type system validation
            // with validateSchema() will produce more actionable results.
            const type = getWrappedType(arg.type);
            argConfigMap[arg.name.value] = {
                type,
                description: (_a = arg.description) === null || _a === void 0 ? void 0 : _a.value,
                defaultValue: (0, valueFromAST_1.valueFromAST)(arg.defaultValue, type),
                deprecationReason: getDeprecationReason(arg),
                astNode: arg,
            };
        }
        return argConfigMap;
    }
    function buildInputFieldMap(nodes) {
        var _a, _b;
        const inputFieldMap = Object.create(null);
        for (const node of nodes) {
            // FIXME: https://github.com/graphql/graphql-js/issues/2203
            const fieldsNodes = /* c8 ignore next */ (_a = node.fields) !== null && _a !== void 0 ? _a : [];
            for (const field of fieldsNodes) {
                // Note: While this could make assertions to get the correctly typed
                // value, that would throw immediately while type system validation
                // with validateSchema() will produce more actionable results.
                const type = getWrappedType(field.type);
                inputFieldMap[field.name.value] = {
                    type,
                    description: (_b = field.description) === null || _b === void 0 ? void 0 : _b.value,
                    defaultValue: (0, valueFromAST_1.valueFromAST)(field.defaultValue, type),
                    deprecationReason: getDeprecationReason(field),
                    astNode: field,
                };
            }
        }
        return inputFieldMap;
    }
    function buildEnumValueMap(nodes) {
        var _a, _b;
        const enumValueMap = Object.create(null);
        for (const node of nodes) {
            // FIXME: https://github.com/graphql/graphql-js/issues/2203
            const valuesNodes = /* c8 ignore next */ (_a = node.values) !== null && _a !== void 0 ? _a : [];
            for (const value of valuesNodes) {
                enumValueMap[value.name.value] = {
                    description: (_b = value.description) === null || _b === void 0 ? void 0 : _b.value,
                    deprecationReason: getDeprecationReason(value),
                    astNode: value,
                };
            }
        }
        return enumValueMap;
    }
    function buildInterfaces(nodes) {
        // Note: While this could make assertions to get the correctly typed
        // values below, that would throw immediately while type system
        // validation with validateSchema() will produce more actionable results.
        // @ts-expect-error
        return nodes.flatMap(
        // FIXME: https://github.com/graphql/graphql-js/issues/2203
        (node) => /* c8 ignore next */ { var _a, _b; /* c8 ignore next */ return (_b = (_a = node.interfaces) === null || _a === void 0 ? void 0 : _a.map(getNamedType)) !== null && _b !== void 0 ? _b : []; });
    }
    function buildUnionTypes(nodes) {
        // Note: While this could make assertions to get the correctly typed
        // values below, that would throw immediately while type system
        // validation with validateSchema() will produce more actionable results.
        // @ts-expect-error
        return nodes.flatMap(
        // FIXME: https://github.com/graphql/graphql-js/issues/2203
        (node) => /* c8 ignore next */ { var _a, _b; /* c8 ignore next */ return (_b = (_a = node.types) === null || _a === void 0 ? void 0 : _a.map(getNamedType)) !== null && _b !== void 0 ? _b : []; });
    }
    function buildType(astNode) {
        var _a, _b, _c, _d, _e, _f, _g;
        const name = astNode.name.value;
        const extensionASTNodes = (_a = typeExtensionsMap[name]) !== null && _a !== void 0 ? _a : [];
        switch (astNode.kind) {
            case kinds_1.Kind.OBJECT_TYPE_DEFINITION: {
                const allNodes = [astNode, ...extensionASTNodes];
                return new definition_1.GraphQLObjectType({
                    name,
                    description: (_b = astNode.description) === null || _b === void 0 ? void 0 : _b.value,
                    interfaces: () => buildInterfaces(allNodes),
                    fields: () => buildFieldMap(allNodes),
                    astNode,
                    extensionASTNodes,
                });
            }
            case kinds_1.Kind.INTERFACE_TYPE_DEFINITION: {
                const allNodes = [astNode, ...extensionASTNodes];
                return new definition_1.GraphQLInterfaceType({
                    name,
                    description: (_c = astNode.description) === null || _c === void 0 ? void 0 : _c.value,
                    interfaces: () => buildInterfaces(allNodes),
                    fields: () => buildFieldMap(allNodes),
                    astNode,
                    extensionASTNodes,
                });
            }
            case kinds_1.Kind.ENUM_TYPE_DEFINITION: {
                const allNodes = [astNode, ...extensionASTNodes];
                return new definition_1.GraphQLEnumType({
                    name,
                    description: (_d = astNode.description) === null || _d === void 0 ? void 0 : _d.value,
                    values: buildEnumValueMap(allNodes),
                    astNode,
                    extensionASTNodes,
                });
            }
            case kinds_1.Kind.UNION_TYPE_DEFINITION: {
                const allNodes = [astNode, ...extensionASTNodes];
                return new definition_1.GraphQLUnionType({
                    name,
                    description: (_e = astNode.description) === null || _e === void 0 ? void 0 : _e.value,
                    types: () => buildUnionTypes(allNodes),
                    astNode,
                    extensionASTNodes,
                });
            }
            case kinds_1.Kind.SCALAR_TYPE_DEFINITION: {
                return new definition_1.GraphQLScalarType({
                    name,
                    description: (_f = astNode.description) === null || _f === void 0 ? void 0 : _f.value,
                    specifiedByURL: getSpecifiedByURL(astNode),
                    astNode,
                    extensionASTNodes,
                });
            }
            case kinds_1.Kind.INPUT_OBJECT_TYPE_DEFINITION: {
                const allNodes = [astNode, ...extensionASTNodes];
                return new definition_1.GraphQLInputObjectType({
                    name,
                    description: (_g = astNode.description) === null || _g === void 0 ? void 0 : _g.value,
                    fields: () => buildInputFieldMap(allNodes),
                    astNode,
                    extensionASTNodes,
                });
            }
        }
    }
}
exports.extendSchemaImpl = extendSchemaImpl;
const stdTypeMap = (0, keyMap_1.keyMap)([...scalars_1.specifiedScalarTypes, ...introspection_1.introspectionTypes], (type) => type.name);
/**
 * Given a field or enum value node, returns the string value for the
 * deprecation reason.
 */
function getDeprecationReason(node) {
    const deprecated = (0, values_1.getDirectiveValues)(directives_1.GraphQLDeprecatedDirective, node);
    // @ts-expect-error validated by `getDirectiveValues`
    return deprecated === null || deprecated === void 0 ? void 0 : deprecated.reason;
}
/**
 * Given a scalar node, returns the string value for the specifiedByURL.
 */
function getSpecifiedByURL(node) {
    const specifiedBy = (0, values_1.getDirectiveValues)(directives_1.GraphQLSpecifiedByDirective, node);
    // @ts-expect-error validated by `getDirectiveValues`
    return specifiedBy === null || specifiedBy === void 0 ? void 0 : specifiedBy.url;
}
//# sourceMappingURL=extendSchema.js.map