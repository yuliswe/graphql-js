"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const mapValue_1 = require("../../jsutils/mapValue");
const parser_1 = require("../../language/parser");
const printer_1 = require("../../language/printer");
const separateOperations_1 = require("../separateOperations");
(0, mocha_1.describe)('separateOperations', () => {
    (0, mocha_1.it)('separates one AST into multiple, maintaining document order', () => {
        const ast = (0, parser_1.parse)(`
      {
        ...Y
        ...X
      }

      query One {
        foo
        bar
        ...A
        ...X
      }

      fragment A on T {
        field
        ...B
      }

      fragment X on T {
        fieldX
      }

      query Two {
        ...A
        ...Y
        baz
      }

      fragment Y on T {
        fieldY
      }

      fragment B on T {
        something
      }
    `);
        const separatedASTs = (0, mapValue_1.mapValue)((0, separateOperations_1.separateOperations)(ast), printer_1.print);
        (0, chai_1.expect)(separatedASTs).to.deep.equal({
            '': (0, dedent_1.dedent) `
        {
          ...Y
          ...X
        }

        fragment X on T {
          fieldX
        }

        fragment Y on T {
          fieldY
        }
      `,
            One: (0, dedent_1.dedent) `
        query One {
          foo
          bar
          ...A
          ...X
        }

        fragment A on T {
          field
          ...B
        }

        fragment X on T {
          fieldX
        }

        fragment B on T {
          something
        }
      `,
            Two: (0, dedent_1.dedent) `
        fragment A on T {
          field
          ...B
        }

        query Two {
          ...A
          ...Y
          baz
        }

        fragment Y on T {
          fieldY
        }

        fragment B on T {
          something
        }
      `,
        });
    });
    (0, mocha_1.it)('survives circular dependencies', () => {
        const ast = (0, parser_1.parse)(`
      query One {
        ...A
      }

      fragment A on T {
        ...B
      }

      fragment B on T {
        ...A
      }

      query Two {
        ...B
      }
    `);
        const separatedASTs = (0, mapValue_1.mapValue)((0, separateOperations_1.separateOperations)(ast), printer_1.print);
        (0, chai_1.expect)(separatedASTs).to.deep.equal({
            One: (0, dedent_1.dedent) `
        query One {
          ...A
        }

        fragment A on T {
          ...B
        }

        fragment B on T {
          ...A
        }
      `,
            Two: (0, dedent_1.dedent) `
        fragment A on T {
          ...B
        }

        fragment B on T {
          ...A
        }

        query Two {
          ...B
        }
      `,
        });
    });
    (0, mocha_1.it)('distinguish query and fragment names', () => {
        const ast = (0, parser_1.parse)(`
      {
        ...NameClash
      }

      fragment NameClash on T {
        oneField
      }

      query NameClash {
        ...ShouldBeSkippedInFirstQuery
      }

      fragment ShouldBeSkippedInFirstQuery on T {
        twoField
      }
    `);
        const separatedASTs = (0, mapValue_1.mapValue)((0, separateOperations_1.separateOperations)(ast), printer_1.print);
        (0, chai_1.expect)(separatedASTs).to.deep.equal({
            '': (0, dedent_1.dedent) `
        {
          ...NameClash
        }

        fragment NameClash on T {
          oneField
        }
      `,
            NameClash: (0, dedent_1.dedent) `
        query NameClash {
          ...ShouldBeSkippedInFirstQuery
        }

        fragment ShouldBeSkippedInFirstQuery on T {
          twoField
        }
      `,
        });
    });
    (0, mocha_1.it)('ignores type definitions', () => {
        const ast = (0, parser_1.parse)(`
      query Foo {
        ...Bar
      }

      fragment Bar on T {
        baz
      }

      scalar Foo
      type Bar
    `);
        const separatedASTs = (0, mapValue_1.mapValue)((0, separateOperations_1.separateOperations)(ast), printer_1.print);
        (0, chai_1.expect)(separatedASTs).to.deep.equal({
            Foo: (0, dedent_1.dedent) `
        query Foo {
          ...Bar
        }

        fragment Bar on T {
          baz
        }
      `,
        });
    });
    (0, mocha_1.it)('handles unknown fragments', () => {
        const ast = (0, parser_1.parse)(`
      {
        ...Unknown
        ...Known
      }

      fragment Known on T {
        someField
      }
    `);
        const separatedASTs = (0, mapValue_1.mapValue)((0, separateOperations_1.separateOperations)(ast), printer_1.print);
        (0, chai_1.expect)(separatedASTs).to.deep.equal({
            '': (0, dedent_1.dedent) `
        {
          ...Unknown
          ...Known
        }

        fragment Known on T {
          someField
        }
      `,
        });
    });
});
//# sourceMappingURL=separateOperations-test.js.map