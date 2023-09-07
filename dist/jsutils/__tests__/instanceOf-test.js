"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const instanceOf_1 = require("../instanceOf");
(0, mocha_1.describe)('instanceOf', () => {
    (0, mocha_1.it)('do not throw on values without prototype', () => {
        class Foo {
            get [Symbol.toStringTag]() {
                return 'Foo';
            }
        }
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(true, Foo)).to.equal(false);
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(null, Foo)).to.equal(false);
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(Object.create(null), Foo)).to.equal(false);
    });
    (0, mocha_1.it)('detect name clashes with older versions of this lib', () => {
        function oldVersion() {
            class Foo {
            }
            return Foo;
        }
        function newVersion() {
            class Foo {
                get [Symbol.toStringTag]() {
                    return 'Foo';
                }
            }
            return Foo;
        }
        const NewClass = newVersion();
        const OldClass = oldVersion();
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(new NewClass(), NewClass)).to.equal(true);
        (0, chai_1.expect)(() => (0, instanceOf_1.instanceOf)(new OldClass(), NewClass)).to.throw();
    });
    (0, mocha_1.it)('allows instances to have share the same constructor name', () => {
        function getMinifiedClass(tag) {
            class SomeNameAfterMinification {
                get [Symbol.toStringTag]() {
                    return tag;
                }
            }
            return SomeNameAfterMinification;
        }
        const Foo = getMinifiedClass('Foo');
        const Bar = getMinifiedClass('Bar');
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(new Foo(), Bar)).to.equal(false);
        (0, chai_1.expect)((0, instanceOf_1.instanceOf)(new Bar(), Foo)).to.equal(false);
        const DuplicateOfFoo = getMinifiedClass('Foo');
        (0, chai_1.expect)(() => (0, instanceOf_1.instanceOf)(new DuplicateOfFoo(), Foo)).to.throw();
        (0, chai_1.expect)(() => (0, instanceOf_1.instanceOf)(new Foo(), DuplicateOfFoo)).to.throw();
    });
    (0, mocha_1.it)('fails with descriptive error message', () => {
        function getFoo() {
            class Foo {
                get [Symbol.toStringTag]() {
                    return 'Foo';
                }
            }
            return Foo;
        }
        const Foo1 = getFoo();
        const Foo2 = getFoo();
        (0, chai_1.expect)(() => (0, instanceOf_1.instanceOf)(new Foo1(), Foo2)).to.throw(/^Cannot use Foo "{}" from another module or realm./m);
        (0, chai_1.expect)(() => (0, instanceOf_1.instanceOf)(new Foo2(), Foo1)).to.throw(/^Cannot use Foo "{}" from another module or realm./m);
    });
});
//# sourceMappingURL=instanceOf-test.js.map