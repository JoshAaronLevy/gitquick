const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');

module.exports = async (commitMessage) => {
	const spinner = ora(`Nice code! Adding file(s)...`).start()
	const p = await execa('git', ['add', '-A'], {cwd: directory});
	if (p.exitCode !== 0) {
		return spinner.fail(p.all)
	} else {
		spinner.succeed(`Files successfully staged! Committing...`)
		await gitCommitStep(commitMessage)
		// await gitPushStep(commitMessage)
		return p
	}
};

const gitCommitStep = async (commitMessage) => {
	const spinner = ora(`Good message! Committing "${commitMessage}"...`).start()
	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
	if (p.exitCode !== 0) {
		return spinner.fail(p.all)
	} else {
		spinner.succeed(`"${commitMessage}" successfully committed! Pushing...`)
		await gitPushStep(commitMessage)
		return p
	}
};

const gitPushStep = async (commitMessage) => {
	const spinner = ora(`Pushing to GitHub. Prepare for takeoff...`).start()
	const p = await execa('git', ['push'], {cwd: directory})
	if (p.exitCode !== 0) {
		return spinner.fail(p.all)
	} else {
		spinner.succeed(`"${commitMessage}" successfully pushed to GitHub!`);
		return p
	}
};