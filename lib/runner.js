const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');
const chalk = require('chalk');
let httpsUrl = ``;
let sshUrl = ``;
let gitHubUrl = ``;

module.exports = async (message, commit) => {
	try {
		const p = await execa('git', ['remote', '-v'], {
			cwd: directory,
			all: true,
		});
		if (p.all.match(/\bgit@github.com?:\S+/gi) != null) {
			sshUrl = p.all.match(/\bgit@github.com?:\S+/gi)[0];
			gitHubUrl = sshUrl.substring(0, sshUrl.length - 4);
		} else if (p.all.match(/\bhttps?:\/\/\S+/gi) != null) {
			httpsUrl = p.all.match(/\bhttps?:\/\/\S+/gi)[0];
			gitHubUrl = httpsUrl.substring(0, httpsUrl.length - 4);
		}
	} catch (error) {
		console.log(error);
	}
	await gitAddStep(message, commit);
};

const gitAddStep = function (message, commit) {
	const spinner = ora(`Adding file(s)...`).start();
	const p = execa('git', ['add', '-A'], { cwd: directory })
		.then(() => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) + chalk.white(`Code changes staged`)
			);
			if (commit === true) {
				gitCommitOnly(message);
			} else {
				gitCommitStep(message, commit);
			}
		}).catch((p) => {
			spinner.fail(
				chalk.red.bold(`ERROR! `) + chalk.white(`Could not stage changes. See details below:\n`)
			);
			console.log(p.all);
		});
	return p;
};

const gitCommitOnly = function (message) {
	const spinner = ora(`Committing your awesome code...`).start();
	let p = execa('git', ['commit', '-m', `"${message}"`], { cwd: directory })
		.then(() => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) +
				chalk.white(`Committed message: "${message}"`)
			);
		}).catch((p) => {
			spinner.fail(
				chalk.red.bold(`ERROR! `) + chalk.white(`Could not commit changes. See details below:\n`)
			);
			console.log(p.all);
		});
	return p;
};

const gitCommitStep = function (message) {
	const spinner = ora(`Committing your awesome code...`).start();
	let p = execa('git', ['commit', '-m', `"${message}"`], { cwd: directory })
		.then(() => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) +
				chalk.white(`Committed message: "${message}"`)
			);
			gitPushStep(message);
		}).catch((p) => {
			spinner.fail(
				chalk.red.bold(`ERROR! `) + chalk.white(`Could not commit changes. See details below:\n`)
			);
			console.log(p);
		});
	return p;
};

const gitPushStep = function (message) {
	const spinner = ora(`Pushing "${message}" to remote repository...`).start();
	const p = execa('git', ['push'], { cwd: directory })
		.then((p) => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) +
				chalk.white(
					`Commit "${message}" pushed to: \n` +
					chalk.white.bold(`  ${gitHubUrl}`)
				)
			);
		}).catch((p) => {
			if (p.exitCode === 128) {
				spinner.warn(
					chalk.yellow.bold(`ALERT! `) + chalk.white(`branch does not exist in remote repository yet.`));
				gitFindBranch(message);
			} else {
				spinner.fail(
					chalk.red.bold(`ERROR! `) + chalk.white(`Could not push to remote repository. See details below:\n`)
				);
				console.log(p.all);
			}
		});
	return p;
};

const gitFindBranch = function (message) {
	const p = execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: directory })
		.then((p) => {
			currentBranch = p.stdout;
			gitPushUpstream(currentBranch);
		}).catch((p) => {
			return p.all;
		});
	return p;
};

const gitPushUpstream = function (currentBranch) {
	const spinner = ora(`Attempting to set ${currentBranch} as upstream and push...`).start();
	const p = execa('git', ['push', '-u', 'origin', `${currentBranch}`], { cwd: directory })
		.then(() => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) +
				chalk.white(
					`Commit "${message}" pushed to: \n` +
					chalk.white.bold(`  ${gitHubUrl}`)
				)
			);
		}).catch((p) => {
			spinner.fail(
				chalk.red.bold(`ERROR! `) + chalk.white(`Could not push to remote repository. See details below:\n`)
			);
			console.log(p.all);
		});
	return p;
};
