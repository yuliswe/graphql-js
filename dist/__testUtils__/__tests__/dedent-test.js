"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../dedent");
(0, mocha_1.describe)('dedentString', () => {
    (0, mocha_1.it)('removes indentation in typical usage', () => {
        const output = (0, dedent_1.dedentString)(`
      type Query {
        me: User
      }

      type User {
        id: ID
        name: String
      }
    `);
        (0, chai_1.expect)(output).to.equal([
            'type Query {',
            '  me: User',
            '}',
            '',
            'type User {',
            '  id: ID',
            '  name: String',
            '}',
        ].join('\n'));
    });
    (0, mocha_1.it)('removes only the first level of indentation', () => {
        const output = (0, dedent_1.dedentString)(`
            first
              second
                third
                  fourth
    `);
        (0, chai_1.expect)(output).to.equal(['first', '  second', '    third', '      fourth'].join('\n'));
    });
    (0, mocha_1.it)('does not escape special characters', () => {
        const output = (0, dedent_1.dedentString)(`
      type Root {
        field(arg: String = "wi\th de\fault"): String
      }
    `);
        (0, chai_1.expect)(output).to.equal([
            'type Root {',
            '  field(arg: String = "wi\th de\fault"): String',
            '}',
        ].join('\n'));
    });
    (0, mocha_1.it)('also removes indentation using tabs', () => {
        const output = (0, dedent_1.dedentString)(`
        \t\t    type Query {
        \t\t      me: User
        \t\t    }
    `);
        (0, chai_1.expect)(output).to.equal(['type Query {', '  me: User', '}'].join('\n'));
    });
    (0, mocha_1.it)('removes leading and trailing newlines', () => {
        const output = (0, dedent_1.dedentString)(`


      type Query {
        me: User
      }


    `);
        (0, chai_1.expect)(output).to.equal(['type Query {', '  me: User', '}'].join('\n'));
    });
    (0, mocha_1.it)('removes all trailing spaces and tabs', () => {
        const output = (0, dedent_1.dedentString)(`
      type Query {
        me: User
      }
          \t\t  \t `);
        (0, chai_1.expect)(output).to.equal(['type Query {', '  me: User', '}'].join('\n'));
    });
    (0, mocha_1.it)('works on text without leading newline', () => {
        const output = (0, dedent_1.dedentString)(`      type Query {
        me: User
      }
    `);
        (0, chai_1.expect)(output).to.equal(['type Query {', '  me: User', '}'].join('\n'));
    });
});
(0, mocha_1.describe)('dedent', () => {
    (0, mocha_1.it)('removes indentation in typical usage', () => {
        const output = (0, dedent_1.dedent) `
      type Query {
        me: User
      }
    `;
        (0, chai_1.expect)(output).to.equal(['type Query {', '  me: User', '}'].join('\n'));
    });
    (0, mocha_1.it)('supports expression interpolation', () => {
        const name = 'John';
        const surname = 'Doe';
        const output = (0, dedent_1.dedent) `
      {
        "me": {
          "name": "${name}",
          "surname": "${surname}"
        }
      }
    `;
        (0, chai_1.expect)(output).to.equal([
            '{',
            '  "me": {',
            '    "name": "John",',
            '    "surname": "Doe"',
            '  }',
            '}',
        ].join('\n'));
    });
});
//# sourceMappingURL=dedent-test.js.map