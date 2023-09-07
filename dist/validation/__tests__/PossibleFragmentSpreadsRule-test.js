"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const PossibleFragmentSpreadsRule_1 = require("../rules/PossibleFragmentSpreadsRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrorsWithSchema)(testSchema, PossibleFragmentSpreadsRule_1.PossibleFragmentSpreadsRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
const testSchema = (0, buildASTSchema_1.buildSchema)(`
  interface Being {
    name: String
  }

  interface Pet implements Being {
    name: String
  }

  type Dog implements Being & Pet {
    name: String
    barkVolume: Int
  }

  type Cat implements Being & Pet {
    name: String
    meowVolume: Int
  }

  union CatOrDog = Cat | Dog

  interface Intelligent {
    iq: Int
  }

  type Human implements Being & Intelligent {
    name: String
    pets: [Pet]
    iq: Int
  }

  type Alien implements Being & Intelligent {
    name: String
    iq: Int
  }

  union DogOrHuman = Dog | Human

  union HumanOrAlien = Human | Alien

  type Query {
    catOrDog: CatOrDog
    dogOrHuman: DogOrHuman
    humanOrAlien: HumanOrAlien
  }
`);
(0, mocha_1.describe)('Validate: Possible fragment spreads', () => {
    (0, mocha_1.it)('of the same object', () => {
        expectValid(`
      fragment objectWithinObject on Dog { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `);
    });
    (0, mocha_1.it)('of the same object with inline fragment', () => {
        expectValid(`
      fragment objectWithinObjectAnon on Dog { ... on Dog { barkVolume } }
    `);
    });
    (0, mocha_1.it)('object into an implemented interface', () => {
        expectValid(`
      fragment objectWithinInterface on Pet { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `);
    });
    (0, mocha_1.it)('object into containing union', () => {
        expectValid(`
      fragment objectWithinUnion on CatOrDog { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `);
    });
    (0, mocha_1.it)('union into contained object', () => {
        expectValid(`
      fragment unionWithinObject on Dog { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `);
    });
    (0, mocha_1.it)('union into overlapping interface', () => {
        expectValid(`
      fragment unionWithinInterface on Pet { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `);
    });
    (0, mocha_1.it)('union into overlapping union', () => {
        expectValid(`
      fragment unionWithinUnion on DogOrHuman { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `);
    });
    (0, mocha_1.it)('interface into implemented object', () => {
        expectValid(`
      fragment interfaceWithinObject on Dog { ...petFragment }
      fragment petFragment on Pet { name }
    `);
    });
    (0, mocha_1.it)('interface into overlapping interface', () => {
        expectValid(`
      fragment interfaceWithinInterface on Pet { ...beingFragment }
      fragment beingFragment on Being { name }
    `);
    });
    (0, mocha_1.it)('interface into overlapping interface in inline fragment', () => {
        expectValid(`
      fragment interfaceWithinInterface on Pet { ... on Being { name } }
    `);
    });
    (0, mocha_1.it)('interface into overlapping union', () => {
        expectValid(`
      fragment interfaceWithinUnion on CatOrDog { ...petFragment }
      fragment petFragment on Pet { name }
    `);
    });
    (0, mocha_1.it)('ignores incorrect type (caught by FragmentsOnCompositeTypesRule)', () => {
        expectValid(`
      fragment petFragment on Pet { ...badInADifferentWay }
      fragment badInADifferentWay on String { name }
    `);
    });
    (0, mocha_1.it)('ignores unknown fragments (caught by KnownFragmentNamesRule)', () => {
        expectValid(`
      fragment petFragment on Pet { ...UnknownFragment }
    `);
    });
    (0, mocha_1.it)('different object into object', () => {
        expectErrors(`
      fragment invalidObjectWithinObject on Cat { ...dogFragment }
      fragment dogFragment on Dog { barkVolume }
    `).toDeepEqual([
            {
                message: 'Fragment "dogFragment" cannot be spread here as objects of type "Cat" can never be of type "Dog".',
                locations: [{ line: 2, column: 51 }],
            },
        ]);
    });
    (0, mocha_1.it)('different object into object in inline fragment', () => {
        expectErrors(`
      fragment invalidObjectWithinObjectAnon on Cat {
        ... on Dog { barkVolume }
      }
    `).toDeepEqual([
            {
                message: 'Fragment cannot be spread here as objects of type "Cat" can never be of type "Dog".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('object into not implementing interface', () => {
        expectErrors(`
      fragment invalidObjectWithinInterface on Pet { ...humanFragment }
      fragment humanFragment on Human { pets { name } }
    `).toDeepEqual([
            {
                message: 'Fragment "humanFragment" cannot be spread here as objects of type "Pet" can never be of type "Human".',
                locations: [{ line: 2, column: 54 }],
            },
        ]);
    });
    (0, mocha_1.it)('object into not containing union', () => {
        expectErrors(`
      fragment invalidObjectWithinUnion on CatOrDog { ...humanFragment }
      fragment humanFragment on Human { pets { name } }
    `).toDeepEqual([
            {
                message: 'Fragment "humanFragment" cannot be spread here as objects of type "CatOrDog" can never be of type "Human".',
                locations: [{ line: 2, column: 55 }],
            },
        ]);
    });
    (0, mocha_1.it)('union into not contained object', () => {
        expectErrors(`
      fragment invalidUnionWithinObject on Human { ...catOrDogFragment }
      fragment catOrDogFragment on CatOrDog { __typename }
    `).toDeepEqual([
            {
                message: 'Fragment "catOrDogFragment" cannot be spread here as objects of type "Human" can never be of type "CatOrDog".',
                locations: [{ line: 2, column: 52 }],
            },
        ]);
    });
    (0, mocha_1.it)('union into non overlapping interface', () => {
        expectErrors(`
      fragment invalidUnionWithinInterface on Pet { ...humanOrAlienFragment }
      fragment humanOrAlienFragment on HumanOrAlien { __typename }
    `).toDeepEqual([
            {
                message: 'Fragment "humanOrAlienFragment" cannot be spread here as objects of type "Pet" can never be of type "HumanOrAlien".',
                locations: [{ line: 2, column: 53 }],
            },
        ]);
    });
    (0, mocha_1.it)('union into non overlapping union', () => {
        expectErrors(`
      fragment invalidUnionWithinUnion on CatOrDog { ...humanOrAlienFragment }
      fragment humanOrAlienFragment on HumanOrAlien { __typename }
    `).toDeepEqual([
            {
                message: 'Fragment "humanOrAlienFragment" cannot be spread here as objects of type "CatOrDog" can never be of type "HumanOrAlien".',
                locations: [{ line: 2, column: 54 }],
            },
        ]);
    });
    (0, mocha_1.it)('interface into non implementing object', () => {
        expectErrors(`
      fragment invalidInterfaceWithinObject on Cat { ...intelligentFragment }
      fragment intelligentFragment on Intelligent { iq }
    `).toDeepEqual([
            {
                message: 'Fragment "intelligentFragment" cannot be spread here as objects of type "Cat" can never be of type "Intelligent".',
                locations: [{ line: 2, column: 54 }],
            },
        ]);
    });
    (0, mocha_1.it)('interface into non overlapping interface', () => {
        expectErrors(`
      fragment invalidInterfaceWithinInterface on Pet {
        ...intelligentFragment
      }
      fragment intelligentFragment on Intelligent { iq }
    `).toDeepEqual([
            {
                message: 'Fragment "intelligentFragment" cannot be spread here as objects of type "Pet" can never be of type "Intelligent".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('interface into non overlapping interface in inline fragment', () => {
        expectErrors(`
      fragment invalidInterfaceWithinInterfaceAnon on Pet {
        ...on Intelligent { iq }
      }
    `).toDeepEqual([
            {
                message: 'Fragment cannot be spread here as objects of type "Pet" can never be of type "Intelligent".',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('interface into non overlapping union', () => {
        expectErrors(`
      fragment invalidInterfaceWithinUnion on HumanOrAlien { ...petFragment }
      fragment petFragment on Pet { name }
    `).toDeepEqual([
            {
                message: 'Fragment "petFragment" cannot be spread here as objects of type "HumanOrAlien" can never be of type "Pet".',
                locations: [{ line: 2, column: 62 }],
            },
        ]);
    });
});
//# sourceMappingURL=PossibleFragmentSpreadsRule-test.js.map