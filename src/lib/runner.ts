import execa from 'execa';
import ora from 'ora';
import chalk from 'chalk';

const directory = process.cwd();
let httpsUrl: string = '';
let sshUrl: string = '';
let gitHubUrl: any = '';
let pOptions: any = { cwd: directory, all: true };

export const runner = async (message: string, commit: boolean) => {
	try {
		const p = await execa('git', ['remote', '-v'], pOptions);
		gitHubUrl = await getRepoUrls(p);
	} catch (error) {
		return error;
	}
	await gitAddStep(message, commit);
};

const getRepoUrls = async (p) => {
	if (p.all.match(/\bgit@github.com?:\S+/gi) != null) {
		sshUrl = p.all.match(/\bgit@github.com?:\S+/gi)[0];
		return sshUrl.substring(0, sshUrl.length - 4);
	} else if (p.all.match(/\bgit@gitlab.com?:\S+/gi) != null) {
		sshUrl = p.all.match(/\bgit@gitlab.com?:\S+/gi)[0];
		return sshUrl.substring(0, sshUrl.length - 4);
	} else if (p.all.match(/\bhttps?:\/\/\S+/gi) != null) {
		httpsUrl = p.all.match(/\bhttps?:\/\/\S+/gi)[0];
		return httpsUrl.substring(0, httpsUrl.length - 4);
	} else if (p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi) != null) {
		sshUrl = p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];
		return sshUrl.substring(25, sshUrl.length);
	}
};

const gitAddStep = function (message: string, commit: boolean) {
	const spinner = ora(`Adding file(s)...`).start();
	const p = execa('git', ['add', '-A'], { cwd: directory })
		.then(() => {
			spinner.succeed(
				chalk.green.bold(`SUCCESS! `) + chalk.white(`Code changes staged`)
			);
			if (commit === true) {
				gitCommitOnly(message);
			} else {
				gitCommitStep(message);
			}
		}).catch((p) => {
			spinner.fail(
				chalk.red.bold(`ERROR! `) + chalk.white(`Could not stage changes. See details below:\n`)
			);
			console.log(p.all);
		});
	return p;
};

export const gitCommitOnly = function (message: string) {
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

export const gitCommitStep = function (message: string) {
	const spinner = ora(`Committing your awesome code...`).start();
	const commitMessage = `${message.replace(/"/g, `""`)}`;
	let p = execa('git', ['commit', '-m', commitMessage], { cwd: directory })
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

const gitPushStep = function (message: string) {
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

const gitFindBranch = function (message: string) {
	const p = execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: directory })
		.then((p) => {
			const currentBranch = p.stdout;
			gitPushUpstream(currentBranch, message);
		}).catch((p) => {
			return p.all;
		});
	return p;
};

const gitPushUpstream = function (currentBranch: string, message: string) {
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
