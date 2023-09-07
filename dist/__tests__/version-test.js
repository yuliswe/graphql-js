"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const version_1 = require("../version");
(0, mocha_1.describe)('Version', () => {
    (0, mocha_1.it)('versionInfo', () => {
        (0, chai_1.expect)(version_1.versionInfo).to.be.an('object');
        (0, chai_1.expect)(version_1.versionInfo).to.have.all.keys('major', 'minor', 'patch', 'preReleaseTag');
        const { major, minor, patch, preReleaseTag } = version_1.versionInfo;
        (0, chai_1.expect)(major).to.be.a('number').at.least(0);
        (0, chai_1.expect)(minor).to.be.a('number').at.least(0);
        (0, chai_1.expect)(patch).to.be.a('number').at.least(0);
        // Can't be verified on all versions
        /* c8 ignore start */
        switch (preReleaseTag === null || preReleaseTag === void 0 ? void 0 : preReleaseTag.split('.').length) {
            case undefined:
                break;
            case 2:
                (0, chai_1.expect)(preReleaseTag).to.match(/^(alpha|beta|rc|experimental-[\w-]+)\.\d+/);
                break;
            case 4:
                (0, chai_1.expect)(preReleaseTag).to.match(/^(alpha|beta|rc)\.\d+.experimental-[\w-]+\.\d+/);
                break;
            default:
                chai_1.expect.fail('Invalid pre-release tag: ' + preReleaseTag);
        }
        /* c8 ignore stop */
    });
    (0, mocha_1.it)('version', () => {
        (0, chai_1.expect)(version_1.version).to.be.a('string');
        const { major, minor, patch, preReleaseTag } = version_1.versionInfo;
        (0, chai_1.expect)(version_1.version).to.equal(
        // Can't be verified on all versions
        /* c8 ignore next 3 */
        preReleaseTag === null
            ? `${major}.${minor}.${patch}`
            : `${major}.${minor}.${patch}-${preReleaseTag}`);
    });
});
//# sourceMappingURL=version-test.js.map