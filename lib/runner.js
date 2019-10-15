const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');

module.exports = async (commitMessage) => {
	gitAddStep(commitMessage);
};

const gitAddStep = function(commitMessage) {
	const spinner = ora(`Nice code! Adding file(s)...`).start();
	const p = execa('git', ['add', '-A'], {cwd: directory})
		.then(() => {
			spinner.succeed(`Files successfully staged! Committing...`);
			return gitCommitStep(commitMessage);
		}).catch((p) => {
			spinner.fail(`Could not stage files. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitCommitStep = function(commitMessage) {
	const spinner = ora(`Good message! Committing "${commitMessage}"...`).start();
	let p = execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
		.then(() => {
			spinner.succeed(`"${commitMessage}" successfully committed! Pushing...`);
			return gitPushStep(commitMessage);
		}).catch((p) => {
			spinner.fail(`Could not commit changes. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitPushStep = function(commitMessage) {
	const spinner = ora(`Pushing "${commitMessage}" to GitHub...`).start();
	const p = execa('git', ['push'], {cwd: directory})
		.then(() => {
			return spinner.succeed(`"${commitMessage}" successfully pushed!`);
		}).catch(() => {
			spinner.fail(`Could not push to GitHub. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};
