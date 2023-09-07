"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../../language/parser");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const FieldsOnCorrectTypeRule_1 = require("../rules/FieldsOnCorrectTypeRule");
const validate_1 = require("../validate");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrorsWithSchema)(testSchema, FieldsOnCorrectTypeRule_1.FieldsOnCorrectTypeRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
const testSchema = (0, buildASTSchema_1.buildSchema)(`
  interface Pet {
    name: String
  }

  type Dog implements Pet {
    name: String
    nickname: String
    barkVolume: Int
  }

  type Cat implements Pet {
    name: String
    nickname: String
    meowVolume: Int
  }

  union CatOrDog = Cat | Dog

  type Human {
    name: String
    pets: [Pet]
  }

  type Query {
    human: Human
  }
`);
(0, mocha_1.describe)('Validate: Fields on correct type', () => {
    (0, mocha_1.it)('Object field selection', () => {
        expectValid(`
      fragment objectFieldSelection on Dog {
        __typename
        name
      }
    `);
    });
    (0, mocha_1.it)('Aliased object field selection', () => {
        expectValid(`
      fragment aliasedObjectFieldSelection on Dog {
        tn : __typename
        otherName : name
      }
    `);
    });
    (0, mocha_1.it)('Interface field selection', () => {
        expectValid(`
      fragment interfaceFieldSelection on Pet {
        __typename
        name
      }
    `);
    });
    (0, mocha_1.it)('Aliased interface field selection', () => {
        expectValid(`
      fragment interfaceFieldSelection on Pet {
        otherName : name
      }
    `);
    });
    (0, mocha_1.it)('Lying alias selection', () => {
        expectValid(`
      fragment lyingAliasSelection on Dog {
        name : nickname
      }
    `);
    });
    (0, mocha_1.it)('Ignores fields on unknown type', () => {
        expectValid(`
      fragment unknownSelection on UnknownType {
        unknownField
      }
    `);
    });
    (0, mocha_1.it)('reports errors when type is known again', () => {
        expectErrors(`
      fragment typeKnownAgain on Pet {
        unknown_pet_field {
          ... on Cat {
            unknown_cat_field
          }
        }
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "unknown_pet_field" on type "Pet".',
                locations: [{ line: 3, column: 9 }],
            },
            {
                message: 'Cannot query field "unknown_cat_field" on type "Cat".',
                locations: [{ line: 5, column: 13 }],
            },
        ]);
    });
    (0, mocha_1.it)('Field not defined on fragment', () => {
        expectErrors(`
      fragment fieldNotDefined on Dog {
        meowVolume
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "meowVolume" on type "Dog". Did you mean "barkVolume"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Ignores deeply unknown field', () => {
        expectErrors(`
      fragment deepFieldNotDefined on Dog {
        unknown_field {
          deeper_unknown_field
        }
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "unknown_field" on type "Dog".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Sub-field not defined', () => {
        expectErrors(`
      fragment subFieldNotDefined on Human {
        pets {
          unknown_field
        }
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "unknown_field" on type "Pet".',
                locations: [{ line: 4, column: 11 }],
            },
        ]);
    });
    (0, mocha_1.it)('Field not defined on inline fragment', () => {
        expectErrors(`
      fragment fieldNotDefined on Pet {
        ... on Dog {
          meowVolume
        }
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "meowVolume" on type "Dog". Did you mean "barkVolume"?',
                locations: [{ line: 4, column: 11 }],
            },
        ]);
    });
    (0, mocha_1.it)('Aliased field target not defined', () => {
        expectErrors(`
      fragment aliasedFieldTargetNotDefined on Dog {
        volume : mooVolume
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "mooVolume" on type "Dog". Did you mean "barkVolume"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Aliased lying field target not defined', () => {
        expectErrors(`
      fragment aliasedLyingFieldTargetNotDefined on Dog {
        barkVolume : kawVolume
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "kawVolume" on type "Dog". Did you mean "barkVolume"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Not defined on interface', () => {
        expectErrors(`
      fragment notDefinedOnInterface on Pet {
        tailLength
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "tailLength" on type "Pet".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Defined on implementors but not on interface', () => {
        expectErrors(`
      fragment definedOnImplementorsButNotInterface on Pet {
        nickname
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "nickname" on type "Pet". Did you mean to use an inline fragment on "Cat" or "Dog"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Meta field selection on union', () => {
        expectValid(`
      fragment directFieldSelectionOnUnion on CatOrDog {
        __typename
      }
    `);
    });
    (0, mocha_1.it)('Direct field selection on union', () => {
        expectErrors(`
      fragment directFieldSelectionOnUnion on CatOrDog {
        directField
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "directField" on type "CatOrDog".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('Defined on implementors queried on union', () => {
        expectErrors(`
      fragment definedOnImplementorsQueriedOnUnion on CatOrDog {
        name
      }
    `).toDeepEqual([
            {
                message: 'Cannot query field "name" on type "CatOrDog". Did you mean to use an inline fragment on "Pet", "Cat", or "Dog"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('valid field in inline fragment', () => {
        expectValid(`
      fragment objectFieldSelection on Pet {
        ... on Dog {
          name
        }
        ... {
          name
        }
      }
    `);
    });
    (0, mocha_1.describe)('Fields on correct type error message', () => {
        function expectErrorMessage(schema, queryStr) {
            const errors = (0, validate_1.validate)(schema, (0, parser_1.parse)(queryStr), [
                FieldsOnCorrectTypeRule_1.FieldsOnCorrectTypeRule,
            ]);
            (0, chai_1.expect)(errors.length).to.equal(1);
            return (0, chai_1.expect)(errors[0].message);
        }
        (0, mocha_1.it)('Works with no suggestions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type T {
          fieldWithVeryLongNameThatWillNeverBeSuggested: String
        }
        type Query { t: T }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T".');
        });
        (0, mocha_1.it)('Works with no small numbers of type suggestions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        union T = A | B
        type Query { t: T }

        type A { f: String }
        type B { f: String }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T". Did you mean to use an inline fragment on "A" or "B"?');
        });
        (0, mocha_1.it)('Works with no small numbers of field suggestions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type T {
          y: String
          z: String
        }
        type Query { t: T }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T". Did you mean "y" or "z"?');
        });
        (0, mocha_1.it)('Only shows one set of suggestions at a time, preferring types', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        interface T {
          y: String
          z: String
        }
        type Query { t: T }

        type A implements T {
          f: String
          y: String
          z: String
        }
        type B implements T {
          f: String
          y: String
          z: String
        }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T". Did you mean to use an inline fragment on "A" or "B"?');
        });
        (0, mocha_1.it)('Sort type suggestions based on inheritance order', () => {
            const interfaceSchema = (0, buildASTSchema_1.buildSchema)(`
        interface T { bar: String }
        type Query { t: T }

        interface Z implements T {
          foo: String
          bar: String
        }

        interface Y implements Z & T {
          foo: String
          bar: String
        }

        type X implements Y & Z & T {
          foo: String
          bar: String
        }
      `);
            expectErrorMessage(interfaceSchema, '{ t { foo } }').to.equal('Cannot query field "foo" on type "T". Did you mean to use an inline fragment on "Z", "Y", or "X"?');
            const unionSchema = (0, buildASTSchema_1.buildSchema)(`
        interface Animal { name: String }
        interface Mammal implements Animal { name: String }

        interface Canine implements Animal & Mammal { name: String }
        type Dog implements Animal & Mammal & Canine { name: String }

        interface Feline implements Animal & Mammal { name: String }
        type Cat implements Animal & Mammal & Feline { name: String }

        union CatOrDog = Cat | Dog
        type Query { catOrDog: CatOrDog }
      `);
            expectErrorMessage(unionSchema, '{ catOrDog { name } }').to.equal('Cannot query field "name" on type "CatOrDog". Did you mean to use an inline fragment on "Animal", "Mammal", "Canine", "Dog", or "Feline"?');
        });
        (0, mocha_1.it)('Limits lots of type suggestions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        union T = A | B | C | D | E | F
        type Query { t: T }

        type A { f: String }
        type B { f: String }
        type C { f: String }
        type D { f: String }
        type E { f: String }
        type F { f: String }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T". Did you mean to use an inline fragment on "A", "B", "C", "D", or "E"?');
        });
        (0, mocha_1.it)('Limits lots of field suggestions', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type T {
          u: String
          v: String
          w: String
          x: String
          y: String
          z: String
        }
        type Query { t: T }
      `);
            expectErrorMessage(schema, '{ t { f } }').to.equal('Cannot query field "f" on type "T". Did you mean "u", "v", "w", "x", or "y"?');
        });
    });
});
//# sourceMappingURL=FieldsOnCorrectTypeRule-test.js.map