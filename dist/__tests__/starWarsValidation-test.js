"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const parser_1 = require("../language/parser");
const source_1 = require("../language/source");
const validate_1 = require("../validation/validate");
const starWarsSchema_1 = require("./starWarsSchema");
/**
 * Helper function to test a query and the expected response.
 */
function validationErrors(query) {
    const source = new source_1.Source(query, 'StarWars.graphql');
    const ast = (0, parser_1.parse)(source);
    return (0, validate_1.validate)(starWarsSchema_1.StarWarsSchema, ast);
}
(0, mocha_1.describe)('Star Wars Validation Tests', () => {
    (0, mocha_1.describe)('Basic Queries', () => {
        (0, mocha_1.it)('Validates a complex but valid query', () => {
            const query = `
        query NestedQueryWithFragment {
          hero {
            ...NameAndAppearances
            friends {
              ...NameAndAppearances
              friends {
                ...NameAndAppearances
              }
            }
          }
        }

        fragment NameAndAppearances on Character {
          name
          appearsIn
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.be.empty;
        });
        (0, mocha_1.it)('Notes that non-existent fields are invalid', () => {
            const query = `
        query HeroSpaceshipQuery {
          hero {
            favoriteSpaceship
          }
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.not.be.empty;
        });
        (0, mocha_1.it)('Requires fields on objects', () => {
            const query = `
        query HeroNoFieldsQuery {
          hero
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.not.be.empty;
        });
        (0, mocha_1.it)('Disallows fields on scalars', () => {
            const query = `
        query HeroFieldsOnScalarQuery {
          hero {
            name {
              firstCharacterOfName
            }
          }
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.not.be.empty;
        });
        (0, mocha_1.it)('Disallows object fields on interfaces', () => {
            const query = `
        query DroidFieldOnCharacter {
          hero {
            name
            primaryFunction
          }
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.not.be.empty;
        });
        (0, mocha_1.it)('Allows object fields in fragments', () => {
            const query = `
        query DroidFieldInFragment {
          hero {
            name
            ...DroidFields
          }
        }

        fragment DroidFields on Droid {
          primaryFunction
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.be.empty;
        });
        (0, mocha_1.it)('Allows object fields in inline fragments', () => {
            const query = `
        query DroidFieldInFragment {
          hero {
            name
            ... on Droid {
              primaryFunction
            }
          }
        }
      `;
            return (0, chai_1.expect)(validationErrors(query)).to.be.empty;
        });
    });
});
//# sourceMappingURL=starWarsValidation-test.js.map