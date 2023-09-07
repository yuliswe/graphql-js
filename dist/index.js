"use strict";
/**
 * GraphQL.js provides a reference implementation for the GraphQL specification
 * but is also a useful utility for operating on GraphQL files and building
 * sophisticated tools.
 *
 * This primary module exports a general purpose function for fulfilling all
 * steps of the GraphQL specification in a single operation, but also includes
 * utilities for every part of the GraphQL specification:
 *
 *   - Parsing the GraphQL language.
 *   - Building a GraphQL type schema.
 *   - Validating a GraphQL request against a type schema.
 *   - Executing a GraphQL request against a type schema.
 *
 * This also includes utility functions for operating on GraphQL types and
 * GraphQL documents to facilitate building tools.
 *
 * You may also import from each sub-directory directly. For example, the
 * following two import statements are equivalent:
 *
 * ```ts
 * import { parse } from 'graphql';
 * import { parse } from 'graphql/language';
 * ```
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnionType = exports.isInterfaceType = exports.isObjectType = exports.isScalarType = exports.isType = exports.isDirective = exports.isSchema = exports.TypeNameMetaFieldDef = exports.TypeMetaFieldDef = exports.SchemaMetaFieldDef = exports.__TypeKind = exports.__EnumValue = exports.__InputValue = exports.__Field = exports.__Type = exports.__DirectiveLocation = exports.__Directive = exports.__Schema = exports.introspectionTypes = exports.DEFAULT_DEPRECATION_REASON = exports.TypeKind = exports.GraphQLSpecifiedByDirective = exports.GraphQLDeprecatedDirective = exports.GraphQLSkipDirective = exports.GraphQLIncludeDirective = exports.specifiedDirectives = exports.GRAPHQL_MIN_INT = exports.GRAPHQL_MAX_INT = exports.GraphQLID = exports.GraphQLBoolean = exports.GraphQLString = exports.GraphQLFloat = exports.GraphQLInt = exports.specifiedScalarTypes = exports.GraphQLNonNull = exports.GraphQLList = exports.GraphQLInputObjectType = exports.GraphQLEnumType = exports.GraphQLUnionType = exports.GraphQLInterfaceType = exports.GraphQLObjectType = exports.GraphQLScalarType = exports.GraphQLDirective = exports.GraphQLSchema = exports.resolveReadonlyArrayThunk = exports.resolveObjMapThunk = exports.graphqlSync = exports.graphql = exports.versionInfo = exports.version = void 0;
exports.Lexer = exports.printSourceLocation = exports.printLocation = exports.getLocation = exports.OperationTypeNode = exports.Location = exports.Source = exports.Token = exports.assertEnumValueName = exports.assertName = exports.assertValidSchema = exports.validateSchema = exports.getNamedType = exports.getNullableType = exports.assertNamedType = exports.assertNullableType = exports.assertWrappingType = exports.assertAbstractType = exports.assertCompositeType = exports.assertLeafType = exports.assertOutputType = exports.assertInputType = exports.assertNonNullType = exports.assertListType = exports.assertInputObjectType = exports.assertEnumType = exports.assertUnionType = exports.assertInterfaceType = exports.assertObjectType = exports.assertScalarType = exports.assertType = exports.assertDirective = exports.assertSchema = exports.isSpecifiedDirective = exports.isIntrospectionType = exports.isSpecifiedScalarType = exports.isRequiredInputField = exports.isRequiredArgument = exports.isNamedType = exports.isNullableType = exports.isWrappingType = exports.isAbstractType = exports.isCompositeType = exports.isLeafType = exports.isOutputType = exports.isInputType = exports.isNonNullType = exports.isListType = exports.isInputObjectType = exports.isEnumType = void 0;
exports.PossibleFragmentSpreadsRule = exports.OverlappingFieldsCanBeMergedRule = exports.NoUnusedVariablesRule = exports.NoUnusedFragmentsRule = exports.NoUndefinedVariablesRule = exports.NoFragmentCyclesRule = exports.LoneAnonymousOperationRule = exports.KnownTypeNamesRule = exports.KnownFragmentNamesRule = exports.KnownDirectivesRule = exports.KnownArgumentNamesRule = exports.FragmentsOnCompositeTypesRule = exports.FieldsOnCorrectTypeRule = exports.ExecutableDefinitionsRule = exports.specifiedRules = exports.ValidationContext = exports.validate = exports.createSourceEventStream = exports.subscribe = exports.getDirectiveValues = exports.getVariableValues = exports.getArgumentValues = exports.responsePathAsArray = exports.defaultTypeResolver = exports.defaultFieldResolver = exports.executeSync = exports.execute = exports.isTypeExtensionNode = exports.isTypeSystemExtensionNode = exports.isTypeDefinitionNode = exports.isTypeSystemDefinitionNode = exports.isTypeNode = exports.isConstValueNode = exports.isValueNode = exports.isSelectionNode = exports.isExecutableDefinitionNode = exports.isDefinitionNode = exports.DirectiveLocation = exports.Kind = exports.BREAK = exports.getEnterLeaveForKind = exports.getVisitFn = exports.visitInParallel = exports.visit = exports.print = exports.parseType = exports.parseConstValue = exports.parseValue = exports.parse = exports.TokenKind = void 0;
exports.isEqualType = exports.stripIgnoredCharacters = exports.separateOperations = exports.concatAST = exports.coerceInputValue = exports.visitWithTypeInfo = exports.TypeInfo = exports.astFromValue = exports.valueFromASTUntyped = exports.valueFromAST = exports.typeFromAST = exports.printIntrospectionSchema = exports.printType = exports.printSchema = exports.lexicographicSortSchema = exports.extendSchema = exports.buildSchema = exports.buildASTSchema = exports.buildClientSchema = exports.introspectionFromSchema = exports.getOperationRootType = exports.getOperationAST = exports.getIntrospectionQuery = exports.formatError = exports.printError = exports.locatedError = exports.syntaxError = exports.GraphQLError = exports.NoSchemaIntrospectionCustomRule = exports.NoDeprecatedCustomRule = exports.PossibleTypeExtensionsRule = exports.UniqueDirectiveNamesRule = exports.UniqueArgumentDefinitionNamesRule = exports.UniqueFieldDefinitionNamesRule = exports.UniqueEnumValueNamesRule = exports.UniqueTypeNamesRule = exports.UniqueOperationTypesRule = exports.LoneSchemaDefinitionRule = exports.VariablesInAllowedPositionRule = exports.VariablesAreInputTypesRule = exports.ValuesOfCorrectTypeRule = exports.UniqueVariableNamesRule = exports.UniqueOperationNamesRule = exports.UniqueInputFieldNamesRule = exports.UniqueFragmentNamesRule = exports.UniqueDirectivesPerLocationRule = exports.UniqueArgumentNamesRule = exports.SingleFieldSubscriptionsRule = exports.ScalarLeafsRule = exports.ProvidedRequiredArgumentsRule = void 0;
exports.findDangerousChanges = exports.findBreakingChanges = exports.DangerousChangeType = exports.BreakingChangeType = exports.isValidNameError = exports.assertValidName = exports.doTypesOverlap = exports.isTypeSubTypeOf = void 0;
// The GraphQL.js version info.
var version_1 = require("./version");
Object.defineProperty(exports, "version", { enumerable: true, get: function () { return version_1.version; } });
Object.defineProperty(exports, "versionInfo", { enumerable: true, get: function () { return version_1.versionInfo; } });
var graphql_1 = require("./graphql");
Object.defineProperty(exports, "graphql", { enumerable: true, get: function () { return graphql_1.graphql; } });
Object.defineProperty(exports, "graphqlSync", { enumerable: true, get: function () { return graphql_1.graphqlSync; } });
// Create and operate on GraphQL type definitions and schema.
var index_1 = require("./type/index");
Object.defineProperty(exports, "resolveObjMapThunk", { enumerable: true, get: function () { return index_1.resolveObjMapThunk; } });
Object.defineProperty(exports, "resolveReadonlyArrayThunk", { enumerable: true, get: function () { return index_1.resolveReadonlyArrayThunk; } });
// Definitions
Object.defineProperty(exports, "GraphQLSchema", { enumerable: true, get: function () { return index_1.GraphQLSchema; } });
Object.defineProperty(exports, "GraphQLDirective", { enumerable: true, get: function () { return index_1.GraphQLDirective; } });
Object.defineProperty(exports, "GraphQLScalarType", { enumerable: true, get: function () { return index_1.GraphQLScalarType; } });
Object.defineProperty(exports, "GraphQLObjectType", { enumerable: true, get: function () { return index_1.GraphQLObjectType; } });
Object.defineProperty(exports, "GraphQLInterfaceType", { enumerable: true, get: function () { return index_1.GraphQLInterfaceType; } });
Object.defineProperty(exports, "GraphQLUnionType", { enumerable: true, get: function () { return index_1.GraphQLUnionType; } });
Object.defineProperty(exports, "GraphQLEnumType", { enumerable: true, get: function () { return index_1.GraphQLEnumType; } });
Object.defineProperty(exports, "GraphQLInputObjectType", { enumerable: true, get: function () { return index_1.GraphQLInputObjectType; } });
Object.defineProperty(exports, "GraphQLList", { enumerable: true, get: function () { return index_1.GraphQLList; } });
Object.defineProperty(exports, "GraphQLNonNull", { enumerable: true, get: function () { return index_1.GraphQLNonNull; } });
// Standard GraphQL Scalars
Object.defineProperty(exports, "specifiedScalarTypes", { enumerable: true, get: function () { return index_1.specifiedScalarTypes; } });
Object.defineProperty(exports, "GraphQLInt", { enumerable: true, get: function () { return index_1.GraphQLInt; } });
Object.defineProperty(exports, "GraphQLFloat", { enumerable: true, get: function () { return index_1.GraphQLFloat; } });
Object.defineProperty(exports, "GraphQLString", { enumerable: true, get: function () { return index_1.GraphQLString; } });
Object.defineProperty(exports, "GraphQLBoolean", { enumerable: true, get: function () { return index_1.GraphQLBoolean; } });
Object.defineProperty(exports, "GraphQLID", { enumerable: true, get: function () { return index_1.GraphQLID; } });
// Int boundaries constants
Object.defineProperty(exports, "GRAPHQL_MAX_INT", { enumerable: true, get: function () { return index_1.GRAPHQL_MAX_INT; } });
Object.defineProperty(exports, "GRAPHQL_MIN_INT", { enumerable: true, get: function () { return index_1.GRAPHQL_MIN_INT; } });
// Built-in Directives defined by the Spec
Object.defineProperty(exports, "specifiedDirectives", { enumerable: true, get: function () { return index_1.specifiedDirectives; } });
Object.defineProperty(exports, "GraphQLIncludeDirective", { enumerable: true, get: function () { return index_1.GraphQLIncludeDirective; } });
Object.defineProperty(exports, "GraphQLSkipDirective", { enumerable: true, get: function () { return index_1.GraphQLSkipDirective; } });
Object.defineProperty(exports, "GraphQLDeprecatedDirective", { enumerable: true, get: function () { return index_1.GraphQLDeprecatedDirective; } });
Object.defineProperty(exports, "GraphQLSpecifiedByDirective", { enumerable: true, get: function () { return index_1.GraphQLSpecifiedByDirective; } });
// "Enum" of Type Kinds
Object.defineProperty(exports, "TypeKind", { enumerable: true, get: function () { return index_1.TypeKind; } });
// Constant Deprecation Reason
Object.defineProperty(exports, "DEFAULT_DEPRECATION_REASON", { enumerable: true, get: function () { return index_1.DEFAULT_DEPRECATION_REASON; } });
// GraphQL Types for introspection.
Object.defineProperty(exports, "introspectionTypes", { enumerable: true, get: function () { return index_1.introspectionTypes; } });
Object.defineProperty(exports, "__Schema", { enumerable: true, get: function () { return index_1.__Schema; } });
Object.defineProperty(exports, "__Directive", { enumerable: true, get: function () { return index_1.__Directive; } });
Object.defineProperty(exports, "__DirectiveLocation", { enumerable: true, get: function () { return index_1.__DirectiveLocation; } });
Object.defineProperty(exports, "__Type", { enumerable: true, get: function () { return index_1.__Type; } });
Object.defineProperty(exports, "__Field", { enumerable: true, get: function () { return index_1.__Field; } });
Object.defineProperty(exports, "__InputValue", { enumerable: true, get: function () { return index_1.__InputValue; } });
Object.defineProperty(exports, "__EnumValue", { enumerable: true, get: function () { return index_1.__EnumValue; } });
Object.defineProperty(exports, "__TypeKind", { enumerable: true, get: function () { return index_1.__TypeKind; } });
// Meta-field definitions.
Object.defineProperty(exports, "SchemaMetaFieldDef", { enumerable: true, get: function () { return index_1.SchemaMetaFieldDef; } });
Object.defineProperty(exports, "TypeMetaFieldDef", { enumerable: true, get: function () { return index_1.TypeMetaFieldDef; } });
Object.defineProperty(exports, "TypeNameMetaFieldDef", { enumerable: true, get: function () { return index_1.TypeNameMetaFieldDef; } });
// Predicates
Object.defineProperty(exports, "isSchema", { enumerable: true, get: function () { return index_1.isSchema; } });
Object.defineProperty(exports, "isDirective", { enumerable: true, get: function () { return index_1.isDirective; } });
Object.defineProperty(exports, "isType", { enumerable: true, get: function () { return index_1.isType; } });
Object.defineProperty(exports, "isScalarType", { enumerable: true, get: function () { return index_1.isScalarType; } });
Object.defineProperty(exports, "isObjectType", { enumerable: true, get: function () { return index_1.isObjectType; } });
Object.defineProperty(exports, "isInterfaceType", { enumerable: true, get: function () { return index_1.isInterfaceType; } });
Object.defineProperty(exports, "isUnionType", { enumerable: true, get: function () { return index_1.isUnionType; } });
Object.defineProperty(exports, "isEnumType", { enumerable: true, get: function () { return index_1.isEnumType; } });
Object.defineProperty(exports, "isInputObjectType", { enumerable: true, get: function () { return index_1.isInputObjectType; } });
Object.defineProperty(exports, "isListType", { enumerable: true, get: function () { return index_1.isListType; } });
Object.defineProperty(exports, "isNonNullType", { enumerable: true, get: function () { return index_1.isNonNullType; } });
Object.defineProperty(exports, "isInputType", { enumerable: true, get: function () { return index_1.isInputType; } });
Object.defineProperty(exports, "isOutputType", { enumerable: true, get: function () { return index_1.isOutputType; } });
Object.defineProperty(exports, "isLeafType", { enumerable: true, get: function () { return index_1.isLeafType; } });
Object.defineProperty(exports, "isCompositeType", { enumerable: true, get: function () { return index_1.isCompositeType; } });
Object.defineProperty(exports, "isAbstractType", { enumerable: true, get: function () { return index_1.isAbstractType; } });
Object.defineProperty(exports, "isWrappingType", { enumerable: true, get: function () { return index_1.isWrappingType; } });
Object.defineProperty(exports, "isNullableType", { enumerable: true, get: function () { return index_1.isNullableType; } });
Object.defineProperty(exports, "isNamedType", { enumerable: true, get: function () { return index_1.isNamedType; } });
Object.defineProperty(exports, "isRequiredArgument", { enumerable: true, get: function () { return index_1.isRequiredArgument; } });
Object.defineProperty(exports, "isRequiredInputField", { enumerable: true, get: function () { return index_1.isRequiredInputField; } });
Object.defineProperty(exports, "isSpecifiedScalarType", { enumerable: true, get: function () { return index_1.isSpecifiedScalarType; } });
Object.defineProperty(exports, "isIntrospectionType", { enumerable: true, get: function () { return index_1.isIntrospectionType; } });
Object.defineProperty(exports, "isSpecifiedDirective", { enumerable: true, get: function () { return index_1.isSpecifiedDirective; } });
// Assertions
Object.defineProperty(exports, "assertSchema", { enumerable: true, get: function () { return index_1.assertSchema; } });
Object.defineProperty(exports, "assertDirective", { enumerable: true, get: function () { return index_1.assertDirective; } });
Object.defineProperty(exports, "assertType", { enumerable: true, get: function () { return index_1.assertType; } });
Object.defineProperty(exports, "assertScalarType", { enumerable: true, get: function () { return index_1.assertScalarType; } });
Object.defineProperty(exports, "assertObjectType", { enumerable: true, get: function () { return index_1.assertObjectType; } });
Object.defineProperty(exports, "assertInterfaceType", { enumerable: true, get: function () { return index_1.assertInterfaceType; } });
Object.defineProperty(exports, "assertUnionType", { enumerable: true, get: function () { return index_1.assertUnionType; } });
Object.defineProperty(exports, "assertEnumType", { enumerable: true, get: function () { return index_1.assertEnumType; } });
Object.defineProperty(exports, "assertInputObjectType", { enumerable: true, get: function () { return index_1.assertInputObjectType; } });
Object.defineProperty(exports, "assertListType", { enumerable: true, get: function () { return index_1.assertListType; } });
Object.defineProperty(exports, "assertNonNullType", { enumerable: true, get: function () { return index_1.assertNonNullType; } });
Object.defineProperty(exports, "assertInputType", { enumerable: true, get: function () { return index_1.assertInputType; } });
Object.defineProperty(exports, "assertOutputType", { enumerable: true, get: function () { return index_1.assertOutputType; } });
Object.defineProperty(exports, "assertLeafType", { enumerable: true, get: function () { return index_1.assertLeafType; } });
Object.defineProperty(exports, "assertCompositeType", { enumerable: true, get: function () { return index_1.assertCompositeType; } });
Object.defineProperty(exports, "assertAbstractType", { enumerable: true, get: function () { return index_1.assertAbstractType; } });
Object.defineProperty(exports, "assertWrappingType", { enumerable: true, get: function () { return index_1.assertWrappingType; } });
Object.defineProperty(exports, "assertNullableType", { enumerable: true, get: function () { return index_1.assertNullableType; } });
Object.defineProperty(exports, "assertNamedType", { enumerable: true, get: function () { return index_1.assertNamedType; } });
// Un-modifiers
Object.defineProperty(exports, "getNullableType", { enumerable: true, get: function () { return index_1.getNullableType; } });
Object.defineProperty(exports, "getNamedType", { enumerable: true, get: function () { return index_1.getNamedType; } });
// Validate GraphQL schema.
Object.defineProperty(exports, "validateSchema", { enumerable: true, get: function () { return index_1.validateSchema; } });
Object.defineProperty(exports, "assertValidSchema", { enumerable: true, get: function () { return index_1.assertValidSchema; } });
// Upholds the spec rules about naming.
Object.defineProperty(exports, "assertName", { enumerable: true, get: function () { return index_1.assertName; } });
Object.defineProperty(exports, "assertEnumValueName", { enumerable: true, get: function () { return index_1.assertEnumValueName; } });
// Parse and operate on GraphQL language source files.
var index_2 = require("./language/index");
Object.defineProperty(exports, "Token", { enumerable: true, get: function () { return index_2.Token; } });
Object.defineProperty(exports, "Source", { enumerable: true, get: function () { return index_2.Source; } });
Object.defineProperty(exports, "Location", { enumerable: true, get: function () { return index_2.Location; } });
Object.defineProperty(exports, "OperationTypeNode", { enumerable: true, get: function () { return index_2.OperationTypeNode; } });
Object.defineProperty(exports, "getLocation", { enumerable: true, get: function () { return index_2.getLocation; } });
// Print source location.
Object.defineProperty(exports, "printLocation", { enumerable: true, get: function () { return index_2.printLocation; } });
Object.defineProperty(exports, "printSourceLocation", { enumerable: true, get: function () { return index_2.printSourceLocation; } });
// Lex
Object.defineProperty(exports, "Lexer", { enumerable: true, get: function () { return index_2.Lexer; } });
Object.defineProperty(exports, "TokenKind", { enumerable: true, get: function () { return index_2.TokenKind; } });
// Parse
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return index_2.parse; } });
Object.defineProperty(exports, "parseValue", { enumerable: true, get: function () { return index_2.parseValue; } });
Object.defineProperty(exports, "parseConstValue", { enumerable: true, get: function () { return index_2.parseConstValue; } });
Object.defineProperty(exports, "parseType", { enumerable: true, get: function () { return index_2.parseType; } });
// Print
Object.defineProperty(exports, "print", { enumerable: true, get: function () { return index_2.print; } });
// Visit
Object.defineProperty(exports, "visit", { enumerable: true, get: function () { return index_2.visit; } });
Object.defineProperty(exports, "visitInParallel", { enumerable: true, get: function () { return index_2.visitInParallel; } });
Object.defineProperty(exports, "getVisitFn", { enumerable: true, get: function () { return index_2.getVisitFn; } });
Object.defineProperty(exports, "getEnterLeaveForKind", { enumerable: true, get: function () { return index_2.getEnterLeaveForKind; } });
Object.defineProperty(exports, "BREAK", { enumerable: true, get: function () { return index_2.BREAK; } });
Object.defineProperty(exports, "Kind", { enumerable: true, get: function () { return index_2.Kind; } });
Object.defineProperty(exports, "DirectiveLocation", { enumerable: true, get: function () { return index_2.DirectiveLocation; } });
// Predicates
Object.defineProperty(exports, "isDefinitionNode", { enumerable: true, get: function () { return index_2.isDefinitionNode; } });
Object.defineProperty(exports, "isExecutableDefinitionNode", { enumerable: true, get: function () { return index_2.isExecutableDefinitionNode; } });
Object.defineProperty(exports, "isSelectionNode", { enumerable: true, get: function () { return index_2.isSelectionNode; } });
Object.defineProperty(exports, "isValueNode", { enumerable: true, get: function () { return index_2.isValueNode; } });
Object.defineProperty(exports, "isConstValueNode", { enumerable: true, get: function () { return index_2.isConstValueNode; } });
Object.defineProperty(exports, "isTypeNode", { enumerable: true, get: function () { return index_2.isTypeNode; } });
Object.defineProperty(exports, "isTypeSystemDefinitionNode", { enumerable: true, get: function () { return index_2.isTypeSystemDefinitionNode; } });
Object.defineProperty(exports, "isTypeDefinitionNode", { enumerable: true, get: function () { return index_2.isTypeDefinitionNode; } });
Object.defineProperty(exports, "isTypeSystemExtensionNode", { enumerable: true, get: function () { return index_2.isTypeSystemExtensionNode; } });
Object.defineProperty(exports, "isTypeExtensionNode", { enumerable: true, get: function () { return index_2.isTypeExtensionNode; } });
// Execute GraphQL queries.
var index_3 = require("./execution/index");
Object.defineProperty(exports, "execute", { enumerable: true, get: function () { return index_3.execute; } });
Object.defineProperty(exports, "executeSync", { enumerable: true, get: function () { return index_3.executeSync; } });
Object.defineProperty(exports, "defaultFieldResolver", { enumerable: true, get: function () { return index_3.defaultFieldResolver; } });
Object.defineProperty(exports, "defaultTypeResolver", { enumerable: true, get: function () { return index_3.defaultTypeResolver; } });
Object.defineProperty(exports, "responsePathAsArray", { enumerable: true, get: function () { return index_3.responsePathAsArray; } });
Object.defineProperty(exports, "getArgumentValues", { enumerable: true, get: function () { return index_3.getArgumentValues; } });
Object.defineProperty(exports, "getVariableValues", { enumerable: true, get: function () { return index_3.getVariableValues; } });
Object.defineProperty(exports, "getDirectiveValues", { enumerable: true, get: function () { return index_3.getDirectiveValues; } });
Object.defineProperty(exports, "subscribe", { enumerable: true, get: function () { return index_3.subscribe; } });
Object.defineProperty(exports, "createSourceEventStream", { enumerable: true, get: function () { return index_3.createSourceEventStream; } });
// Validate GraphQL documents.
var index_4 = require("./validation/index");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return index_4.validate; } });
Object.defineProperty(exports, "ValidationContext", { enumerable: true, get: function () { return index_4.ValidationContext; } });
// All validation rules in the GraphQL Specification.
Object.defineProperty(exports, "specifiedRules", { enumerable: true, get: function () { return index_4.specifiedRules; } });
// Individual validation rules.
Object.defineProperty(exports, "ExecutableDefinitionsRule", { enumerable: true, get: function () { return index_4.ExecutableDefinitionsRule; } });
Object.defineProperty(exports, "FieldsOnCorrectTypeRule", { enumerable: true, get: function () { return index_4.FieldsOnCorrectTypeRule; } });
Object.defineProperty(exports, "FragmentsOnCompositeTypesRule", { enumerable: true, get: function () { return index_4.FragmentsOnCompositeTypesRule; } });
Object.defineProperty(exports, "KnownArgumentNamesRule", { enumerable: true, get: function () { return index_4.KnownArgumentNamesRule; } });
Object.defineProperty(exports, "KnownDirectivesRule", { enumerable: true, get: function () { return index_4.KnownDirectivesRule; } });
Object.defineProperty(exports, "KnownFragmentNamesRule", { enumerable: true, get: function () { return index_4.KnownFragmentNamesRule; } });
Object.defineProperty(exports, "KnownTypeNamesRule", { enumerable: true, get: function () { return index_4.KnownTypeNamesRule; } });
Object.defineProperty(exports, "LoneAnonymousOperationRule", { enumerable: true, get: function () { return index_4.LoneAnonymousOperationRule; } });
Object.defineProperty(exports, "NoFragmentCyclesRule", { enumerable: true, get: function () { return index_4.NoFragmentCyclesRule; } });
Object.defineProperty(exports, "NoUndefinedVariablesRule", { enumerable: true, get: function () { return index_4.NoUndefinedVariablesRule; } });
Object.defineProperty(exports, "NoUnusedFragmentsRule", { enumerable: true, get: function () { return index_4.NoUnusedFragmentsRule; } });
Object.defineProperty(exports, "NoUnusedVariablesRule", { enumerable: true, get: function () { return index_4.NoUnusedVariablesRule; } });
Object.defineProperty(exports, "OverlappingFieldsCanBeMergedRule", { enumerable: true, get: function () { return index_4.OverlappingFieldsCanBeMergedRule; } });
Object.defineProperty(exports, "PossibleFragmentSpreadsRule", { enumerable: true, get: function () { return index_4.PossibleFragmentSpreadsRule; } });
Object.defineProperty(exports, "ProvidedRequiredArgumentsRule", { enumerable: true, get: function () { return index_4.ProvidedRequiredArgumentsRule; } });
Object.defineProperty(exports, "ScalarLeafsRule", { enumerable: true, get: function () { return index_4.ScalarLeafsRule; } });
Object.defineProperty(exports, "SingleFieldSubscriptionsRule", { enumerable: true, get: function () { return index_4.SingleFieldSubscriptionsRule; } });
Object.defineProperty(exports, "UniqueArgumentNamesRule", { enumerable: true, get: function () { return index_4.UniqueArgumentNamesRule; } });
Object.defineProperty(exports, "UniqueDirectivesPerLocationRule", { enumerable: true, get: function () { return index_4.UniqueDirectivesPerLocationRule; } });
Object.defineProperty(exports, "UniqueFragmentNamesRule", { enumerable: true, get: function () { return index_4.UniqueFragmentNamesRule; } });
Object.defineProperty(exports, "UniqueInputFieldNamesRule", { enumerable: true, get: function () { return index_4.UniqueInputFieldNamesRule; } });
Object.defineProperty(exports, "UniqueOperationNamesRule", { enumerable: true, get: function () { return index_4.UniqueOperationNamesRule; } });
Object.defineProperty(exports, "UniqueVariableNamesRule", { enumerable: true, get: function () { return index_4.UniqueVariableNamesRule; } });
Object.defineProperty(exports, "ValuesOfCorrectTypeRule", { enumerable: true, get: function () { return index_4.ValuesOfCorrectTypeRule; } });
Object.defineProperty(exports, "VariablesAreInputTypesRule", { enumerable: true, get: function () { return index_4.VariablesAreInputTypesRule; } });
Object.defineProperty(exports, "VariablesInAllowedPositionRule", { enumerable: true, get: function () { return index_4.VariablesInAllowedPositionRule; } });
// SDL-specific validation rules
Object.defineProperty(exports, "LoneSchemaDefinitionRule", { enumerable: true, get: function () { return index_4.LoneSchemaDefinitionRule; } });
Object.defineProperty(exports, "UniqueOperationTypesRule", { enumerable: true, get: function () { return index_4.UniqueOperationTypesRule; } });
Object.defineProperty(exports, "UniqueTypeNamesRule", { enumerable: true, get: function () { return index_4.UniqueTypeNamesRule; } });
Object.defineProperty(exports, "UniqueEnumValueNamesRule", { enumerable: true, get: function () { return index_4.UniqueEnumValueNamesRule; } });
Object.defineProperty(exports, "UniqueFieldDefinitionNamesRule", { enumerable: true, get: function () { return index_4.UniqueFieldDefinitionNamesRule; } });
Object.defineProperty(exports, "UniqueArgumentDefinitionNamesRule", { enumerable: true, get: function () { return index_4.UniqueArgumentDefinitionNamesRule; } });
Object.defineProperty(exports, "UniqueDirectiveNamesRule", { enumerable: true, get: function () { return index_4.UniqueDirectiveNamesRule; } });
Object.defineProperty(exports, "PossibleTypeExtensionsRule", { enumerable: true, get: function () { return index_4.PossibleTypeExtensionsRule; } });
// Custom validation rules
Object.defineProperty(exports, "NoDeprecatedCustomRule", { enumerable: true, get: function () { return index_4.NoDeprecatedCustomRule; } });
Object.defineProperty(exports, "NoSchemaIntrospectionCustomRule", { enumerable: true, get: function () { return index_4.NoSchemaIntrospectionCustomRule; } });
// Create, format, and print GraphQL errors.
var index_5 = require("./error/index");
Object.defineProperty(exports, "GraphQLError", { enumerable: true, get: function () { return index_5.GraphQLError; } });
Object.defineProperty(exports, "syntaxError", { enumerable: true, get: function () { return index_5.syntaxError; } });
Object.defineProperty(exports, "locatedError", { enumerable: true, get: function () { return index_5.locatedError; } });
Object.defineProperty(exports, "printError", { enumerable: true, get: function () { return index_5.printError; } });
Object.defineProperty(exports, "formatError", { enumerable: true, get: function () { return index_5.formatError; } });
// Utilities for operating on GraphQL type schema and parsed sources.
var index_6 = require("./utilities/index");
// Produce the GraphQL query recommended for a full schema introspection.
// Accepts optional IntrospectionOptions.
Object.defineProperty(exports, "getIntrospectionQuery", { enumerable: true, get: function () { return index_6.getIntrospectionQuery; } });
// Gets the target Operation from a Document.
Object.defineProperty(exports, "getOperationAST", { enumerable: true, get: function () { return index_6.getOperationAST; } });
// Gets the Type for the target Operation AST.
Object.defineProperty(exports, "getOperationRootType", { enumerable: true, get: function () { return index_6.getOperationRootType; } });
// Convert a GraphQLSchema to an IntrospectionQuery.
Object.defineProperty(exports, "introspectionFromSchema", { enumerable: true, get: function () { return index_6.introspectionFromSchema; } });
// Build a GraphQLSchema from an introspection result.
Object.defineProperty(exports, "buildClientSchema", { enumerable: true, get: function () { return index_6.buildClientSchema; } });
// Build a GraphQLSchema from a parsed GraphQL Schema language AST.
Object.defineProperty(exports, "buildASTSchema", { enumerable: true, get: function () { return index_6.buildASTSchema; } });
// Build a GraphQLSchema from a GraphQL schema language document.
Object.defineProperty(exports, "buildSchema", { enumerable: true, get: function () { return index_6.buildSchema; } });
// Extends an existing GraphQLSchema from a parsed GraphQL Schema language AST.
Object.defineProperty(exports, "extendSchema", { enumerable: true, get: function () { return index_6.extendSchema; } });
// Sort a GraphQLSchema.
Object.defineProperty(exports, "lexicographicSortSchema", { enumerable: true, get: function () { return index_6.lexicographicSortSchema; } });
// Print a GraphQLSchema to GraphQL Schema language.
Object.defineProperty(exports, "printSchema", { enumerable: true, get: function () { return index_6.printSchema; } });
// Print a GraphQLType to GraphQL Schema language.
Object.defineProperty(exports, "printType", { enumerable: true, get: function () { return index_6.printType; } });
// Prints the built-in introspection schema in the Schema Language format.
Object.defineProperty(exports, "printIntrospectionSchema", { enumerable: true, get: function () { return index_6.printIntrospectionSchema; } });
// Create a GraphQLType from a GraphQL language AST.
Object.defineProperty(exports, "typeFromAST", { enumerable: true, get: function () { return index_6.typeFromAST; } });
// Create a JavaScript value from a GraphQL language AST with a Type.
Object.defineProperty(exports, "valueFromAST", { enumerable: true, get: function () { return index_6.valueFromAST; } });
// Create a JavaScript value from a GraphQL language AST without a Type.
Object.defineProperty(exports, "valueFromASTUntyped", { enumerable: true, get: function () { return index_6.valueFromASTUntyped; } });
// Create a GraphQL language AST from a JavaScript value.
Object.defineProperty(exports, "astFromValue", { enumerable: true, get: function () { return index_6.astFromValue; } });
// A helper to use within recursive-descent visitors which need to be aware of the GraphQL type system.
Object.defineProperty(exports, "TypeInfo", { enumerable: true, get: function () { return index_6.TypeInfo; } });
Object.defineProperty(exports, "visitWithTypeInfo", { enumerable: true, get: function () { return index_6.visitWithTypeInfo; } });
// Coerces a JavaScript value to a GraphQL type, or produces errors.
Object.defineProperty(exports, "coerceInputValue", { enumerable: true, get: function () { return index_6.coerceInputValue; } });
// Concatenates multiple AST together.
Object.defineProperty(exports, "concatAST", { enumerable: true, get: function () { return index_6.concatAST; } });
// Separates an AST into an AST per Operation.
Object.defineProperty(exports, "separateOperations", { enumerable: true, get: function () { return index_6.separateOperations; } });
// Strips characters that are not significant to the validity or execution of a GraphQL document.
Object.defineProperty(exports, "stripIgnoredCharacters", { enumerable: true, get: function () { return index_6.stripIgnoredCharacters; } });
// Comparators for types
Object.defineProperty(exports, "isEqualType", { enumerable: true, get: function () { return index_6.isEqualType; } });
Object.defineProperty(exports, "isTypeSubTypeOf", { enumerable: true, get: function () { return index_6.isTypeSubTypeOf; } });
Object.defineProperty(exports, "doTypesOverlap", { enumerable: true, get: function () { return index_6.doTypesOverlap; } });
// Asserts a string is a valid GraphQL name.
Object.defineProperty(exports, "assertValidName", { enumerable: true, get: function () { return index_6.assertValidName; } });
// Determine if a string is a valid GraphQL name.
Object.defineProperty(exports, "isValidNameError", { enumerable: true, get: function () { return index_6.isValidNameError; } });
// Compares two GraphQLSchemas and detects breaking changes.
Object.defineProperty(exports, "BreakingChangeType", { enumerable: true, get: function () { return index_6.BreakingChangeType; } });
Object.defineProperty(exports, "DangerousChangeType", { enumerable: true, get: function () { return index_6.DangerousChangeType; } });
Object.defineProperty(exports, "findBreakingChanges", { enumerable: true, get: function () { return index_6.findBreakingChanges; } });
Object.defineProperty(exports, "findDangerousChanges", { enumerable: true, get: function () { return index_6.findDangerousChanges; } });
//# sourceMappingURL=index.js.map