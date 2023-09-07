"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specifiedSDLRules = exports.specifiedRules = void 0;
// Spec Section: "Executable Definitions"
const ExecutableDefinitionsRule_1 = require("./rules/ExecutableDefinitionsRule");
// Spec Section: "Field Selections on Objects, Interfaces, and Unions Types"
const FieldsOnCorrectTypeRule_1 = require("./rules/FieldsOnCorrectTypeRule");
// Spec Section: "Fragments on Composite Types"
const FragmentsOnCompositeTypesRule_1 = require("./rules/FragmentsOnCompositeTypesRule");
// Spec Section: "Argument Names"
const KnownArgumentNamesRule_1 = require("./rules/KnownArgumentNamesRule");
// Spec Section: "Directives Are Defined"
const KnownDirectivesRule_1 = require("./rules/KnownDirectivesRule");
// Spec Section: "Fragment spread target defined"
const KnownFragmentNamesRule_1 = require("./rules/KnownFragmentNamesRule");
// Spec Section: "Fragment Spread Type Existence"
const KnownTypeNamesRule_1 = require("./rules/KnownTypeNamesRule");
// Spec Section: "Lone Anonymous Operation"
const LoneAnonymousOperationRule_1 = require("./rules/LoneAnonymousOperationRule");
// SDL-specific validation rules
const LoneSchemaDefinitionRule_1 = require("./rules/LoneSchemaDefinitionRule");
// Spec Section: "Fragments must not form cycles"
const NoFragmentCyclesRule_1 = require("./rules/NoFragmentCyclesRule");
// Spec Section: "All Variable Used Defined"
const NoUndefinedVariablesRule_1 = require("./rules/NoUndefinedVariablesRule");
// Spec Section: "Fragments must be used"
const NoUnusedFragmentsRule_1 = require("./rules/NoUnusedFragmentsRule");
// Spec Section: "All Variables Used"
const NoUnusedVariablesRule_1 = require("./rules/NoUnusedVariablesRule");
// Spec Section: "Field Selection Merging"
const OverlappingFieldsCanBeMergedRule_1 = require("./rules/OverlappingFieldsCanBeMergedRule");
// Spec Section: "Fragment spread is possible"
const PossibleFragmentSpreadsRule_1 = require("./rules/PossibleFragmentSpreadsRule");
const PossibleTypeExtensionsRule_1 = require("./rules/PossibleTypeExtensionsRule");
// Spec Section: "Argument Optionality"
const ProvidedRequiredArgumentsRule_1 = require("./rules/ProvidedRequiredArgumentsRule");
// Spec Section: "Leaf Field Selections"
const ScalarLeafsRule_1 = require("./rules/ScalarLeafsRule");
// Spec Section: "Subscriptions with Single Root Field"
const SingleFieldSubscriptionsRule_1 = require("./rules/SingleFieldSubscriptionsRule");
const UniqueArgumentDefinitionNamesRule_1 = require("./rules/UniqueArgumentDefinitionNamesRule");
// Spec Section: "Argument Uniqueness"
const UniqueArgumentNamesRule_1 = require("./rules/UniqueArgumentNamesRule");
const UniqueDirectiveNamesRule_1 = require("./rules/UniqueDirectiveNamesRule");
// Spec Section: "Directives Are Unique Per Location"
const UniqueDirectivesPerLocationRule_1 = require("./rules/UniqueDirectivesPerLocationRule");
const UniqueEnumValueNamesRule_1 = require("./rules/UniqueEnumValueNamesRule");
const UniqueFieldDefinitionNamesRule_1 = require("./rules/UniqueFieldDefinitionNamesRule");
// Spec Section: "Fragment Name Uniqueness"
const UniqueFragmentNamesRule_1 = require("./rules/UniqueFragmentNamesRule");
// Spec Section: "Input Object Field Uniqueness"
const UniqueInputFieldNamesRule_1 = require("./rules/UniqueInputFieldNamesRule");
// Spec Section: "Operation Name Uniqueness"
const UniqueOperationNamesRule_1 = require("./rules/UniqueOperationNamesRule");
const UniqueOperationTypesRule_1 = require("./rules/UniqueOperationTypesRule");
const UniqueTypeNamesRule_1 = require("./rules/UniqueTypeNamesRule");
// Spec Section: "Variable Uniqueness"
const UniqueVariableNamesRule_1 = require("./rules/UniqueVariableNamesRule");
// Spec Section: "Value Type Correctness"
const ValuesOfCorrectTypeRule_1 = require("./rules/ValuesOfCorrectTypeRule");
// Spec Section: "Variables are Input Types"
const VariablesAreInputTypesRule_1 = require("./rules/VariablesAreInputTypesRule");
// Spec Section: "All Variable Usages Are Allowed"
const VariablesInAllowedPositionRule_1 = require("./rules/VariablesInAllowedPositionRule");
/**
 * This set includes all validation rules defined by the GraphQL spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
exports.specifiedRules = Object.freeze([
    ExecutableDefinitionsRule_1.ExecutableDefinitionsRule,
    UniqueOperationNamesRule_1.UniqueOperationNamesRule,
    LoneAnonymousOperationRule_1.LoneAnonymousOperationRule,
    SingleFieldSubscriptionsRule_1.SingleFieldSubscriptionsRule,
    KnownTypeNamesRule_1.KnownTypeNamesRule,
    FragmentsOnCompositeTypesRule_1.FragmentsOnCompositeTypesRule,
    VariablesAreInputTypesRule_1.VariablesAreInputTypesRule,
    ScalarLeafsRule_1.ScalarLeafsRule,
    FieldsOnCorrectTypeRule_1.FieldsOnCorrectTypeRule,
    UniqueFragmentNamesRule_1.UniqueFragmentNamesRule,
    KnownFragmentNamesRule_1.KnownFragmentNamesRule,
    NoUnusedFragmentsRule_1.NoUnusedFragmentsRule,
    PossibleFragmentSpreadsRule_1.PossibleFragmentSpreadsRule,
    NoFragmentCyclesRule_1.NoFragmentCyclesRule,
    UniqueVariableNamesRule_1.UniqueVariableNamesRule,
    NoUndefinedVariablesRule_1.NoUndefinedVariablesRule,
    NoUnusedVariablesRule_1.NoUnusedVariablesRule,
    KnownDirectivesRule_1.KnownDirectivesRule,
    UniqueDirectivesPerLocationRule_1.UniqueDirectivesPerLocationRule,
    KnownArgumentNamesRule_1.KnownArgumentNamesRule,
    UniqueArgumentNamesRule_1.UniqueArgumentNamesRule,
    ValuesOfCorrectTypeRule_1.ValuesOfCorrectTypeRule,
    ProvidedRequiredArgumentsRule_1.ProvidedRequiredArgumentsRule,
    VariablesInAllowedPositionRule_1.VariablesInAllowedPositionRule,
    OverlappingFieldsCanBeMergedRule_1.OverlappingFieldsCanBeMergedRule,
    UniqueInputFieldNamesRule_1.UniqueInputFieldNamesRule,
]);
/**
 * @internal
 */
