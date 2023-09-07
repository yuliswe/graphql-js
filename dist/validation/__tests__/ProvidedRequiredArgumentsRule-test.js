"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const buildASTSchema_1 = require("../../utilities/buildASTSchema");
const ProvidedRequiredArgumentsRule_1 = require("../rules/ProvidedRequiredArgumentsRule");
const harness_1 = require("./harness");
function expectErrors(queryStr) {
    return (0, harness_1.expectValidationErrors)(ProvidedRequiredArgumentsRule_1.ProvidedRequiredArgumentsRule, queryStr);
}
function expectValid(queryStr) {
    expectErrors(queryStr).toDeepEqual([]);
}
function expectSDLErrors(sdlStr, schema) {
    return (0, harness_1.expectSDLValidationErrors)(schema, ProvidedRequiredArgumentsRule_1.ProvidedRequiredArgumentsOnDirectivesRule, sdlStr);
}
function expectValidSDL(sdlStr) {
    expectSDLErrors(sdlStr).toDeepEqual([]);
}
(0, mocha_1.describe)('Validate: Provided required arguments', () => {
    (0, mocha_1.it)('ignores unknown arguments', () => {
        expectValid(`
      {
        dog {
          isHouseTrained(unknownArgument: true)
        }
      }
    `);
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
        (0, mocha_1.it)('No arg on non-null field with default', () => {
            expectValid(`
        {
          complicatedArgs {
            nonNullFieldWithDefault
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
        (0, mocha_1.it)('Missing one non-nullable argument', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs(req2: 2)
          }
        }
      `).toDeepEqual([
                {
                    message: 'Field "multipleReqs" argument "req1" of type "Int!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 13 }],
                },
            ]);
        });
        (0, mocha_1.it)('Missing multiple non-nullable arguments', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs
          }
        }
      `).toDeepEqual([
                {
                    message: 'Field "multipleReqs" argument "req1" of type "Int!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 13 }],
                },
                {
                    message: 'Field "multipleReqs" argument "req2" of type "Int!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 13 }],
                },
            ]);
        });
        (0, mocha_1.it)('Incorrect value and missing argument', () => {
            expectErrors(`
        {
          complicatedArgs {
            multipleReqs(req1: "one")
          }
        }
      `).toDeepEqual([
                {
                    message: 'Field "multipleReqs" argument "req2" of type "Int!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 13 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('Directive arguments', () => {
        (0, mocha_1.it)('ignores unknown directives', () => {
            expectValid(`
        {
          dog @unknown
        }
      `);
        });
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
        (0, mocha_1.it)('with directive with missing types', () => {
            expectErrors(`
        {
          dog @include {
            name @skip
          }
        }
      `).toDeepEqual([
                {
                    message: 'Directive "@include" argument "if" of type "Boolean!" is required, but it was not provided.',
                    locations: [{ line: 3, column: 15 }],
                },
                {
                    message: 'Directive "@skip" argument "if" of type "Boolean!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 18 }],
                },
            ]);
        });
    });
    (0, mocha_1.describe)('within SDL', () => {
        (0, mocha_1.it)('Missing optional args on directive defined inside SDL', () => {
            expectValidSDL(`
        type Query {
          foo: String @test
        }

        directive @test(arg1: String, arg2: String! = "") on FIELD_DEFINITION
      `);
        });
        (0, mocha_1.it)('Missing arg on directive defined inside SDL', () => {
            expectSDLErrors(`
        type Query {
          foo: String @test
        }

        directive @test(arg: String!) on FIELD_DEFINITION
      `).toDeepEqual([
                {
                    message: 'Directive "@test" argument "arg" of type "String!" is required, but it was not provided.',
                    locations: [{ line: 3, column: 23 }],
                },
            ]);
        });
        (0, mocha_1.it)('Missing arg on standard directive', () => {
            expectSDLErrors(`
        type Query {
          foo: String @include
        }
      `).toDeepEqual([
                {
                    message: 'Directive "@include" argument "if" of type "Boolean!" is required, but it was not provided.',
                    locations: [{ line: 3, column: 23 }],
                },
            ]);
        });
        (0, mocha_1.it)('Missing arg on overridden standard directive', () => {
            expectSDLErrors(`
        type Query {
          foo: String @deprecated
        }
        directive @deprecated(reason: String!) on FIELD
      `).toDeepEqual([
                {
                    message: 'Directive "@deprecated" argument "reason" of type "String!" is required, but it was not provided.',
                    locations: [{ line: 3, column: 23 }],
                },
            ]);
        });
        (0, mocha_1.it)('Missing arg on directive defined in schema extension', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        type Query {
          foo: String
        }
      `);
            expectSDLErrors(`
          directive @test(arg: String!) on OBJECT

          extend type Query  @test
        `, schema).toDeepEqual([
                {
                    message: 'Directive "@test" argument "arg" of type "String!" is required, but it was not provided.',
                    locations: [{ line: 4, column: 30 }],
                },
            ]);
        });
        (0, mocha_1.it)('Missing arg on directive used in schema extension', () => {
            const schema = (0, buildASTSchema_1.buildSchema)(`
        directive @test(arg: String!) on OBJECT

        type Query {
          foo: String
        }
      `);
            expectSDLErrors(`
          extend type Query @test
        `, schema).toDeepEqual([
                {
                    message: 'Directive "@test" argument "arg" of type "String!" is required, but it was not provided.',
                    locations: [{ line: 2, column: 29 }],
                },
            ]);
        });
    });
});
//# sourceMappingURL=ProvidedRequiredArgumentsRule-test.js.map