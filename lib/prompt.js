import Enquirer from 'enquirer';
import { createSpinner } from 'nanospinner';
import { red, yellow, white, bold, dim } from 'colorette';
import { validateCommitMessage } from './validation.js';
import { ValidationError } from './errors.js';

/**
 * Prompt user for commit message with validation
 * @returns {Promise<string|null>} Validated commit message or null if cancelled/invalid
 */
const promptCommitMessage = async () => {
	try {
		const enquirer = new Enquirer();
		const response = await enquirer.prompt({
			type: 'input',
			name: 'commitMessage',
			message: 'Enter commit message (max 72 chars)'
		});
		return await inputCommitMessage(response.commitMessage);
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
	const spinner = createSpinner().start();
	spinner.warn({
		text: yellow(bold('ALERT! ')) + 
			white(message) + 
			(suggestion ? `\n${dim(suggestion)}` : '')
	});
	return null;
};

/**
 * Display commit error
 * @param {Error} error - Error object
 * @returns {null}
 */
const commitError = (error) => {
	const spinner = createSpinner().start();
	spinner.error({ text: red(bold('ERROR! ')) + white(`${error.message || error}`) });
	return null;
};

export { promptCommitMessage };