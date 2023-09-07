"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidSchema = exports.validateSchema = void 0;
const inspect_1 = require("../jsutils/inspect");
const GraphQLError_1 = require("../error/GraphQLError");
const ast_1 = require("../language/ast");
const typeComparators_1 = require("../utilities/typeComparators");
const definition_1 = require("./definition");
const directives_1 = require("./directives");
const introspection_1 = require("./introspection");
const schema_1 = require("./schema");
/**
 * Implements the "Type Validation" sub-sections of the specification's
 * "Type System" section.
 *
 * Validation runs synchronously, returning an array of encountered errors, or
 * an empty array if no errors were encountered and the Schema is valid.
 */
function validateSchema(schema) {
    // First check to ensure the provided value is in fact a GraphQLSchema.
    (0, schema_1.assertSchema)(schema);
    // If this Schema has already been validated, return the previous results.
    if (schema.__validationErrors) {
        return schema.__validationErrors;
    }
    // Validate the schema, producing a list of errors.
    const context = new SchemaValidationContext(schema);
    validateRootTypes(context);
    validateDirectives(context);
    validateTypes(context);
    // Persist the results of validation before returning to ensure validation
    // does not run multiple times for this schema.
    const errors = context.getErrors();
    schema.__validationErrors = errors;
    return errors;
}
exports.validateSchema = validateSchema;
/**
 * Utility function which asserts a schema is valid by throwing an error if
 * it is invalid.
 */
