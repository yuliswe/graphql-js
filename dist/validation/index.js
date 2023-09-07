"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSchemaIntrospectionCustomRule = exports.NoDeprecatedCustomRule = exports.PossibleTypeExtensionsRule = exports.UniqueDirectiveNamesRule = exports.UniqueArgumentDefinitionNamesRule = exports.UniqueFieldDefinitionNamesRule = exports.UniqueEnumValueNamesRule = exports.UniqueTypeNamesRule = exports.UniqueOperationTypesRule = exports.LoneSchemaDefinitionRule = exports.VariablesInAllowedPositionRule = exports.VariablesAreInputTypesRule = exports.ValuesOfCorrectTypeRule = exports.UniqueVariableNamesRule = exports.UniqueOperationNamesRule = exports.UniqueInputFieldNamesRule = exports.UniqueFragmentNamesRule = exports.UniqueDirectivesPerLocationRule = exports.UniqueArgumentNamesRule = exports.SingleFieldSubscriptionsRule = exports.ScalarLeafsRule = exports.ProvidedRequiredArgumentsRule = exports.PossibleFragmentSpreadsRule = exports.OverlappingFieldsCanBeMergedRule = exports.NoUnusedVariablesRule = exports.NoUnusedFragmentsRule = exports.NoUndefinedVariablesRule = exports.NoFragmentCyclesRule = exports.LoneAnonymousOperationRule = exports.KnownTypeNamesRule = exports.KnownFragmentNamesRule = exports.KnownDirectivesRule = exports.KnownArgumentNamesRule = exports.FragmentsOnCompositeTypesRule = exports.FieldsOnCorrectTypeRule = exports.ExecutableDefinitionsRule = exports.specifiedRules = exports.ValidationContext = exports.validate = void 0;
var validate_1 = require("./validate");
Object.defineProperty(exports, "validate", { enumerable: true, get: function () { return validate_1.validate; } });
var ValidationContext_1 = require("./ValidationContext");
Object.defineProperty(exports, "ValidationContext", { enumerable: true, get: function () { return ValidationContext_1.ValidationContext; } });
// All validation rules in the GraphQL Specification.
var specifiedRules_1 = require("./specifiedRules");
Object.defineProperty(exports, "specifiedRules", { enumerable: true, get: function () { return specifiedRules_1.specifiedRules; } });
// Spec Section: "Executable Definitions"
var ExecutableDefinitionsRule_1 = require("./rules/ExecutableDefinitionsRule");
Object.defineProperty(exports, "ExecutableDefinitionsRule", { enumerable: true, get: function () { return ExecutableDefinitionsRule_1.ExecutableDefinitionsRule; } });
// Spec Section: "Field Selections on Objects, Interfaces, and Unions Types"
var FieldsOnCorrectTypeRule_1 = require("./rules/FieldsOnCorrectTypeRule");
Object.defineProperty(exports, "FieldsOnCorrectTypeRule", { enumerable: true, get: function () { return FieldsOnCorrectTypeRule_1.FieldsOnCorrectTypeRule; } });
// Spec Section: "Fragments on Composite Types"
var FragmentsOnCompositeTypesRule_1 = require("./rules/FragmentsOnCompositeTypesRule");
Object.defineProperty(exports, "FragmentsOnCompositeTypesRule", { enumerable: true, get: function () { return FragmentsOnCompositeTypesRule_1.FragmentsOnCompositeTypesRule; } });
// Spec Section: "Argument Names"
var KnownArgumentNamesRule_1 = require("./rules/KnownArgumentNamesRule");
Object.defineProperty(exports, "KnownArgumentNamesRule", { enumerable: true, get: function () { return KnownArgumentNamesRule_1.KnownArgumentNamesRule; } });
// Spec Section: "Directives Are Defined"
var KnownDirectivesRule_1 = require("./rules/KnownDirectivesRule");
Object.defineProperty(exports, "KnownDirectivesRule", { enumerable: true, get: function () { return KnownDirectivesRule_1.KnownDirectivesRule; } });
// Spec Section: "Fragment spread target defined"
var KnownFragmentNamesRule_1 = require("./rules/KnownFragmentNamesRule");
Object.defineProperty(exports, "KnownFragmentNamesRule", { enumerable: true, get: function () { return KnownFragmentNamesRule_1.KnownFragmentNamesRule; } });
// Spec Section: "Fragment Spread Type Existence"
var KnownTypeNamesRule_1 = require("./rules/KnownTypeNamesRule");
Object.defineProperty(exports, "KnownTypeNamesRule", { enumerable: true, get: function () { return KnownTypeNamesRule_1.KnownTypeNamesRule; } });
// Spec Section: "Lone Anonymous Operation"
var LoneAnonymousOperationRule_1 = require("./rules/LoneAnonymousOperationRule");
Object.defineProperty(exports, "LoneAnonymousOperationRule", { enumerable: true, get: function () { return LoneAnonymousOperationRule_1.LoneAnonymousOperationRule; } });
// Spec Section: "Fragments must not form cycles"
var NoFragmentCyclesRule_1 = require("./rules/NoFragmentCyclesRule");
Object.defineProperty(exports, "NoFragmentCyclesRule", { enumerable: true, get: function () { return NoFragmentCyclesRule_1.NoFragmentCyclesRule; } });
// Spec Section: "All Variable Used Defined"
var NoUndefinedVariablesRule_1 = require("./rules/NoUndefinedVariablesRule");
Object.defineProperty(exports, "NoUndefinedVariablesRule", { enumerable: true, get: function () { return NoUndefinedVariablesRule_1.NoUndefinedVariablesRule; } });
// Spec Section: "Fragments must be used"
var NoUnusedFragmentsRule_1 = require("./rules/NoUnusedFragmentsRule");
Object.defineProperty(exports, "NoUnusedFragmentsRule", { enumerable: true, get: function () { return NoUnusedFragmentsRule_1.NoUnusedFragmentsRule; } });
// Spec Section: "All Variables Used"
var NoUnusedVariablesRule_1 = require("./rules/NoUnusedVariablesRule");
Object.defineProperty(exports, "NoUnusedVariablesRule", { enumerable: true, get: function () { return NoUnusedVariablesRule_1.NoUnusedVariablesRule; } });
// Spec Section: "Field Selection Merging"
var OverlappingFieldsCanBeMergedRule_1 = require("./rules/OverlappingFieldsCanBeMergedRule");
Object.defineProperty(exports, "OverlappingFieldsCanBeMergedRule", { enumerable: true, get: function () { return OverlappingFieldsCanBeMergedRule_1.OverlappingFieldsCanBeMergedRule; } });
// Spec Section: "Fragment spread is possible"
var PossibleFragmentSpreadsRule_1 = require("./rules/PossibleFragmentSpreadsRule");
Object.defineProperty(exports, "PossibleFragmentSpreadsRule", { enumerable: true, get: function () { return PossibleFragmentSpreadsRule_1.PossibleFragmentSpreadsRule; } });
// Spec Section: "Argument Optionality"
var ProvidedRequiredArgumentsRule_1 = require("./rules/ProvidedRequiredArgumentsRule");
Object.defineProperty(exports, "ProvidedRequiredArgumentsRule", { enumerable: true, get: function () { return ProvidedRequiredArgumentsRule_1.ProvidedRequiredArgumentsRule; } });
// Spec Section: "Leaf Field Selections"
var ScalarLeafsRule_1 = require("./rules/ScalarLeafsRule");
Object.defineProperty(exports, "ScalarLeafsRule", { enumerable: true, get: function () { return ScalarLeafsRule_1.ScalarLeafsRule; } });
// Spec Section: "Subscriptions with Single Root Field"
var SingleFieldSubscriptionsRule_1 = require("./rules/SingleFieldSubscriptionsRule");
Object.defineProperty(exports, "SingleFieldSubscriptionsRule", { enumerable: true, get: function () { return SingleFieldSubscriptionsRule_1.SingleFieldSubscriptionsRule; } });
// Spec Section: "Argument Uniqueness"
var UniqueArgumentNamesRule_1 = require("./rules/UniqueArgumentNamesRule");
Object.defineProperty(exports, "UniqueArgumentNamesRule", { enumerable: true, get: function () { return UniqueArgumentNamesRule_1.UniqueArgumentNamesRule; } });
// Spec Section: "Directives Are Unique Per Location"
var UniqueDirectivesPerLocationRule_1 = require("./rules/UniqueDirectivesPerLocationRule");
Object.defineProperty(exports, "UniqueDirectivesPerLocationRule", { enumerable: true, get: function () { return UniqueDirectivesPerLocationRule_1.UniqueDirectivesPerLocationRule; } });
// Spec Section: "Fragment Name Uniqueness"
var UniqueFragmentNamesRule_1 = require("./rules/UniqueFragmentNamesRule");
Object.defineProperty(exports, "UniqueFragmentNamesRule", { enumerable: true, get: function () { return UniqueFragmentNamesRule_1.UniqueFragmentNamesRule; } });
// Spec Section: "Input Object Field Uniqueness"
var UniqueInputFieldNamesRule_1 = require("./rules/UniqueInputFieldNamesRule");
Object.defineProperty(exports, "UniqueInputFieldNamesRule", { enumerable: true, get: function () { return UniqueInputFieldNamesRule_1.UniqueInputFieldNamesRule; } });
// Spec Section: "Operation Name Uniqueness"
var UniqueOperationNamesRule_1 = require("./rules/UniqueOperationNamesRule");
Object.defineProperty(exports, "UniqueOperationNamesRule", { enumerable: true, get: function () { return UniqueOperationNamesRule_1.UniqueOperationNamesRule; } });
// Spec Section: "Variable Uniqueness"
var UniqueVariableNamesRule_1 = require("./rules/UniqueVariableNamesRule");
Object.defineProperty(exports, "UniqueVariableNamesRule", { enumerable: true, get: function () { return UniqueVariableNamesRule_1.UniqueVariableNamesRule; } });
// Spec Section: "Values Type Correctness"
var ValuesOfCorrectTypeRule_1 = require("./rules/ValuesOfCorrectTypeRule");
Object.defineProperty(exports, "ValuesOfCorrectTypeRule", { enumerable: true, get: function () { return ValuesOfCorrectTypeRule_1.ValuesOfCorrectTypeRule; } });
// Spec Section: "Variables are Input Types"
var VariablesAreInputTypesRule_1 = require("./rules/VariablesAreInputTypesRule");
Object.defineProperty(exports, "VariablesAreInputTypesRule", { enumerable: true, get: function () { return VariablesAreInputTypesRule_1.VariablesAreInputTypesRule; } });
// Spec Section: "All Variable Usages Are Allowed"
var VariablesInAllowedPositionRule_1 = require("./rules/VariablesInAllowedPositionRule");
Object.defineProperty(exports, "VariablesInAllowedPositionRule", { enumerable: true, get: function () { return VariablesInAllowedPositionRule_1.VariablesInAllowedPositionRule; } });
// SDL-specific validation rules
var LoneSchemaDefinitionRule_1 = require("./rules/LoneSchemaDefinitionRule");
Object.defineProperty(exports, "LoneSchemaDefinitionRule", { enumerable: true, get: function () { return LoneSchemaDefinitionRule_1.LoneSchemaDefinitionRule; } });
var UniqueOperationTypesRule_1 = require("./rules/UniqueOperationTypesRule");
Object.defineProperty(exports, "UniqueOperationTypesRule", { enumerable: true, get: function () { return UniqueOperationTypesRule_1.UniqueOperationTypesRule; } });
var UniqueTypeNamesRule_1 = require("./rules/UniqueTypeNamesRule");
Object.defineProperty(exports, "UniqueTypeNamesRule", { enumerable: true, get: function () { return UniqueTypeNamesRule_1.UniqueTypeNamesRule; } });
var UniqueEnumValueNamesRule_1 = require("./rules/UniqueEnumValueNamesRule");
Object.defineProperty(exports, "UniqueEnumValueNamesRule", { enumerable: true, get: function () { return UniqueEnumValueNamesRule_1.UniqueEnumValueNamesRule; } });
var UniqueFieldDefinitionNamesRule_1 = require("./rules/UniqueFieldDefinitionNamesRule");
Object.defineProperty(exports, "UniqueFieldDefinitionNamesRule", { enumerable: true, get: function () { return UniqueFieldDefinitionNamesRule_1.UniqueFieldDefinitionNamesRule; } });
var UniqueArgumentDefinitionNamesRule_1 = require("./rules/UniqueArgumentDefinitionNamesRule");
Object.defineProperty(exports, "UniqueArgumentDefinitionNamesRule", { enumerable: true, get: function () { return UniqueArgumentDefinitionNamesRule_1.UniqueArgumentDefinitionNamesRule; } });
var UniqueDirectiveNamesRule_1 = require("./rules/UniqueDirectiveNamesRule");
Object.defineProperty(exports, "UniqueDirectiveNamesRule", { enumerable: true, get: function () { return UniqueDirectiveNamesRule_1.UniqueDirectiveNamesRule; } });
var PossibleTypeExtensionsRule_1 = require("./rules/PossibleTypeExtensionsRule");
Object.defineProperty(exports, "PossibleTypeExtensionsRule", { enumerable: true, get: function () { return PossibleTypeExtensionsRule_1.PossibleTypeExtensionsRule; } });
// Optional rules not defined by the GraphQL Specification
var NoDeprecatedCustomRule_1 = require("./rules/custom/NoDeprecatedCustomRule");
Object.defineProperty(exports, "NoDeprecatedCustomRule", { enumerable: true, get: function () { return NoDeprecatedCustomRule_1.NoDeprecatedCustomRule; } });
var NoSchemaIntrospectionCustomRule_1 = require("./rules/custom/NoSchemaIntrospectionCustomRule");
Object.defineProperty(exports, "NoSchemaIntrospectionCustomRule", { enumerable: true, get: function () { return NoSchemaIntrospectionCustomRule_1.NoSchemaIntrospectionCustomRule; } });
//# sourceMappingURL=index.js.map