const { Input } = require('enquirer');
const ora = require('ora');
const chalk = require('chalk');
const { validateCommitMessage } = require('./validation');
const { ValidationError } = require('./errors');

/**
 * Prompt user for commit message with validation
 * @returns {Promise<string|null>} Validated commit message or null if cancelled/invalid
 */
const promptCommitMessage = async () => {
	try {
		const answer = await commitMsg.run();
		return await inputCommitMessage(answer);
	} catch (error) {
		return commitError(error);
	}
};

/**
 * Validate and return commit message
 * @param {string} message - User input commit message
 * @returns {Promise<string|null>} Validated message or null if invalid
 */
const inputCommitMessage = async (message) => {
	try {
		// Validate the commit message
		const validatedMessage = validateCommitMessage(message);
		return validatedMessage;
	} catch (error) {
		if (error instanceof ValidationError) {
			return invalidCommitMsg(error.message, error.suggestion);
		}
		throw error;
	}
};

/**
 * Display invalid commit message warning
 * @param {string} message - Error message
 * @param {string} suggestion - Helpful suggestion
 * @returns {null}
 */
const invalidCommitMsg = (message, suggestion) => {
	const spinner = ora().start();
	spinner.warn(
		chalk.yellow.bold('ALERT! ') + 
		chalk.white(message) + 
		(suggestion ? `\n${chalk.dim(suggestion)}` : '')
	);
	return null;
};

/**
 * Display commit error
 * @param {Error} error - Error object
 * @returns {null}
 */
const commitError = (error) => {
	const spinner = ora().start();
	spinner.fail(chalk.red.bold('ERROR! ') + chalk.white(`${error.message || error}`));
	return null;
};

const commitMsg = new Input({
	name: 'commitInput',
	message: 'Enter commit message (max 72 chars)'
});

module.exports = { promptCommitMessage };