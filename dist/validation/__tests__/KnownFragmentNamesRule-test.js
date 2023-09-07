"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const KnownFragmentNamesRule_1 = require("../rules/KnownFragmentNamesRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(KnownFragmentNamesRule_1.KnownFragmentNamesRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Known fragment names', () => {
    (0, mocha_1.it)('known fragment names are valid', () => {
        expectValid(`
      {
        human(id: 4) {
          ...HumanFields1
          ... on Human {
            ...HumanFields2
          }
          ... {
            name
          }
        }
      }
      fragment HumanFields1 on Human {
        name
        ...HumanFields3
      }
      fragment HumanFields2 on Human {
        name
      }
      fragment HumanFields3 on Human {
        name
      }
    `);
    });
    (0, mocha_1.it)('unknown fragment names are invalid', () => {
        expectErrors(`
      {
        human(id: 4) {
          ...UnknownFragment1
          ... on Human {
            ...UnknownFragment2
          }
        }
      }
      fragment HumanFields on Human {
        name
        ...UnknownFragment3
      }
    `).toDeepEqual([
            {
                message: 'Unknown fragment "UnknownFragment1".',
                locations: [{ line: 4, column: 14 }],
            },
            {
                message: 'Unknown fragment "UnknownFragment2".',
                locations: [{ line: 6, column: 16 }],
            },
            {
                message: 'Unknown fragment "UnknownFragment3".',
                locations: [{ line: 12, column: 12 }],
            },
        ]);
    });
});
//# sourceMappingURL=KnownFragmentNamesRule-test.js.map