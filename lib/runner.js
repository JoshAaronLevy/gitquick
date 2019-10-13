const execa = require('execa');
const chalk = require('chalk');
const directory = process.cwd();
const nextCommand = '&&';

module.exports = async (commitMessage) => {
	const {stdout} = await execa('git', ['status'], {cwd: directory});
  console.log(stdout);
  gitAddStep();
  gitCommitStep(commitMessage);
  gitPushStep();
  console.log(stdout);
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
	const {stdout} = await execa('git', ['push', '-y'], {cwd: directory});
	return {stdout}
};
