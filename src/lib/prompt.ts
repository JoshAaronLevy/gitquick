import Enquirer from 'enquirer';
import { createSpinner } from 'nanospinner';
import { red, yellow, white, bold, dim } from 'colorette';
import { validateCommitMessage } from './validation.js';
import { ValidationError } from './errors.js';

interface PromptResponse {
	commitMessage: string;
}

/**
 * Prompt user for commit message with validation
 * @returns Validated commit message or null if cancelled/invalid
 */
const promptCommitMessage = async (): Promise<string | null> => {
	try {
		const enquirer = new Enquirer();
		const response = await enquirer.prompt({
			type: 'input',
			name: 'commitMessage',
			message: 'Enter commit message (max 72 chars)'
		}) as PromptResponse;
		return await inputCommitMessage(response.commitMessage);
	} catch (error: any) {
		return commitError(error);
	}
};

/**
 * Validate and return commit message
 * @param message - User input commit message
 * @returns Validated message or null if invalid
 */
const inputCommitMessage = async (message: string): Promise<string | null> => {
	try {
		// Validate the commit message
		const validatedMessage: string = validateCommitMessage(message);
		return validatedMessage;
	} catch (error: any) {
		if (error instanceof ValidationError) {
			return invalidCommitMsg(error.message, error.suggestion);
		}
		throw error;
	}
};

/**
 * Display invalid commit message warning
 * @param message - Error message
 * @param suggestion - Helpful suggestion
 * @returns null
 */
const invalidCommitMsg = (message: string, suggestion: string): null => {
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
 * @param error - Error object
 * @returns null
 */
const commitError = (error: any): null => {
	const spinner = createSpinner().start();
	spinner.error({ text: red(bold('ERROR! ')) + white(`${error.message || error}`) });
	return null;
};

export { promptCommitMessage };