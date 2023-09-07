"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const ScalarLeafsRule_1 = require("../rules/ScalarLeafsRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(ScalarLeafsRule_1.ScalarLeafsRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Scalar leafs', () => {
    (0, mocha_1.it)('valid scalar selection', () => {
        expectValid(`
      fragment scalarSelection on Dog {
        barks
      }
    `);
    });
    (0, mocha_1.it)('object type missing selection', () => {
        expectErrors(`
      query directQueryOnObjectWithoutSubFields {
        human
      }
    `).toDeepEqual([
            {
                message: 'Field "human" of type "Human" must have a selection of subfields. Did you mean "human { ... }"?',
                locations: [{ line: 3, column: 9 }],
            },
        ]);
    });
    (0, mocha_1.it)('interface type missing selection', () => {
        expectErrors(`
      {
        human { pets }
      }
    `).toDeepEqual([
            {
                message: 'Field "pets" of type "[Pet]" must have a selection of subfields. Did you mean "pets { ... }"?',
                locations: [{ line: 3, column: 17 }],
            },
        ]);
    });
    (0, mocha_1.it)('valid scalar selection with args', () => {
        expectValid(`
      fragment scalarSelectionWithArgs on Dog {
        doesKnowCommand(dogCommand: SIT)
      }
    `);
    });
    (0, mocha_1.it)('scalar selection not allowed on Boolean', () => {
        expectErrors(`
      fragment scalarSelectionsNotAllowedOnBoolean on Dog {
        barks { sinceWhen }
      }
    `).toDeepEqual([
            {
                message: 'Field "barks" must not have a selection since type "Boolean" has no subfields.',
                locations: [{ line: 3, column: 15 }],
            },
        ]);
    });
    (0, mocha_1.it)('scalar selection not allowed on Enum', () => {
        expectErrors(`
      fragment scalarSelectionsNotAllowedOnEnum on Cat {
        furColor { inHexDec }
      }
    `).toDeepEqual([
            {
                message: 'Field "furColor" must not have a selection since type "FurColor" has no subfields.',
                locations: [{ line: 3, column: 18 }],
            },
        ]);
    });
    (0, mocha_1.it)('scalar selection not allowed with args', () => {
        expectErrors(`
      fragment scalarSelectionsNotAllowedWithArgs on Dog {
        doesKnowCommand(dogCommand: SIT) { sinceWhen }
      }
    `).toDeepEqual([
            {
                message: 'Field "doesKnowCommand" must not have a selection since type "Boolean" has no subfields.',
                locations: [{ line: 3, column: 42 }],
            },
        ]);
    });
    (0, mocha_1.it)('Scalar selection not allowed with directives', () => {
        expectErrors(`
      fragment scalarSelectionsNotAllowedWithDirectives on Dog {
        name @include(if: true) { isAlsoHumanName }
      }
    `).toDeepEqual([
            {
                message: 'Field "name" must not have a selection since type "String" has no subfields.',
                locations: [{ line: 3, column: 33 }],
            },
        ]);
    });
    (0, mocha_1.it)('Scalar selection not allowed with directives and args', () => {
        expectErrors(`
      fragment scalarSelectionsNotAllowedWithDirectivesAndArgs on Dog {
        doesKnowCommand(dogCommand: SIT) @include(if: true) { sinceWhen }
      }
    `).toDeepEqual([
            {
                message: 'Field "doesKnowCommand" must not have a selection since type "Boolean" has no subfields.',
                locations: [{ line: 3, column: 61 }],
            },
        ]);
    });
});
//# sourceMappingURL=ScalarLeafsRule-test.js.map