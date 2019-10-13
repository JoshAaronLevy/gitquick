const execa = require('execa');
const chalk = require('chalk');
const directory = process.cwd();

module.exports = async (commitMessage) => {
	const {stdout} = await execa('git', ['status'], {cwd: directory});
  gitAddStep();
  gitCommitStep(commitMessage);
  gitPushStep();
	return {stdout}
};

const gitAddStep = async () => {
	const {stdout} = await execa('git', ['add', '-A'], {cwd: directory});
	return {stdout}
};

const gitCommitStep = async (commitMessage) => {
	const {stdout} = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory});
	return {stdout}
};

const gitPushStep = async () => {
	const {stdout} = await execa('git', ['push'], {cwd: directory});
  console.log(stdout);
	return {stdout}
};