exports.specifiedSDLRules = Object.freeze([
    LoneSchemaDefinitionRule_1.LoneSchemaDefinitionRule,
    UniqueOperationTypesRule_1.UniqueOperationTypesRule,
    UniqueTypeNamesRule_1.UniqueTypeNamesRule,
    UniqueEnumValueNamesRule_1.UniqueEnumValueNamesRule,
    UniqueFieldDefinitionNamesRule_1.UniqueFieldDefinitionNamesRule,
    UniqueArgumentDefinitionNamesRule_1.UniqueArgumentDefinitionNamesRule,
    UniqueDirectiveNamesRule_1.UniqueDirectiveNamesRule,
    KnownTypeNamesRule_1.KnownTypeNamesRule,
    KnownDirectivesRule_1.KnownDirectivesRule,
    UniqueDirectivesPerLocationRule_1.UniqueDirectivesPerLocationRule,
    PossibleTypeExtensionsRule_1.PossibleTypeExtensionsRule,
    KnownArgumentNamesRule_1.KnownArgumentNamesOnDirectivesRule,
    UniqueArgumentNamesRule_1.UniqueArgumentNamesRule,
    UniqueInputFieldNamesRule_1.UniqueInputFieldNamesRule,
    ProvidedRequiredArgumentsRule_1.ProvidedRequiredArgumentsOnDirectivesRule,
]);
//# sourceMappingURL=specifiedRules.js.map