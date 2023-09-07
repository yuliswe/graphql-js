"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVisitFn = exports.getEnterLeaveForKind = exports.visitInParallel = exports.visit = exports.BREAK = void 0;
const devAssert_1 = require("../jsutils/devAssert");
const inspect_1 = require("../jsutils/inspect");
const ast_1 = require("./ast");
const kinds_1 = require("./kinds");
exports.BREAK = Object.freeze({});
function visit(root, visitor, visitorKeys = ast_1.QueryDocumentKeys) {
    var _a, _b, _c;
    const enterLeaveMap = new Map();
    for (const kind of Object.values(kinds_1.Kind)) {
        enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
    }
    /* eslint-disable no-undef-init */
    let stack = undefined;
    let inArray = Array.isArray(root);
    let keys = [root];
    let index = -1;
    let edits = [];
    let node = root;
    let key = undefined;
    let parent = undefined;
    const path = [];
    const ancestors = [];
    /* eslint-enable no-undef-init */
    do {
        index++;
        const isLeaving = index === keys.length;
        const isEdited = isLeaving && edits.length !== 0;
        if (isLeaving) {
            key = ancestors.length === 0 ? undefined : path[path.length - 1];
            node = parent;
            parent = ancestors.pop();
            if (isEdited) {
                if (inArray) {
                    node = node.slice();
                    let editOffset = 0;
                    for (const [editKey, editValue] of edits) {
                        const arrayKey = editKey - editOffset;
                        if (editValue === null) {
                            node.splice(arrayKey, 1);
                            editOffset++;
                        }
                        else {
                            node[arrayKey] = editValue;
                        }
                    }
                }
                else {
                    node = Object.defineProperties({}, Object.getOwnPropertyDescriptors(node));
                    for (const [editKey, editValue] of edits) {
                        node[editKey] = editValue;
                    }
                }
            }
            index = stack.index;
            keys = stack.keys;
            edits = stack.edits;
            inArray = stack.inArray;
            stack = stack.prev;
        }
        else if (parent) {
            key = inArray ? index : keys[index];
            node = parent[key];
            if (node === null || node === undefined) {
                continue;
            }
            path.push(key);
        }
        let result;
        if (!Array.isArray(node)) {
            (0, devAssert_1.devAssert)((0, ast_1.isNode)(node), `Invalid AST Node: ${(0, inspect_1.inspect)(node)}.`);
            const visitFn = isLeaving
                ? (_a = enterLeaveMap.get(node.kind)) === null || _a === void 0 ? void 0 : _a.leave
                : (_b = enterLeaveMap.get(node.kind)) === null || _b === void 0 ? void 0 : _b.enter;
            result = visitFn === null || visitFn === void 0 ? void 0 : visitFn.call(visitor, node, key, parent, path, ancestors);
            if (result === exports.BREAK) {
                break;
            }
            if (result === false) {
                if (!isLeaving) {
                    path.pop();
                    continue;
                }
            }
            else if (result !== undefined) {
                edits.push([key, result]);
                if (!isLeaving) {
                    if ((0, ast_1.isNode)(result)) {
                        node = result;
                    }
                    else {
                        path.pop();
                        continue;
                    }
                }
            }
        }
        if (result === undefined && isEdited) {
            edits.push([key, node]);
        }
        if (isLeaving) {
            path.pop();
        }
        else {
            stack = { inArray, index, keys, edits, prev: stack };
            inArray = Array.isArray(node);
            keys = inArray ? node : (_c = visitorKeys[node.kind]) !== null && _c !== void 0 ? _c : [];
            index = -1;
            edits = [];
            if (parent) {
                ancestors.push(parent);
            }
            parent = node;
        }
    } while (stack !== undefined);
    if (edits.length !== 0) {
        // New root
        return edits[edits.length - 1][1];
    }
    return root;
}
exports.visit = visit;
/**
 * Creates a new visitor instance which delegates to many visitors to run in
 * parallel. Each visitor will be visited for each node before moving on.
 *
 * If a prior visitor edits a node, no following visitors will see that node.
 */
function visitInParallel(visitors) {
    const skipping = new Array(visitors.length).fill(null);
    const mergedVisitor = Object.create(null);
    for (const kind of Object.values(kinds_1.Kind)) {
        let hasVisitor = false;
        const enterList = new Array(visitors.length).fill(undefined);
        const leaveList = new Array(visitors.length).fill(undefined);
        for (let i = 0; i < visitors.length; ++i) {
            const { enter, leave } = getEnterLeaveForKind(visitors[i], kind);
            hasVisitor || (hasVisitor = enter != null || leave != null);
            enterList[i] = enter;
            leaveList[i] = leave;
        }
        if (!hasVisitor) {
            continue;
        }
        const mergedEnterLeave = {
            enter(...args) {
                var _a;
                const node = args[0];
                for (let i = 0; i < visitors.length; i++) {
                    if (skipping[i] === null) {
                        const result = (_a = enterList[i]) === null || _a === void 0 ? void 0 : _a.apply(visitors[i], args);
                        if (result === false) {
                            skipping[i] = node;
                        }
                        else if (result === exports.BREAK) {
                            skipping[i] = exports.BREAK;
                        }
                        else if (result !== undefined) {
                            return result;
                        }
                    }
                }
            },
            leave(...args) {
                var _a;
                const node = args[0];
                for (let i = 0; i < visitors.length; i++) {
                    if (skipping[i] === null) {
                        const result = (_a = leaveList[i]) === null || _a === void 0 ? void 0 : _a.apply(visitors[i], args);
                        if (result === exports.BREAK) {
                            skipping[i] = exports.BREAK;
                        }
                        else if (result !== undefined && result !== false) {
                            return result;
                        }
                    }
                    else if (skipping[i] === node) {
                        skipping[i] = null;
                    }
                }
            },
        };
        mergedVisitor[kind] = mergedEnterLeave;
    }
    return mergedVisitor;
}
exports.visitInParallel = visitInParallel;
/**
 * Given a visitor instance and a node kind, return EnterLeaveVisitor for that kind.
 */
function getEnterLeaveForKind(visitor, kind) {
    const kindVisitor = visitor[kind];
    if (typeof kindVisitor === 'object') {
        // { Kind: { enter() {}, leave() {} } }
        return kindVisitor;
    }
    else if (typeof kindVisitor === 'function') {
        // { Kind() {} }
        return { enter: kindVisitor, leave: undefined };
    }
    // { enter() {}, leave() {} }
    return { enter: visitor.enter, leave: visitor.leave };
}
exports.getEnterLeaveForKind = getEnterLeaveForKind;
/**
 * Given a visitor instance, if it is leaving or not, and a node kind, return
 * the function the visitor runtime should call.
 *
 * @deprecated Please use `getEnterLeaveForKind` instead. Will be removed in v17
 */
/* c8 ignore next 8 */
function getVisitFn(visitor, kind, isLeaving) {
    const { enter, leave } = getEnterLeaveForKind(visitor, kind);
    return isLeaving ? leave : enter;
}
exports.getVisitFn = getVisitFn;
//# sourceMappingURL=visitor.js.map