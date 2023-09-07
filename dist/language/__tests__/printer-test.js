"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const dedent_1 = require("../../__testUtils__/dedent");
const kitchenSinkQuery_1 = require("../../__testUtils__/kitchenSinkQuery");
const kinds_1 = require("../kinds");
const parser_1 = require("../parser");
const printer_1 = require("../printer");
(0, mocha_1.describe)('Printer: Query document', () => {
    (0, mocha_1.it)('prints minimal ast', () => {
        const ast = {
            kind: kinds_1.Kind.FIELD,
            name: { kind: kinds_1.Kind.NAME, value: 'foo' },
        };
        (0, chai_1.expect)((0, printer_1.print)(ast)).to.equal('foo');
    });
    (0, mocha_1.it)('produces helpful error messages', () => {
        const badAST = { random: 'Data' };
        // @ts-expect-error
        (0, chai_1.expect)(() => (0, printer_1.print)(badAST)).to.throw('Invalid AST Node: { random: "Data" }.');
    });
    (0, mocha_1.it)('correctly prints non-query operations without name', () => {
        const queryASTShorthanded = (0, parser_1.parse)('query { id, name }');
        (0, chai_1.expect)((0, printer_1.print)(queryASTShorthanded)).to.equal((0, dedent_1.dedent) `
      {
        id
        name
      }
    `);
        const mutationAST = (0, parser_1.parse)('mutation { id, name }');
        (0, chai_1.expect)((0, printer_1.print)(mutationAST)).to.equal((0, dedent_1.dedent) `
      mutation {
        id
        name
      }
    `);
        const queryASTWithArtifacts = (0, parser_1.parse)('query ($foo: TestType) @testDirective { id, name }');
        (0, chai_1.expect)((0, printer_1.print)(queryASTWithArtifacts)).to.equal((0, dedent_1.dedent) `
      query ($foo: TestType) @testDirective {
        id
        name
      }
    `);
        const mutationASTWithArtifacts = (0, parser_1.parse)('mutation ($foo: TestType) @testDirective { id, name }');
        (0, chai_1.expect)((0, printer_1.print)(mutationASTWithArtifacts)).to.equal((0, dedent_1.dedent) `
      mutation ($foo: TestType) @testDirective {
        id
        name
      }
    `);
    });
    (0, mocha_1.it)('prints query with variable directives', () => {
        const queryASTWithVariableDirective = (0, parser_1.parse)('query ($foo: TestType = {a: 123} @testDirective(if: true) @test) { id }');
        (0, chai_1.expect)((0, printer_1.print)(queryASTWithVariableDirective)).to.equal((0, dedent_1.dedent) `
      query ($foo: TestType = {a: 123} @testDirective(if: true) @test) {
        id
      }
    `);
    });
    (0, mocha_1.it)('keeps arguments on one line if line is short (<= 80 chars)', () => {
        const printed = (0, printer_1.print)((0, parser_1.parse)('{trip(wheelchair:false arriveBy:false){dateTime}}'));
        (0, chai_1.expect)(printed).to.equal((0, dedent_1.dedent) `
      {
        trip(wheelchair: false, arriveBy: false) {
          dateTime
        }
      }
    `);
    });
    (0, mocha_1.it)('puts arguments on multiple lines if line is long (> 80 chars)', () => {
        const printed = (0, printer_1.print)((0, parser_1.parse)('{trip(wheelchair:false arriveBy:false includePlannedCancellations:true transitDistanceReluctance:2000){dateTime}}'));
        (0, chai_1.expect)(printed).to.equal((0, dedent_1.dedent) `
      {
        trip(
          wheelchair: false
          arriveBy: false
          includePlannedCancellations: true
          transitDistanceReluctance: 2000
        ) {
          dateTime
        }
      }
    `);
    });
    (0, mocha_1.it)('Legacy: prints fragment with variable directives', () => {
        const queryASTWithVariableDirective = (0, parser_1.parse)('fragment Foo($foo: TestType @test) on TestType @testDirective { id }', { allowLegacyFragmentVariables: true });
        (0, chai_1.expect)((0, printer_1.print)(queryASTWithVariableDirective)).to.equal((0, dedent_1.dedent) `
      fragment Foo($foo: TestType @test) on TestType @testDirective {
        id
      }
    `);
    });
    (0, mocha_1.it)('Legacy: correctly prints fragment defined variables', () => {
        const fragmentWithVariable = (0, parser_1.parse)(`
        fragment Foo($a: ComplexType, $b: Boolean = false) on TestType {
          id
        }
      `, { allowLegacyFragmentVariables: true });
        (0, chai_1.expect)((0, printer_1.print)(fragmentWithVariable)).to.equal((0, dedent_1.dedent) `
      fragment Foo($a: ComplexType, $b: Boolean = false) on TestType {
        id
      }
    `);
    });
    (0, mocha_1.it)('prints kitchen sink without altering ast', () => {
        const ast = (0, parser_1.parse)(kitchenSinkQuery_1.kitchenSinkQuery, { noLocation: true });
        const astBeforePrintCall = JSON.stringify(ast);
        const printed = (0, printer_1.print)(ast);
        const printedAST = (0, parser_1.parse)(printed, { noLocation: true });
        (0, chai_1.expect)(printedAST).to.deep.equal(ast);
        (0, chai_1.expect)(JSON.stringify(ast)).to.equal(astBeforePrintCall);
        (0, chai_1.expect)(printed).to.equal((0, dedent_1.dedentString)(String.raw `
      query queryName($foo: ComplexType, $site: Site = MOBILE) @onQuery {
        whoever123is: node(id: [123, 456]) {
          id
          ... on User @onInlineFragment {
            field2 {
              id
              alias: field1(first: 10, after: $foo) @include(if: $foo) {
                id
                ...frag @onFragmentSpread
              }
            }
          }
          ... @skip(unless: $foo) {
            id
          }
          ... {
            id
          }
        }
      }

      mutation likeStory @onMutation {
        like(story: 123) @onField {
          story {
            id @onField
          }
        }
      }

      subscription StoryLikeSubscription($input: StoryLikeSubscribeInput @onVariableDefinition) @onSubscription {
        storyLikeSubscribe(input: $input) {
          story {
            likers {
              count
            }
            likeSentence {
              text
            }
          }
        }
      }

      fragment frag on Friend @onFragmentDefinition {
        foo(
          size: $size
          bar: $b
          obj: {key: "value", block: """
          block string uses \"""
          """}
        )
      }

      {
        unnamed(truthy: true, falsy: false, nullish: null)
        query
      }

      {
        __typename
      }
    `));
    });
});
//# sourceMappingURL=printer-test.js.map