const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');

module.exports = async (message, commit) => {
	gitAddStep(message, commit);
};

const gitAddStep = function(message, commit) {
	const spinner = ora(`Adding file(s)...`).start();
	const p = execa('git', ['add', '-A'], {cwd: directory})
		.then(() => {
			spinner.succeed(`Files successfully staged!`);
			return gitCommitStep(message, commit);
		}).catch((p) => {
			spinner.fail(`Could not stage files. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitCommitStep = function(message, commit) {
	const spinner = ora(`Nice message! Committing your awesome code...`).start();
	let p = execa('git', ['commit', '-m', `"${message}"`], {cwd: directory})
		.then(() => {
			console.log(commit);
			spinner.succeed(`"${message}" successfully committed!`);
			return gitPushStep(message);
		}).catch((p) => {
			spinner.fail(`Could not commit changes. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};

const gitPushStep = function(message) {
	const spinner = ora(`Pushing "${message}" to GitHub...`).start();
	const p = execa('git', ['push'], {cwd: directory})
		.then(() => {
			return spinner.succeed(`Successfully pushed "${message}" to GitHub!`);
		}).catch(() => {
			spinner.fail(`Could not push to GitHub. Please check the error details below:\n`);
			console.log(p.all);
		});
		return p
};
