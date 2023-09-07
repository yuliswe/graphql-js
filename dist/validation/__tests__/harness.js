"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expectSDLValidationErrors = exports.expectValidationErrors = exports.expectValidationErrorsWithSchema = exports.testSchema = void 0;
const expectJSON_1 = require("../../__testUtils__/expectJSON");
const parser_1 = require("../../language/parser");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const validate_1 = require("../validate");
exports.testSchema = (0, buildASTSchema_1.buildSchema)(`
  interface Mammal {
    mother: Mammal
    father: Mammal
  }

  interface Pet {
    name(surname: Boolean): String
  }

  interface Canine implements Mammal {
    name(surname: Boolean): String
    mother: Canine
    father: Canine
  }

  enum DogCommand {
    SIT
    HEEL
    DOWN
  }

  type Dog implements Pet & Mammal & Canine {
    name(surname: Boolean): String
    nickname: String
    barkVolume: Int
    barks: Boolean
    doesKnowCommand(dogCommand: DogCommand): Boolean
    isHouseTrained(atOtherHomes: Boolean = true): Boolean
    isAtLocation(x: Int, y: Int): Boolean
    mother: Dog
    father: Dog
  }

  type Cat implements Pet {
    name(surname: Boolean): String
    nickname: String
    meows: Boolean
    meowsVolume: Int
    furColor: FurColor
  }

  union CatOrDog = Cat | Dog

  type Human {
    name(surname: Boolean): String
    pets: [Pet]
    relatives: [Human]
  }

  enum FurColor {
    BROWN
    BLACK
    TAN
    SPOTTED
    NO_FUR
    UNKNOWN
  }

  input ComplexInput {
    requiredField: Boolean!
    nonNullField: Boolean! = false
    intField: Int
    stringField: String
    booleanField: Boolean
    stringListField: [String]
  }

  type ComplicatedArgs {
    # TODO List
    # TODO Coercion
    # TODO NotNulls
    intArgField(intArg: Int): String
    nonNullIntArgField(nonNullIntArg: Int!): String
    stringArgField(stringArg: String): String
    booleanArgField(booleanArg: Boolean): String
    enumArgField(enumArg: FurColor): String
    floatArgField(floatArg: Float): String
    idArgField(idArg: ID): String
    stringListArgField(stringListArg: [String]): String
    stringListNonNullArgField(stringListNonNullArg: [String!]): String
    complexArgField(complexArg: ComplexInput): String
    multipleReqs(req1: Int!, req2: Int!): String
    nonNullFieldWithDefault(arg: Int! = 0): String
    multipleOpts(opt1: Int = 0, opt2: Int = 0): String
    multipleOptAndReq(req1: Int!, req2: Int!, opt1: Int = 0, opt2: Int = 0): String
  }

  type QueryRoot {
    human(id: ID): Human
    dog: Dog
    cat: Cat
    pet: Pet
    catOrDog: CatOrDog
    complicatedArgs: ComplicatedArgs
  }

  schema {
    query: QueryRoot
  }

  directive @onField on FIELD
`);
function expectValidationErrorsWithSchema(schema, rule, queryStr) {
    const doc = (0, parser_1.parse)(queryStr);
    const errors = (0, validate_1.validate)(schema, doc, [rule]);
    return (0, expectJSON_1.expectJSON)(errors);
}
exports.expectValidationErrorsWithSchema = expectValidationErrorsWithSchema;
function expectValidationErrors(rule, queryStr) {
    return expectValidationErrorsWithSchema(exports.testSchema, rule, queryStr);
}
exports.expectValidationErrors = expectValidationErrors;
function expectSDLValidationErrors(schema, rule, sdlStr) {
    const doc = (0, parser_1.parse)(sdlStr);
    const errors = (0, validate_1.validateSDL)(doc, schema, [rule]);
    return (0, expectJSON_1.expectJSON)(errors);
}
exports.expectSDLValidationErrors = expectSDLValidationErrors;
//# sourceMappingURL=harness.js.map