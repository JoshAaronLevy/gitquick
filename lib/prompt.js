const { Input } = require('enquirer');
const ora = require('ora');
const chalk = require('chalk');

const promptCommitMessage = () => {
	return commitMsg
		.run()
		.then(async (answer) => await inputCommitMessage(answer))
		.catch((error) => commitError(error));
};

const inputCommitMessage = async (commitMsg) => {
	if (!commitMsg) return invalidCommitMsg();
	return commitMsg;
};

const invalidCommitMsg = () => {
	const spinner = ora().start();
	return spinner.warn(chalk.yellow.bold('ALERT! ') + chalk.white('Invalid commit message. Commit step aborted'));
};

const commitError = (error) => {
	const spinner = ora().start();
	return spinner.fail(chalk.red.bold('ERROR! ') + chalk.white(`${error}`));
};

const commitMsg = new Input({
	name: 'commitInput',
	message: 'Enter commit message'
});

module.exports = { promptCommitMessage };