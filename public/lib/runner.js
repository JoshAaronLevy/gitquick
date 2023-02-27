"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gitCommitStep = exports.gitCommitOnly = exports.runner = void 0;
const execa_1 = __importDefault(require("execa"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const directory = process.cwd();
let httpsUrl = '';
let sshUrl = '';
let gitHubUrl = '';
let pOptions = { cwd: directory, all: true };
const runner = async (message, commit) => {
    try {
        const p = await (0, execa_1.default)('git', ['remote', '-v'], pOptions);
        gitHubUrl = await getRepoUrls(p);
    }
    catch (error) {
        return error;
    }
    await gitAddStep(message, commit);
};
exports.runner = runner;
const getRepoUrls = async (p) => {
    if (p.all.match(/\bgit@github.com?:\S+/gi) != null) {
        sshUrl = p.all.match(/\bgit@github.com?:\S+/gi)[0];
        return sshUrl.substring(0, sshUrl.length - 4);
    }
    else if (p.all.match(/\bgit@gitlab.com?:\S+/gi) != null) {
        sshUrl = p.all.match(/\bgit@gitlab.com?:\S+/gi)[0];
        return sshUrl.substring(0, sshUrl.length - 4);
    }
    else if (p.all.match(/\bhttps?:\/\/\S+/gi) != null) {
        httpsUrl = p.all.match(/\bhttps?:\/\/\S+/gi)[0];
        return httpsUrl.substring(0, httpsUrl.length - 4);
    }
    else if (p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi) != null) {
        sshUrl = p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];
        return sshUrl.substring(25, sshUrl.length);
    }
};
const gitAddStep = function (message, commit) {
    const spinner = (0, ora_1.default)(`Adding file(s)...`).start();
    const p = (0, execa_1.default)('git', ['add', '-A'], { cwd: directory })
        .then(() => {
        spinner.succeed(chalk_1.default.green.bold(`SUCCESS! `) + chalk_1.default.white(`Code changes staged`));
        if (commit === true) {
            (0, exports.gitCommitOnly)(message);
        }
        else {
            (0, exports.gitCommitStep)(message);
        }
    }).catch((p) => {
        spinner.fail(chalk_1.default.red.bold(`ERROR! `) + chalk_1.default.white(`Could not stage changes. See details below:\n`));
        console.log(p.all);
    });
    return p;
};
const gitCommitOnly = function (message) {
    const spinner = (0, ora_1.default)(`Committing your awesome code...`).start();
    let p = (0, execa_1.default)('git', ['commit', '-m', `"${message}"`], { cwd: directory })
        .then(() => {
        spinner.succeed(chalk_1.default.green.bold(`SUCCESS! `) +
            chalk_1.default.white(`Committed message: "${message}"`));
    }).catch((p) => {
        spinner.fail(chalk_1.default.red.bold(`ERROR! `) + chalk_1.default.white(`Could not commit changes. See details below:\n`));
        console.log(p.all);
    });
    return p;
};
exports.gitCommitOnly = gitCommitOnly;
const gitCommitStep = function (message) {
    const spinner = (0, ora_1.default)(`Committing your awesome code...`).start();
    const commitMessage = `${message.replace(/"/g, `""`)}`;
    let p = (0, execa_1.default)('git', ['commit', '-m', commitMessage], { cwd: directory })
        .then(() => {
        spinner.succeed(chalk_1.default.green.bold(`SUCCESS! `) +
            chalk_1.default.white(`Committed message: "${message}"`));
        gitPushStep(message);
    }).catch((p) => {
        spinner.fail(chalk_1.default.red.bold(`ERROR! `) + chalk_1.default.white(`Could not commit changes. See details below:\n`));
        console.log(p);
    });
    return p;
};
exports.gitCommitStep = gitCommitStep;
const gitPushStep = function (message) {
    const spinner = (0, ora_1.default)(`Pushing "${message}" to remote repository...`).start();
    const p = (0, execa_1.default)('git', ['push'], { cwd: directory })
        .then((p) => {
        spinner.succeed(chalk_1.default.green.bold(`SUCCESS! `) +
            chalk_1.default.white(`Commit "${message}" pushed to: \n` +
                chalk_1.default.white.bold(`  ${gitHubUrl}`)));
    }).catch((p) => {
        if (p.exitCode === 128) {
            spinner.warn(chalk_1.default.yellow.bold(`ALERT! `) + chalk_1.default.white(`branch does not exist in remote repository yet.`));
            gitFindBranch(message);
        }
        else {
            spinner.fail(chalk_1.default.red.bold(`ERROR! `) + chalk_1.default.white(`Could not push to remote repository. See details below:\n`));
            console.log(p.all);
        }
    });
    return p;
};
const gitFindBranch = function (message) {
    const p = (0, execa_1.default)('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: directory })
        .then((p) => {
        const currentBranch = p.stdout;
        gitPushUpstream(currentBranch, message);
    }).catch((p) => {
        return p.all;
    });
    return p;
};
const gitPushUpstream = function (currentBranch, message) {
    const spinner = (0, ora_1.default)(`Attempting to set ${currentBranch} as upstream and push...`).start();
    const p = (0, execa_1.default)('git', ['push', '-u', 'origin', `${currentBranch}`], { cwd: directory })
        .then(() => {
        spinner.succeed(chalk_1.default.green.bold(`SUCCESS! `) +
            chalk_1.default.white(`Commit "${message}" pushed to: \n` +
                chalk_1.default.white.bold(`  ${gitHubUrl}`)));
    }).catch((p) => {
        spinner.fail(chalk_1.default.red.bold(`ERROR! `) + chalk_1.default.white(`Could not push to remote repository. See details below:\n`));
        console.log(p.all);
    });
    return p;
};
