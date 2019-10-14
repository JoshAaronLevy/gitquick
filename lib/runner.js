const execa = require('execa');
const directory = process.cwd();

module.exports = async (commitMessage) => {
	const p = await execa('git', ['add', '-A'], {cwd: directory});
  await gitCommitStep(commitMessage);
  await gitPushStep();
	return p
};

const gitCommitStep = async (commitMessage) => {
	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory});
	console.log(p)
	return p
};

const gitPushStep = async () => {
	const p = await execa('git', ['push'], {cwd: directory});
	console.log(p.all)
	return p
};
