"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const inspect_1 = require("../../jsutils/inspect");
const parser_1 = require("../../language/parser");
const definition_1 = require("../../type/definition");
const scalars_1 = require("../../type/scalars");
const schema_1 = require("../../type/schema");
const ValuesOfCorrectTypeRule_1 = require("../rules/ValuesOfCorrectTypeRule");
const validate_1 = require("../validate");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(ValuesOfCorrectTypeRule_1.ValuesOfCorrectTypeRule, queryStr);
}
function expectErrorsWithSchema(schema, queryStr) {
    return (0, harness_1.expectValidationErrorsWithSchema)(schema, ValuesOfCorrectTypeRule_1.ValuesOfCorrectTypeRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
function expectValidWithSchema(schema, queryStr) {
    expectErrorsWithSchema(schema, queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Values of correct type', () => {
    (0, mocha_1.describe)('Valid values', () => {
        (0, mocha_1.it)('Good int value', () => {
            expectValid(`
        {
          complicatedArgs {
            intArgField(intArg: 2)
          }
        }
      `);
        });
        (0, mocha_1.it)('Good negative int value', () => {
            expectValid(`
        {
          complicatedArgs {
            intArgField(intArg: -2)
          }
        }
      `);
        });
        (0, mocha_1.it)('Good boolean value', () => {
            expectValid(`
        {
          complicatedArgs {
            booleanArgField(booleanArg: true)
          }
        }
      `);
        });
        (0, mocha_1.it)('Good string value', () => {
            expectValid(`
        {
          complicatedArgs {
            stringArgField(stringArg: "foo")
          }
        }
      `);
        });
        (0, mocha_1.it)('Good float value', () => {
            expectValid(`
        {
          complicatedArgs {
            floatArgField(floatArg: 1.1)
          }
        }
      `);
        });
        (0, mocha_1.it)('Good negative float value', () => {
            expectValid(`
        {
          complicatedArgs {
            floatArgField(floatArg: -1.1)
          }
        }
      `);
        });
        (0, mocha_1.it)('Int into Float', () => {
            expectValid(`
        {
          complicatedArgs {
            floatArgField(floatArg: 1)
          }
        }
      `);
        });
        (0, mocha_1.it)('Int into ID', () => {
            expectValid(`
        {
          complicatedArgs {
            idArgField(idArg: 1)
          }
        }
      `);
        });
        (0, mocha_1.it)('String into ID', () => {
            expectValid(`
        {
          complicatedArgs {
            idArgField(idArg: "someIdString")
          }
        }
      `);
        });
        (0, mocha_1.it)('Good enum value', () => {
            expectValid(`
        {
          dog {
            doesKnowCommand(dogCommand: SIT)
          }
        }
      `);
        });
        (0, mocha_1.it)('Enum with undefined value', () => {
            expectValid(`
        {
          complicatedArgs {
            enumArgField(enumArg: UNKNOWN)
          }
        }
      `);
        });
        (0, mocha_1.it)('Enum with null value', () => {
            expectValid(`
        {
          complicatedArgs {
            enumArgField(enumArg: NO_FUR)
          }
        }
      `);
        });
        (0, mocha_1.it)('null into nullable type', () => {
            expectValid(`
        {
          complicatedArgs {
            intArgField(intArg: null)
          }
        }
      `);
            expectValid(`
        {
          dog(a: null, b: null, c:{ requiredField: true, intField: null }) {
            name
          }
        }
      `);
        });
    });
    (0, mocha_1.describe)('Invalid String values', () => {
        (0, mocha_1.it)('Int into String', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringArgField(stringArg: 1)
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 1',
                    locations: [{ line: 4, column: 39 }],
                },
            ]);
        });
        (0, mocha_1.it)('Float into String', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringArgField(stringArg: 1.0)
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 1.0',
                    locations: [{ line: 4, column: 39 }],
                },
            ]);
        });
        (0, mocha_1.it)('Boolean into String', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringArgField(stringArg: true)
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: true',
                    locations: [{ line: 4, column: 39 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unquoted String into String', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringArgField(stringArg: BAR)
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: BAR',
                    locations: [{ line: 4, column: 39 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Invalid Int values', () => {
        (0, mocha_1.it)('String into Int', () => {
            expectErrors(`
        {
          complicatedArgs {
            intArgField(intArg: "3")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: "3"',
                    locations: [{ line: 4, column: 33 }],
                },
            ]);
        });
        (0, mocha_1.it)('Big Int into Int', () => {
            expectErrors(`
        {
          complicatedArgs {
            intArgField(intArg: 829384293849283498239482938)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non 32-bit signed integer value: 829384293849283498239482938',
                    locations: [{ line: 4, column: 33 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unquoted String into Int', () => {
            expectErrors(`
        {
          complicatedArgs {
            intArgField(intArg: FOO)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: FOO',
                    locations: [{ line: 4, column: 33 }],
                },
            ]);
        });
        (0, mocha_1.it)('Simple Float into Int', () => {
            expectErrors(`
        {
          complicatedArgs {
            intArgField(intArg: 3.0)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: 3.0',
                    locations: [{ line: 4, column: 33 }],
                },
            ]);
        });
        (0, mocha_1.it)('Float into Int', () => {
            expectErrors(`
        {
          complicatedArgs {
            intArgField(intArg: 3.333)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: 3.333',
                    locations: [{ line: 4, column: 33 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Invalid Float values', () => {
        (0, mocha_1.it)('String into Float', () => {
            expectErrors(`
        {
          complicatedArgs {
            floatArgField(floatArg: "3.333")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Float cannot represent non numeric value: "3.333"',
                    locations: [{ line: 4, column: 37 }],
                },
            ]);
        });
        (0, mocha_1.it)('Boolean into Float', () => {
            expectErrors(`
        {
          complicatedArgs {
            floatArgField(floatArg: true)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Float cannot represent non numeric value: true',
                    locations: [{ line: 4, column: 37 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unquoted into Float', () => {
            expectErrors(`
        {
          complicatedArgs {
            floatArgField(floatArg: FOO)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Float cannot represent non numeric value: FOO',
                    locations: [{ line: 4, column: 37 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Invalid Boolean value', () => {
        (0, mocha_1.it)('Int into Boolean', () => {
            expectErrors(`
        {
          complicatedArgs {
            booleanArgField(booleanArg: 2)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: 2',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Float into Boolean', () => {
            expectErrors(`
        {
          complicatedArgs {
            booleanArgField(booleanArg: 1.0)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: 1.0',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('String into Boolean', () => {
            expectErrors(`
        {
          complicatedArgs {
            booleanArgField(booleanArg: "true")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: "true"',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unquoted into Boolean', () => {
            expectErrors(`
        {
          complicatedArgs {
            booleanArgField(booleanArg: TRUE)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: TRUE',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Invalid ID value', () => {
        (0, mocha_1.it)('Float into ID', () => {
            expectErrors(`
        {
          complicatedArgs {
            idArgField(idArg: 1.0)
          }
        }
      `).toDeepEqual([
                {
                    message: 'ID cannot represent a non-string and non-integer value: 1.0',
                    locations: [{ line: 4, column: 31 }],
                },
            ]);
        });
        (0, mocha_1.it)('Boolean into ID', () => {
            expectErrors(`
        {
          complicatedArgs {
            idArgField(idArg: true)
          }
        }
      `).toDeepEqual([
                {
                    message: 'ID cannot represent a non-string and non-integer value: true',
                    locations: [{ line: 4, column: 31 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unquoted into ID', () => {
            expectErrors(`
        {
          complicatedArgs {
            idArgField(idArg: SOMETHING)
          }
        }
      `).toDeepEqual([
                {
                    message: 'ID cannot represent a non-string and non-integer value: SOMETHING',
                    locations: [{ line: 4, column: 31 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Invalid Enum value', () => {
        (0, mocha_1.it)('Int into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: 2)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Enum "DogCommand" cannot represent non-enum value: 2.',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Float into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: 1.0)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Enum "DogCommand" cannot represent non-enum value: 1.0.',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('String into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: "SIT")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Enum "DogCommand" cannot represent non-enum value: "SIT". Did you mean the enum value "SIT"?',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Boolean into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: true)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Enum "DogCommand" cannot represent non-enum value: true.',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Unknown Enum Value into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: JUGGLE)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Value "JUGGLE" does not exist in "DogCommand" enum.',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Different case Enum Value into Enum', () => {
            expectErrors(`
        {
          dog {
            doesKnowCommand(dogCommand: sit)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Value "sit" does not exist in "DogCommand" enum. Did you mean the enum value "SIT"?',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Valid List value', () => {
        (0, mocha_1.it)('Good list value', () => {
            expectValid(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: ["one", null, "two"])
          }
        }
      `);
        });
        (0, mocha_1.it)('Empty list value', () => {
            expectValid(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: [])
          }
        }
      `);
        });
        (0, mocha_1.it)('Null value', () => {
            expectValid(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: null)
          }
        }
      `);
        });
        (0, mocha_1.it)('Single value into List', () => {
            expectValid(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: "one")
          }
        }
      `);
        });
    });
    (0, mocha_1.describe)('Invalid List value', () => {
        (0, mocha_1.it)('Incorrect item type', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: ["one", 2])
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 2',
                    locations: [{ line: 4, column: 55 }],
                },
            ]);
        });
        (0, mocha_1.it)('Single value of incorrect type', () => {
            expectErrors(`
        {
          complicatedArgs {
            stringListArgField(stringListArg: 1)
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 1',
                    locations: [{ line: 4, column: 47 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Valid non-nullable value', () => {
        (0, mocha_1.it)('Arg on optional arg', () => {
            expectValid(`
        {
          dog {
            isHouseTrained(atOtherHomes: true)
          }
        }
      `);
        });
        (0, mocha_1.it)('No Arg on optional arg', () => {
            expectValid(`
        {
          dog {
            isHouseTrained
          }
        }
      `);
        });
        (0, mocha_1.it)('Multiple args', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleReqs(req1: 1, req2: 2)
          }
        }
      `);
        });
        (0, mocha_1.it)('Multiple args reverse order', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleReqs(req2: 2, req1: 1)
          }
        }
      `);
        });
        (0, mocha_1.it)('No args on multiple optional', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOpts
          }
        }
      `);
        });
        (0, mocha_1.it)('One arg on multiple optional', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOpts(opt1: 1)
          }
        }
      `);
        });
        (0, mocha_1.it)('Second arg on multiple optional', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOpts(opt2: 1)
          }
        }
      `);
        });
        (0, mocha_1.it)('Multiple required args on mixedList', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOptAndReq(req1: 3, req2: 4)
          }
        }
      `);
        });
        (0, mocha_1.it)('Multiple required and one optional arg on mixedList', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOptAndReq(req1: 3, req2: 4, opt1: 5)
          }
        }
      `);
        });
        (0, mocha_1.it)('All required and optional args on mixedList', () => {
            expectValid(`
        {
          complicatedArgs {
            multipleOptAndReq(req1: 3, req2: 4, opt1: 5, opt2: 6)
          }
        }
      `);
        });
    });
    (0, mocha_1.describe)('Invalid non-nullable value', () => {
        (0, mocha_1.it)('Incorrect value type', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs(req2: "two", req1: "one")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: "two"',
                    locations: [{ line: 4, column: 32 }],
                },
                {
                    message: 'Int cannot represent non-integer value: "one"',
                    locations: [{ line: 4, column: 45 }],
                },
            ]);
        });
        (0, mocha_1.it)('Incorrect value and missing argument (ProvidedRequiredArgumentsRule)', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs(req1: "one")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: "one"',
                    locations: [{ line: 4, column: 32 }],
                },
            ]);
        });
        (0, mocha_1.it)('Null value', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs(req1: null)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Expected value of type "Int!", found null.',
                    locations: [{ line: 4, column: 32 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Valid input object value', () => {
        (0, mocha_1.it)('Optional arg, despite required field in type', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField
          }
        }
      `);
        });
        (0, mocha_1.it)('Partial object, only required', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField(complexArg: { requiredField: true })
          }
        }
      `);
        });
        (0, mocha_1.it)('Partial object, required field can be falsy', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField(complexArg: { requiredField: false })
          }
        }
      `);
        });
        (0, mocha_1.it)('Partial object, including required', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField(complexArg: { requiredField: true, intField: 4 })
          }
        }
      `);
        });
        (0, mocha_1.it)('Full object', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField(complexArg: {
              requiredField: true,
              intField: 4,
              stringField: "foo",
              booleanField: false,
              stringListField: ["one", "two"]
            })
          }
        }
      `);
        });
        (0, mocha_1.it)('Full object with fields in different order', () => {
            expectValid(`
        {
          complicatedArgs {
            complexArgField(complexArg: {
              stringListField: ["one", "two"],
              booleanField: false,
              requiredField: true,
              stringField: "foo",
              intField: 4,
            })
          }
        }
      `);
        });
    });
    (0, mocha_1.describe)('Invalid input object value', () => {
        (0, mocha_1.it)('Partial object, missing required', () => {
            expectErrors(`
        {
          complicatedArgs {
            complexArgField(complexArg: { intField: 4 })
          }
        }
      `).toDeepEqual([
                {
                    message: 'Field "ComplexInput.requiredField" of required type "Boolean!" was not provided.',
                    locations: [{ line: 4, column: 41 }],
                },
            ]);
        });
        (0, mocha_1.it)('Partial object, invalid field type', () => {
            expectErrors(`
        {
          complicatedArgs {
            complexArgField(complexArg: {
              stringListField: ["one", 2],
              requiredField: true,
            })
          }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 2',
                    locations: [{ line: 5, column: 40 }],
                },
            ]);
        });
        (0, mocha_1.it)('Partial object, null to non-null field', () => {
            expectErrors(`
        {
          complicatedArgs {
            complexArgField(complexArg: {
              requiredField: true,
              nonNullField: null,
            })
          }
        }
      `).toDeepEqual([
                {
                    message: 'Expected value of type "Boolean!", found null.',
                    locations: [{ line: 6, column: 29 }],
                },
            ]);
        });
        (0, mocha_1.it)('Partial object, unknown field arg', () => {
            expectErrors(`
        {
          complicatedArgs {
            complexArgField(complexArg: {
              requiredField: true,
              invalidField: "value"
            })
          }
        }
      `).toDeepEqual([
                {
                    message: 'Field "invalidField" is not defined by type "ComplexInput". Did you mean "intField"?',
                    locations: [{ line: 6, column: 15 }],
                },
            ]);
        });
        (0, mocha_1.it)('reports original error for custom scalar which throws', () => {
            const customScalar = new definition_1.GraphQLScalarType({
                name: 'Invalid',
                parseValue(value) {
                    throw new Error(`Invalid scalar is always invalid: ${(0, inspect_1.inspect)(value)}`);
                },
            });
            const schema = new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        invalidArg: {
                            type: scalars_1.GraphQLString,
                            args: { arg: { type: customScalar } },
                        },
                    },
                }),
            });
            const doc = (0, parser_1.parse)('{ invalidArg(arg: 123) }');
            const errors = (0, validate_1.validate)(schema, doc, [ValuesOfCorrectTypeRule_1.ValuesOfCorrectTypeRule]);
            (0, expectJSON_1.expectJSON)(errors).toDeepEqual([
                {
                    message: 'Expected value of type "Invalid", found 123; Invalid scalar is always invalid: 123',
                    locations: [{ line: 1, column: 19 }],
                },
            ]);
            (0, chai_1.expect)(errors[0]).to.have.nested.property('originalError.message', 'Invalid scalar is always invalid: 123');
        });
        (0, mocha_1.it)('reports error for custom scalar that returns undefined', () => {
            const customScalar = new definition_1.GraphQLScalarType({
                name: 'CustomScalar',
                parseValue() {
                    return undefined;
                },
            });
            const schema = new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        invalidArg: {
                            type: scalars_1.GraphQLString,
                            args: { arg: { type: customScalar } },
                        },
                    },
                }),
            });
            expectErrorsWithSchema(schema, '{ invalidArg(arg: 123) }').toDeepEqual([
                {
                    message: 'Expected value of type "CustomScalar", found 123.',
                    locations: [{ line: 1, column: 19 }],
                },
            ]);
        });
        (0, mocha_1.it)('allows custom scalar to accept complex literals', () => {
            const customScalar = new definition_1.GraphQLScalarType({ name: 'Any' });
            const schema = new schema_1.GraphQLSchema({
                query: new definition_1.GraphQLObjectType({
                    name: 'Query',
                    fields: {
                        anyArg: {
                            type: scalars_1.GraphQLString,
                            args: { arg: { type: customScalar } },
                        },
                    },
                }),
            });
            expectValidWithSchema(schema, `
          {
            test1: anyArg(arg: 123)
            test2: anyArg(arg: "abc")
            test3: anyArg(arg: [123, "abc"])
            test4: anyArg(arg: {deep: [123, "abc"]})
          }
        `);
        });
    });
    (0, mocha_1.describe)('Directive arguments', () => {
        (0, mocha_1.it)('with directives of valid types', () => {
            expectValid(`
        {
          dog @include(if: true) {
            name
          }
          human @skip(if: false) {
            name
          }
        }
      `);
        });
        (0, mocha_1.it)('with directive with incorrect types', () => {
            expectErrors(`
        {
          dog @include(if: "yes") {
            name @skip(if: ENUM)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: "yes"',
                    locations: [{ line: 3, column: 28 }],
                },
                {
                    message: 'Boolean cannot represent a non boolean value: ENUM',
                    locations: [{ line: 4, column: 28 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Variable default values', () => {
        (0, mocha_1.it)('variables with valid default values', () => {
            expectValid(`
        query WithDefaultValues(
          $a: Int = 1,
          $b: String = "ok",
          $c: ComplexInput = { requiredField: true, intField: 3 }
          $d: Int! = 123
        ) {
          dog { name }
        }
      `);
        });
        (0, mocha_1.it)('variables with valid default null values', () => {
            expectValid(`
        query WithDefaultValues(
          $a: Int = null,
          $b: String = null,
          $c: ComplexInput = { requiredField: true, intField: null }
        ) {
          dog { name }
        }
      `);
        });
        (0, mocha_1.it)('variables with invalid default null values', () => {
            expectErrors(`
        query WithDefaultValues(
          $a: Int! = null,
          $b: String! = null,
          $c: ComplexInput = { requiredField: null, intField: null }
        ) {
          dog { name }
        }
      `).toDeepEqual([
                {
                    message: 'Expected value of type "Int!", found null.',
                    locations: [{ line: 3, column: 22 }],
                },
                {
                    message: 'Expected value of type "String!", found null.',
                    locations: [{ line: 4, column: 25 }],
                },
                {
                    message: 'Expected value of type "Boolean!", found null.',
                    locations: [{ line: 5, column: 47 }],
                },
            ]);
        });
        (0, mocha_1.it)('variables with invalid default values', () => {
            expectErrors(`
        query InvalidDefaultValues(
          $a: Int = "one",
          $b: String = 4,
          $c: ComplexInput = "NotVeryComplex"
        ) {
          dog { name }
        }
      `).toDeepEqual([
                {
                    message: 'Int cannot represent non-integer value: "one"',
                    locations: [{ line: 3, column: 21 }],
                },
                {
                    message: 'String cannot represent a non string value: 4',
                    locations: [{ line: 4, column: 24 }],
                },
                {
                    message: 'Expected value of type "ComplexInput", found "NotVeryComplex".',
                    locations: [{ line: 5, column: 30 }],
                },
            ]);
        });
        (0, mocha_1.it)('variables with complex invalid default values', () => {
            expectErrors(`
        query WithDefaultValues(
          $a: ComplexInput = { requiredField: 123, intField: "abc" }
        ) {
          dog { name }
        }
      `).toDeepEqual([
                {
                    message: 'Boolean cannot represent a non boolean value: 123',
                    locations: [{ line: 3, column: 47 }],
                },
                {
                    message: 'Int cannot represent non-integer value: "abc"',
                    locations: [{ line: 3, column: 62 }],
                },
            ]);
        });
        (0, mocha_1.it)('complex variables missing required field', () => {
            expectErrors(`
        query MissingRequiredField($a: ComplexInput = {intField: 3}) {
          dog { name }
        }
      `).toDeepEqual([
                {
                    message: 'Field "ComplexInput.requiredField" of required type "Boolean!" was not provided.',
                    locations: [{ line: 2, column: 55 }],
                },
            ]);
        });
        (0, mocha_1.it)('list variables with invalid item', () => {
            expectErrors(`
        query InvalidItem($a: [String] = ["one", 2]) {
          dog { name }
        }
      `).toDeepEqual([
                {
                    message: 'String cannot represent a non string value: 2',
                    locations: [{ line: 2, column: 50 }],
                },
            ]);
        });
    });
});
//# sourceMappingURL=ValuesOfCorrectTypeRule-test.js.map