function assertValidSchema(schema) {
    const errors = validateSchema(schema);
    if (errors.length !== 0) {
        throw new Error(errors.map((error) => error.message).join('\n\n'));
    }
}
exports.assertValidSchema = assertValidSchema;
class SchemaValidationContext {
    constructor(schema) {
        this._errors = [];
        this.schema = schema;
    }
    reportError(message, nodes) {
        const _nodes = Array.isArray(nodes)
            ? nodes.filter(Boolean)
            : nodes;
        this._errors.push(new GraphQLError_1.GraphQLError(message, { nodes: _nodes }));
    }
    getErrors() {
        return this._errors;
    }
}
function validateRootTypes(context) {
    var _a, _b, _c;
    const schema = context.schema;
    const queryType = schema.getQueryType();
    if (!queryType) {
        context.reportError('Query root type must be provided.', schema.astNode);
    }
    else if (!(0, definition_1.isObjectType)(queryType)) {
        context.reportError(`Query root type must be Object type, it cannot be ${(0, inspect_1.inspect)(queryType)}.`, (_a = getOperationTypeNode(schema, ast_1.OperationTypeNode.QUERY)) !== null && _a !== void 0 ? _a : queryType.astNode);
    }
    const mutationType = schema.getMutationType();
    if (mutationType && !(0, definition_1.isObjectType)(mutationType)) {
        context.reportError('Mutation root type must be Object type if provided, it cannot be ' +
            `${(0, inspect_1.inspect)(mutationType)}.`, (_b = getOperationTypeNode(schema, ast_1.OperationTypeNode.MUTATION)) !== null && _b !== void 0 ? _b : mutationType.astNode);
    }
    const subscriptionType = schema.getSubscriptionType();
    if (subscriptionType && !(0, definition_1.isObjectType)(subscriptionType)) {
        context.reportError('Subscription root type must be Object type if provided, it cannot be ' +
            `${(0, inspect_1.inspect)(subscriptionType)}.`, (_c = getOperationTypeNode(schema, ast_1.OperationTypeNode.SUBSCRIPTION)) !== null && _c !== void 0 ? _c : subscriptionType.astNode);
    }
}
function getOperationTypeNode(schema, operation) {
    var _a;
    return (_a = [schema.astNode, ...schema.extensionASTNodes]
        .flatMap(
    // FIXME: https://github.com/graphql/graphql-js/issues/2203
    (schemaNode) => /* c8 ignore next */ { var _a; /* c8 ignore next */ return (_a = schemaNode === null || schemaNode === void 0 ? void 0 : schemaNode.operationTypes) !== null && _a !== void 0 ? _a : []; })
        .find((operationNode) => operationNode.operation === operation)) === null || _a === void 0 ? void 0 : _a.type;
}
function validateDirectives(context) {
    var _a;
    for (const directive of context.schema.getDirectives()) {
        // Ensure all directives are in fact GraphQL directives.
        if (!(0, directives_1.isDirective)(directive)) {
            context.reportError(`Expected directive but got: ${(0, inspect_1.inspect)(directive)}.`, directive === null || directive === void 0 ? void 0 : directive.astNode);
            continue;
        }
        // Ensure they are named correctly.
        validateName(context, directive);
        // TODO: Ensure proper locations.
        // Ensure the arguments are valid.
        for (const arg of directive.args) {
            // Ensure they are named correctly.
            validateName(context, arg);
            // Ensure the type is an input type.
            if (!(0, definition_1.isInputType)(arg.type)) {
                context.reportError(`The type of @${directive.name}(${arg.name}:) must be Input Type ` +
                    `but got: ${(0, inspect_1.inspect)(arg.type)}.`, arg.astNode);
            }
            if ((0, definition_1.isRequiredArgument)(arg) && arg.deprecationReason != null) {
                context.reportError(`Required argument @${directive.name}(${arg.name}:) cannot be deprecated.`, [getDeprecatedDirectiveNode(arg.astNode), (_a = arg.astNode) === null || _a === void 0 ? void 0 : _a.type]);
            }
        }
    }
}
function validateName(context, node) {
    // Ensure names are valid, however introspection types opt out.
    if (node.name.startsWith('__')) {
        context.reportError(`Name "${node.name}" must not begin with "__", which is reserved by GraphQL introspection.`, node.astNode);
    }
}
function validateTypes(context) {
    const validateInputObjectCircularRefs = createInputObjectCircularRefsValidator(context);
    const typeMap = context.schema.getTypeMap();
    for (const type of Object.values(typeMap)) {
        // Ensure all provided types are in fact GraphQL type.
        if (!(0, definition_1.isNamedType)(type)) {
            context.reportError(`Expected GraphQL named type but got: ${(0, inspect_1.inspect)(type)}.`, type.astNode);
            continue;
        }
        // Ensure it is named correctly (excluding introspection types).
        if (!(0, introspection_1.isIntrospectionType)(type)) {
            validateName(context, type);
        }
        if ((0, definition_1.isObjectType)(type)) {
            // Ensure fields are valid
            validateFields(context, type);
            // Ensure objects implement the interfaces they claim to.
            validateInterfaces(context, type);
        }
        else if ((0, definition_1.isInterfaceType)(type)) {
            // Ensure fields are valid.
            validateFields(context, type);
            // Ensure interfaces implement the interfaces they claim to.
            validateInterfaces(context, type);
        }
        else if ((0, definition_1.isUnionType)(type)) {
            // Ensure Unions include valid member types.
            validateUnionMembers(context, type);
        }
        else if ((0, definition_1.isEnumType)(type)) {
            // Ensure Enums have valid values.
            validateEnumValues(context, type);
        }
        else if ((0, definition_1.isInputObjectType)(type)) {
            // Ensure Input Object fields are valid.
            validateInputFields(context, type);
            // Ensure Input Objects do not contain non-nullable circular references
            validateInputObjectCircularRefs(type);
        }
    }
}
function validateFields(context, type) {
    var _a, _b, _c;
    const fields = Object.values(type.getFields());
    // Objects and Interfaces both must define one or more fields.
    if (fields.length === 0) {
        context.reportError(`Type ${type.name} must define one or more fields.`, [
            type.astNode,
            ...type.extensionASTNodes,
        ]);
    }
    for (const field of fields) {
        // Ensure they are named correctly.
        validateName(context, field);
        // Ensure the type is an output type
        if (!(0, definition_1.isOutputType)(field.type)) {
            context.reportError(`The type of ${type.name}.${field.name} must be Output Type ` +
                `but got: ${(0, inspect_1.inspect)(field.type)}.`, (_a = field.astNode) === null || _a === void 0 ? void 0 : _a.type);
        }
        // Ensure the arguments are valid
        for (const arg of field.args) {
            const argName = arg.name;
            // Ensure they are named correctly.
            validateName(context, arg);
            // Ensure the type is an input type
            if (!(0, definition_1.isInputType)(arg.type)) {
                context.reportError(`The type of ${type.name}.${field.name}(${argName}:) must be Input ` +
                    `Type but got: ${(0, inspect_1.inspect)(arg.type)}.`, (_b = arg.astNode) === null || _b === void 0 ? void 0 : _b.type);
            }
            if ((0, definition_1.isRequiredArgument)(arg) && arg.deprecationReason != null) {
                context.reportError(`Required argument ${type.name}.${field.name}(${argName}:) cannot be deprecated.`, [getDeprecatedDirectiveNode(arg.astNode), (_c = arg.astNode) === null || _c === void 0 ? void 0 : _c.type]);
            }
        }
    }
}
function validateInterfaces(context, type) {
    const ifaceTypeNames = Object.create(null);
    for (const iface of type.getInterfaces()) {
        if (!(0, definition_1.isInterfaceType)(iface)) {
            context.reportError(`Type ${(0, inspect_1.inspect)(type)} must only implement Interface types, ` +
                `it cannot implement ${(0, inspect_1.inspect)(iface)}.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        if (type === iface) {
            context.reportError(`Type ${type.name} cannot implement itself because it would create a circular reference.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        if (ifaceTypeNames[iface.name]) {
            context.reportError(`Type ${type.name} can only implement ${iface.name} once.`, getAllImplementsInterfaceNodes(type, iface));
            continue;
        }
        ifaceTypeNames[iface.name] = true;
        validateTypeImplementsAncestors(context, type, iface);
        validateTypeImplementsInterface(context, type, iface);
    }
}
function validateTypeImplementsInterface(context, type, iface) {
    var _a, _b, _c, _d;
    const typeFieldMap = type.getFields();
    // Assert each interface field is implemented.
    for (const ifaceField of Object.values(iface.getFields())) {
        const fieldName = ifaceField.name;
        const typeField = typeFieldMap[fieldName];
        // Assert interface field exists on type.
        if (!typeField) {
            context.reportError(`Interface field ${iface.name}.${fieldName} expected but ${type.name} does not provide it.`, [ifaceField.astNode, type.astNode, ...type.extensionASTNodes]);
            continue;
        }
        // Assert interface field type is satisfied by type field type, by being
        // a valid subtype. (covariant)
        if (!(0, typeComparators_1.isTypeSubTypeOf)(context.schema, typeField.type, ifaceField.type)) {
            context.reportError(`Interface field ${iface.name}.${fieldName} expects type ` +
                `${(0, inspect_1.inspect)(ifaceField.type)} but ${type.name}.${fieldName} ` +
                `is type ${(0, inspect_1.inspect)(typeField.type)}.`, [(_a = ifaceField.astNode) === null || _a === void 0 ? void 0 : _a.type, (_b = typeField.astNode) === null || _b === void 0 ? void 0 : _b.type]);
        }
        // Assert each interface field arg is implemented.
        for (const ifaceArg of ifaceField.args) {
            const argName = ifaceArg.name;
            const typeArg = typeField.args.find((arg) => arg.name === argName);
            // Assert interface field arg exists on object field.
            if (!typeArg) {
                context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) expected but ${type.name}.${fieldName} does not provide it.`, [ifaceArg.astNode, typeField.astNode]);
                continue;
            }
            // Assert interface field arg type matches object field arg type.
            // (invariant)
            // TODO: change to contravariant?
            if (!(0, typeComparators_1.isEqualType)(ifaceArg.type, typeArg.type)) {
                context.reportError(`Interface field argument ${iface.name}.${fieldName}(${argName}:) ` +
                    `expects type ${(0, inspect_1.inspect)(ifaceArg.type)} but ` +
                    `${type.name}.${fieldName}(${argName}:) is type ` +
                    `${(0, inspect_1.inspect)(typeArg.type)}.`, [(_c = ifaceArg.astNode) === null || _c === void 0 ? void 0 : _c.type, (_d = typeArg.astNode) === null || _d === void 0 ? void 0 : _d.type]);
            }
            // TODO: validate default values?
        }
        // Assert additional arguments must not be required.
        for (const typeArg of typeField.args) {
            const argName = typeArg.name;
            const ifaceArg = ifaceField.args.find((arg) => arg.name === argName);
            if (!ifaceArg && (0, definition_1.isRequiredArgument)(typeArg)) {
                context.reportError(`Object field ${type.name}.${fieldName} includes required argument ${argName} that is missing from the Interface field ${iface.name}.${fieldName}.`, [typeArg.astNode, ifaceField.astNode]);
            }
        }
    }
}
function validateTypeImplementsAncestors(context, type, iface) {
    const ifaceInterfaces = type.getInterfaces();
    for (const transitive of iface.getInterfaces()) {
        if (!ifaceInterfaces.includes(transitive)) {
            context.reportError(transitive === type
                ? `Type ${type.name} cannot implement ${iface.name} because it would create a circular reference.`
                : `Type ${type.name} must implement ${transitive.name} because it is implemented by ${iface.name}.`, [
                ...getAllImplementsInterfaceNodes(iface, transitive),
                ...getAllImplementsInterfaceNodes(type, iface),
            ]);
        }
    }
}
function validateUnionMembers(context, union) {
    const memberTypes = union.getTypes();
    if (memberTypes.length === 0) {
        context.reportError(`Union type ${union.name} must define one or more member types.`, [union.astNode, ...union.extensionASTNodes]);
    }
    const includedTypeNames = Object.create(null);
    for (const memberType of memberTypes) {
        if (includedTypeNames[memberType.name]) {
            context.reportError(`Union type ${union.name} can only include type ${memberType.name} once.`, getUnionMemberTypeNodes(union, memberType.name));
            continue;
        }
        includedTypeNames[memberType.name] = true;
        if (!(0, definition_1.isObjectType)(memberType)) {
            context.reportError(`Union type ${union.name} can only include Object types, ` +
                `it cannot include ${(0, inspect_1.inspect)(memberType)}.`, getUnionMemberTypeNodes(union, String(memberType)));
        }
    }
}
function validateEnumValues(context, enumType) {
    const enumValues = enumType.getValues();
    if (enumValues.length === 0) {
        context.reportError(`Enum type ${enumType.name} must define one or more values.`, [enumType.astNode, ...enumType.extensionASTNodes]);
    }
    for (const enumValue of enumValues) {
        // Ensure valid name.
        validateName(context, enumValue);
    }
}
function validateInputFields(context, inputObj) {
    var _a, _b;
    const fields = Object.values(inputObj.getFields());
    if (fields.length === 0) {
        context.reportError(`Input Object type ${inputObj.name} must define one or more fields.`, [inputObj.astNode, ...inputObj.extensionASTNodes]);
    }
    // Ensure the arguments are valid
    for (const field of fields) {
        // Ensure they are named correctly.
        validateName(context, field);
        // Ensure the type is an input type
        if (!(0, definition_1.isInputType)(field.type)) {
            context.reportError(`The type of ${inputObj.name}.${field.name} must be Input Type ` +
                `but got: ${(0, inspect_1.inspect)(field.type)}.`, (_a = field.astNode) === null || _a === void 0 ? void 0 : _a.type);
        }
        if ((0, definition_1.isRequiredInputField)(field) && field.deprecationReason != null) {
            context.reportError(`Required input field ${inputObj.name}.${field.name} cannot be deprecated.`, [getDeprecatedDirectiveNode(field.astNode), (_b = field.astNode) === null || _b === void 0 ? void 0 : _b.type]);
        }
    }
}
function createInputObjectCircularRefsValidator(context) {
    // Modified copy of algorithm from 'src/validation/rules/NoFragmentCycles.js'.
    // Tracks already visited types to maintain O(N) and to ensure that cycles
    // are not redundantly reported.
    const visitedTypes = Object.create(null);
    // Array of types nodes used to produce meaningful errors
    const fieldPath = [];
    // Position in the type path
    const fieldPathIndexByTypeName = Object.create(null);
    return detectCycleRecursive;
    // This does a straight-forward DFS to find cycles.
    // It does not terminate when a cycle was found but continues to explore
    // the graph to find all possible cycles.
    function detectCycleRecursive(inputObj) {
        if (visitedTypes[inputObj.name]) {
            return;
        }
        visitedTypes[inputObj.name] = true;
        fieldPathIndexByTypeName[inputObj.name] = fieldPath.length;
        const fields = Object.values(inputObj.getFields());
        for (const field of fields) {
            if ((0, definition_1.isNonNullType)(field.type) && (0, definition_1.isInputObjectType)(field.type.ofType)) {
                const fieldType = field.type.ofType;
                const cycleIndex = fieldPathIndexByTypeName[fieldType.name];
                fieldPath.push(field);
                if (cycleIndex === undefined) {
                    detectCycleRecursive(fieldType);
                }
                else {
                    const cyclePath = fieldPath.slice(cycleIndex);
                    const pathStr = cyclePath.map((fieldObj) => fieldObj.name).join('.');
                    context.reportError(`Cannot reference Input Object "${fieldType.name}" within itself through a series of non-null fields: "${pathStr}".`, cyclePath.map((fieldObj) => fieldObj.astNode));
                }
                fieldPath.pop();
            }
        }
        fieldPathIndexByTypeName[inputObj.name] = undefined;
    }
}
function getAllImplementsInterfaceNodes(type, iface) {
    const { astNode, extensionASTNodes } = type;
    const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
    // FIXME: https://github.com/graphql/graphql-js/issues/2203
    return nodes
        .flatMap((typeNode) => /* c8 ignore next */ { var _a; /* c8 ignore next */ return (_a = typeNode.interfaces) !== null && _a !== void 0 ? _a : []; })
        .filter((ifaceNode) => ifaceNode.name.value === iface.name);
}
function getUnionMemberTypeNodes(union, typeName) {
    const { astNode, extensionASTNodes } = union;
    const nodes = astNode != null ? [astNode, ...extensionASTNodes] : extensionASTNodes;
    // FIXME: https://github.com/graphql/graphql-js/issues/2203
    return nodes
        .flatMap((unionNode) => /* c8 ignore next */ { var _a; /* c8 ignore next */ return (_a = unionNode.types) !== null && _a !== void 0 ? _a : []; })
        .filter((typeNode) => typeNode.name.value === typeName);
}
function getDeprecatedDirectiveNode(definitionNode) {
    var _a;
    return (_a = definitionNode === null || definitionNode === void 0 ? void 0 : definitionNode.directives) === null || _a === void 0 ? void 0 : _a.find((node) => node.name.value === directives_1.GraphQLDeprecatedDirective.name);
}
//# sourceMappingURL=validate.js.map