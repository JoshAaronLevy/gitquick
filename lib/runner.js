const execa = require('execa');
const directory = process.cwd();

module.exports = async (commitMessage) => {
	const p = await execa('git', ['add', '-A'], {cwd: directory});
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		await gitCommitStep(commitMessage)
		await gitPushStep()
		return p
	}
};

const gitCommitStep = async (commitMessage) => {
	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		return p
	}
};

const gitPushStep = async () => {
	const p = await execa('git', ['push'], {cwd: directory})
	if (p.exitCode !== 0) {
		console.error(p.all)
		return p
	} else {
		return p
	}
};
