const { Input } = require("enquirer");
const ora = require("ora");
const chalk = require("chalk");

const inputCommitMessage = () => {
	return commitMsg
		.run()
		.then((answer) => {
			let message = answer;
			if (!answer) return invalidCommitMsg();
			return message;
		})
		.catch((error) => {
			return commitError(error);
		});
};

const invalidCommitMsg = () => {
	const spinner = ora().start();
	return spinner.warn(chalk.yellow.bold("ALERT! ") + chalk.white("Invalid commit message. Commit step aborted"));
};

const commitError = (error) => {
	const spinner = ora().start();
	return spinner.fail(chalk.red.bold("ERROR! ") + chalk.white(`${error}`));
};

const commitMsg = new Input({
	name: "commitInput",
	message: "Enter commit message"
});

module.exports = { inputCommitMessage };