const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');

module.exports = async (commitMessage) => {
	const spinner = ora(`Nice code! Adding file(s)...`).start()
	const p = await execa('git', ['add', '-A'], {cwd: directory});
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		spinner.succeed(`Files successfully added!`);
		await gitCommitStep(commitMessage)
		await gitPushStep()
		return p
	}
};

const gitCommitStep = async (commitMessage) => {
	const spinner = ora(`Good message! Committing ${commitMessage}...`).start()
	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		spinner.succeed(`${commitMessage} successfully committed!`);
		return p
	}
};

const gitPushStep = async () => {
	const spinner = ora(`Pushing to GitHub. Prepare for takeoff...`).start()
	const p = await execa('git', ['push'], {cwd: directory})
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		spinner.succeed(`${commitMessage} successfully pushed to GitHub!`);
		return p
	}
};
