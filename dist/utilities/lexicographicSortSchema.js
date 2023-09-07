"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lexicographicSortSchema = void 0;
const inspect_1 = require("../jsutils/inspect");
const invariant_1 = require("../jsutils/invariant");
const keyValMap_1 = require("../jsutils/keyValMap");
const naturalCompare_1 = require("../jsutils/naturalCompare");
const definition_1 = require("../type/definition");
const directives_1 = require("../type/directives");
const introspection_1 = require("../type/introspection");
const schema_1 = require("../type/schema");
/**
 * Sort GraphQLSchema.
 *
 * This function returns a sorted copy of the given GraphQLSchema.
 */
function lexicographicSortSchema(schema) {
    const schemaConfig = schema.toConfig();
    const typeMap = (0, keyValMap_1.keyValMap)(sortByName(schemaConfig.types), (type) => type.name, sortNamedType);
    return new schema_1.GraphQLSchema({
        ...schemaConfig,
        types: Object.values(typeMap),
        directives: sortByName(schemaConfig.directives).map(sortDirective),
        query: replaceMaybeType(schemaConfig.query),
        mutation: replaceMaybeType(schemaConfig.mutation),
        subscription: replaceMaybeType(schemaConfig.subscription),
    });
    function replaceType(type) {
        if ((0, definition_1.isListType)(type)) {
            // @ts-expect-error
            return new definition_1.GraphQLList(replaceType(type.ofType));
        }
        else if ((0, definition_1.isNonNullType)(type)) {
            // @ts-expect-error
            return new definition_1.GraphQLNonNull(replaceType(type.ofType));
        }
        // @ts-expect-error FIXME: TS Conversion
        return replaceNamedType(type);
    }
    function replaceNamedType(type) {
        return typeMap[type.name];
    }
    function replaceMaybeType(maybeType) {
        return maybeType && replaceNamedType(maybeType);
    }
    function sortDirective(directive) {
        const config = directive.toConfig();
        return new directives_1.GraphQLDirective({
            ...config,
            locations: sortBy(config.locations, (x) => x),
            args: sortArgs(config.args),
        });
    }
    function sortArgs(args) {
        return sortObjMap(args, (arg) => ({
            ...arg,
            type: replaceType(arg.type),
        }));
    }
    function sortFields(fieldsMap) {
        return sortObjMap(fieldsMap, (field) => ({
            ...field,
            type: replaceType(field.type),
            args: field.args && sortArgs(field.args),
        }));
    }
    function sortInputFields(fieldsMap) {
        return sortObjMap(fieldsMap, (field) => ({
            ...field,
            type: replaceType(field.type),
        }));
    }
    function sortTypes(array) {
        return sortByName(array).map(replaceNamedType);
    }
    function sortNamedType(type) {
        if ((0, definition_1.isScalarType)(type) || (0, introspection_1.isIntrospectionType)(type)) {
            return type;
        }
        if ((0, definition_1.isObjectType)(type)) {
            const config = type.toConfig();
            return new definition_1.GraphQLObjectType({
                ...config,
                interfaces: () => sortTypes(config.interfaces),
                fields: () => sortFields(config.fields),
            });
        }
        if ((0, definition_1.isInterfaceType)(type)) {
            const config = type.toConfig();
            return new definition_1.GraphQLInterfaceType({
                ...config,
                interfaces: () => sortTypes(config.interfaces),
                fields: () => sortFields(config.fields),
            });
        }
        if ((0, definition_1.isUnionType)(type)) {
            const config = type.toConfig();
            return new definition_1.GraphQLUnionType({
                ...config,
                types: () => sortTypes(config.types),
            });
        }
        if ((0, definition_1.isEnumType)(type)) {
            const config = type.toConfig();
            return new definition_1.GraphQLEnumType({
                ...config,
                values: sortObjMap(config.values, (value) => value),
            });
        }
        if ((0, definition_1.isInputObjectType)(type)) {
            const config = type.toConfig();
            return new definition_1.GraphQLInputObjectType({
                ...config,
                fields: () => sortInputFields(config.fields),
            });
        }
        /* c8 ignore next 3 */
        // Not reachable, all possible types have been considered.
        (0, invariant_1.invariant)(false, 'Unexpected type: ' + (0, inspect_1.inspect)(type));
    }
}
exports.lexicographicSortSchema = lexicographicSortSchema;
function sortObjMap(map, sortValueFn) {
    const sortedMap = Object.create(null);
    for (const key of Object.keys(map).sort(naturalCompare_1.naturalCompare)) {
        sortedMap[key] = sortValueFn(map[key]);
    }
    return sortedMap;
}
function sortByName(array) {
    return sortBy(array, (obj) => obj.name);
}
function sortBy(array, mapToKey) {
    return array.slice().sort((obj1, obj2) => {
        const key1 = mapToKey(obj1);
        const key2 = mapToKey(obj2);
        return (0, naturalCompare_1.naturalCompare)(key1, key2);
    });
}
//# sourceMappingURL=lexicographicSortSchema.js.map