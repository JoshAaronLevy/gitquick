const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');
const chalk = require('chalk');

module.exports = async (message, commit) => {
	await gitAddStep(message, commit);
};

const gitAddStep = function(message, commit) {
	const spinner = ora(`Adding file(s)...`).start();
	const p = execa('git', ['add', '-A'], {cwd: directory})
		.then(() => {
			spinner.succeed(`Files successfully staged!`);
			if (commit === true){
				gitCommitOnly(message);
			} else {
				gitCommitStep(message, commit);
			}
		}).catch((p) => {
			spinner.fail(`Could not stage files. See error details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitCommitOnly = function(message) {
	const spinner = ora(`Committing your awesome code...`).start();
	let p = execa('git', ['commit', '-m', `"${message}"`], {cwd: directory})
		.then(() => {
      spinner.succeed(`"${message}" successfully committed!`);
		}).catch((p) => {
			spinner.fail(chalk.red.bold(`Error:`) + ` Could not commit changes. See details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitCommitStep = function(message) {
	const spinner = ora(`Committing your awesome code...`).start();
	let p = execa('git', ['commit', '-m', `"${message}"`], {cwd: directory})
		.then(() => {
      spinner.succeed(`"${message}" successfully committed!`);
			gitPushStep(message);
		}).catch((p) => {
			spinner.fail(chalk.red.bold(`Error:`) + ` Could not commit changes. See details below:\n`);
			console.log(p);
		});
		return p
};

const gitPushStep = function(message) {
	const spinner = ora(`Pushing "${message}" to GitHub...`).start();
	const p = execa('git', ['push'], {cwd: directory})
		.then((p) => {
			let gitHubUrl = p.all;
			gitHubUrl = gitHubUrl.match(/\bhttps?:\/\/\S+/gi);
			gitHubUrl = gitHubUrl.toString();
			gitHubUrl = gitHubUrl.substring(0, gitHubUrl.length - 4);
			spinner.succeed(`Successfully pushed "${message}" to:\n` +
      chalk.green(`  ${gitHubUrl}`));
		}).catch((p) => {
			if (p.exitCode === 128) {
				spinner.warn(chalk.yellow.bold(`Warning:`) + ` Current branch does not exist in GitHub yet.`);
				gitFindBranch(message);
			} else {
				spinner.fail(chalk.red.bold(`Error:`) + ` Could not push to GitHub. See details below:\n` + 
				`${p.all}`);
			}
		});
		return p
};

const gitFindBranch = function(message) {
	const p = execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {cwd: directory})
    .then((p) => {
      currentBranch = p.stdout;
      gitPushUpstream(currentBranch);
    }).catch((p) => {
      return p.all;
    });
    return p
};

const gitPushUpstream = function(currentBranch) {
	const spinner = ora(`Attempting to set ${currentBranch} as upstream and push...`).start();
	const p = execa('git', ['push', '-u', 'origin', `${currentBranch}`], {cwd: directory})
		.then((p) => {
			let gitHubUrl = p.all;
			gitHubUrl = gitHubUrl.match(/\bhttps?:\/\/\S+/gi);
			gitHubUrl = gitHubUrl.toString();
			gitHubUrl = gitHubUrl.substring(0, gitHubUrl.length - 4);
			gitHubUrl = gitHubUrl.split(',');
			gitHubUrl = gitHubUrl[1].toString()
			spinner.succeed(`Successfully set upstream and pushed to:\n` +
			chalk.green(`  ${gitHubUrl}`));
		}).catch((p) => {
			spinner.fail(chalk.red.bold(`Error:`) + ` Could not push to GitHub via --set-upstream. See details below:\n` + 
			`${p}`);
		});
		return p
};
