"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownDirectivesRule = void 0;
const inspect_1 = require("../../jsutils/inspect");
const invariant_1 = require("../../jsutils/invariant");
const GraphQLError_1 = require("../../error/GraphQLError");
const ast_1 = require("../../language/ast");
const directiveLocation_1 = require("../../language/directiveLocation");
const kinds_1 = require("../../language/kinds");
const directives_1 = require("../../type/directives");
/**
 * Known directives
 *
 * A GraphQL document is only valid if all `@directives` are known by the
 * schema and legally positioned.
 *
 * See https://spec.graphql.org/draft/#sec-Directives-Are-Defined
 */
function KnownDirectivesRule(context) {
    const locationsMap = Object.create(null);
    const schema = context.getSchema();
    const definedDirectives = schema
        ? schema.getDirectives()
        : directives_1.specifiedDirectives;
    for (const directive of definedDirectives) {
        locationsMap[directive.name] = directive.locations;
    }
    const astDefinitions = context.getDocument().definitions;
    for (const def of astDefinitions) {
        if (def.kind === kinds_1.Kind.DIRECTIVE_DEFINITION) {
            locationsMap[def.name.value] = def.locations.map((name) => name.value);
        }
    }
    return {
        Directive(node, _key, _parent, _path, ancestors) {
            const name = node.name.value;
            const locations = locationsMap[name];
            if (!locations) {
                context.reportError(new GraphQLError_1.GraphQLError(`Unknown directive "@${name}".`, { nodes: node }));
                return;
            }
            const candidateLocation = getDirectiveLocationForASTPath(ancestors);
            if (candidateLocation && !locations.includes(candidateLocation)) {
                context.reportError(new GraphQLError_1.GraphQLError(`Directive "@${name}" may not be used on ${candidateLocation}.`, { nodes: node }));
            }
        },
    };
}
exports.KnownDirectivesRule = KnownDirectivesRule;
function getDirectiveLocationForASTPath(ancestors) {
    const appliedTo = ancestors[ancestors.length - 1];
    (0, invariant_1.invariant)('kind' in appliedTo);
    switch (appliedTo.kind) {
        case kinds_1.Kind.OPERATION_DEFINITION:
            return getDirectiveLocationForOperation(appliedTo.operation);
        case kinds_1.Kind.FIELD:
            return directiveLocation_1.DirectiveLocation.FIELD;
        case kinds_1.Kind.FRAGMENT_SPREAD:
            return directiveLocation_1.DirectiveLocation.FRAGMENT_SPREAD;
        case kinds_1.Kind.INLINE_FRAGMENT:
            return directiveLocation_1.DirectiveLocation.INLINE_FRAGMENT;
        case kinds_1.Kind.FRAGMENT_DEFINITION:
            return directiveLocation_1.DirectiveLocation.FRAGMENT_DEFINITION;
        case kinds_1.Kind.VARIABLE_DEFINITION:
            return directiveLocation_1.DirectiveLocation.VARIABLE_DEFINITION;
        case kinds_1.Kind.SCHEMA_DEFINITION:
        case kinds_1.Kind.SCHEMA_EXTENSION:
            return directiveLocation_1.DirectiveLocation.SCHEMA;
        case kinds_1.Kind.SCALAR_TYPE_DEFINITION:
        case kinds_1.Kind.SCALAR_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.SCALAR;
        case kinds_1.Kind.OBJECT_TYPE_DEFINITION:
        case kinds_1.Kind.OBJECT_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.OBJECT;
        case kinds_1.Kind.FIELD_DEFINITION:
            return directiveLocation_1.DirectiveLocation.FIELD_DEFINITION;
        case kinds_1.Kind.INTERFACE_TYPE_DEFINITION:
        case kinds_1.Kind.INTERFACE_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.INTERFACE;
        case kinds_1.Kind.UNION_TYPE_DEFINITION:
        case kinds_1.Kind.UNION_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.UNION;
        case kinds_1.Kind.ENUM_TYPE_DEFINITION:
        case kinds_1.Kind.ENUM_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.ENUM;
        case kinds_1.Kind.ENUM_VALUE_DEFINITION:
            return directiveLocation_1.DirectiveLocation.ENUM_VALUE;
        case kinds_1.Kind.INPUT_OBJECT_TYPE_DEFINITION:
        case kinds_1.Kind.INPUT_OBJECT_TYPE_EXTENSION:
            return directiveLocation_1.DirectiveLocation.INPUT_OBJECT;
        case kinds_1.Kind.INPUT_VALUE_DEFINITION: {
            const parentNode = ancestors[ancestors.length - 3];
            (0, invariant_1.invariant)('kind' in parentNode);
            return parentNode.kind === kinds_1.Kind.INPUT_OBJECT_TYPE_DEFINITION
                ? directiveLocation_1.DirectiveLocation.INPUT_FIELD_DEFINITION
                : directiveLocation_1.DirectiveLocation.ARGUMENT_DEFINITION;
        }
        // Not reachable, all possible types have been considered.
        /* c8 ignore next */
        default:
            (0, invariant_1.invariant)(false, 'Unexpected kind: ' + (0, inspect_1.inspect)(appliedTo.kind));
    }
}
function getDirectiveLocationForOperation(operation) {
    switch (operation) {
        case ast_1.OperationTypeNode.QUERY:
            return directiveLocation_1.DirectiveLocation.QUERY;
        case ast_1.OperationTypeNode.MUTATION:
            return directiveLocation_1.DirectiveLocation.MUTATION;
        case ast_1.OperationTypeNode.SUBSCRIPTION:
            return directiveLocation_1.DirectiveLocation.SUBSCRIPTION;
    }
}
//# sourceMappingURL=KnownDirectivesRule.js.map