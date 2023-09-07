"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const identityFunc_1 = require("../../jsutils/identityFunc");
const parser_1 = require("../../language/parser");
const schema_1 = require("../../type/schema");
const TypeInfo_1 = require("../../utilities/TypeInfo");
const ValidationContext_1 = require("../ValidationContext");
(0, mocha_1.describe)('ValidationContext', () => {
    (0, mocha_1.it)('can be Object.toStringified', () => {
        const schema = new schema_1.GraphQLSchema({});
        const typeInfo = new TypeInfo_1.TypeInfo(schema);
        const ast = (0, parser_1.parse)('{ foo }');
        const onError = identityFunc_1.identityFunc;
        const astContext = new ValidationContext_1.ASTValidationContext(ast, onError);
        (0, chai_1.expect)(Object.prototype.toString.call(astContext)).to.equal('[object ASTValidationContext]');
        const sdlContext = new ValidationContext_1.SDLValidationContext(ast, schema, onError);
        (0, chai_1.expect)(Object.prototype.toString.call(sdlContext)).to.equal('[object SDLValidationContext]');
        const context = new ValidationContext_1.ValidationContext(schema, ast, typeInfo, onError);
        (0, chai_1.expect)(Object.prototype.toString.call(context)).to.equal('[object ValidationContext]');
    });
});
//# sourceMappingURL=ValidationContext-test.js.map