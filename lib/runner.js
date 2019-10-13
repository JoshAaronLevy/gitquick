const execa = require('execa');
const directory = process.cwd();

module.exports = async (commitMessage) => {
	const {stdout} = await execa('git', ['add', '-A'], {cwd: directory});
  await gitCommitStep(commitMessage);
  await gitPushStep();
	return {stdout}
};

const gitCommitStep = async (commitMessage) => {
	const {stdout} = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory});
	return {stdout}
};

const gitPushStep = async () => {
	const {stdout} = await execa('git', ['push'], {cwd: directory});
	return {stdout}
};
