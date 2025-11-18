import Enquirer from 'enquirer';
import { createSpinner } from 'nanospinner';
import { red, yellow, white, bold, dim, cyan, green } from 'colorette';
import { validateCommitMessage, checkCommitMessageLength } from './validation.js';
import { ValidationError } from './errors.js';
import { VALIDATION } from './constants.js';

interface PromptResponse {
	commitMessage: string;
}

interface ConfirmResponse {
	proceed: boolean;
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
 * Prompt user to enter a new commit message or keep the original one
 * @param originalMessage - The original commit message that exceeded the limit
 * @returns New commit message, original message, or null if cancelled
 */
const promptLongCommitMessage = async (originalMessage: string): Promise<string | null> => {
	try {
		const enquirer = new Enquirer();
		
		// Display warning about long message
		const spinner = createSpinner().start();
		spinner.warn({
			text: yellow(bold('ALERT! ')) + 
				white(`Commit message exceeds ${VALIDATION.COMMIT_MESSAGE_MAX_LENGTH} characters (${originalMessage.split('\n')[0].length} chars).\n`) +
				dim(`Consider shortening your message or use a multi-line format.`)
		});
		
		const response = await enquirer.prompt({
			type: 'input',
			name: 'commitMessage',
			message: `Enter new message or press ${cyan('Enter')} to use original`,
			format: (value: string) => {
				// Truncate at 72 characters
				if (value.length > VALIDATION.COMMIT_MESSAGE_MAX_LENGTH) {
					return value.substring(0, VALIDATION.COMMIT_MESSAGE_MAX_LENGTH);
				}
				// Show character counter with extra space for block cursor visibility
				const remaining = VALIDATION.COMMIT_MESSAGE_MAX_LENGTH - value.length;
				const counter = remaining > 10 ? dim(`  (${remaining} chars left)`) : 
					remaining > 0 ? yellow(`  (${remaining} chars left)`) : 
					green('  (at limit)');
				return value + counter;
			},
			result: (value: string) => {
				// Remove any formatting artifacts and return clean value
				return value.trim();
			}
		}) as PromptResponse;
		
		// If user pressed Enter without typing anything, use original message
		if (!response.commitMessage || response.commitMessage.trim().length === 0) {
			return originalMessage;
		}
		
		// Validate the new message
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

/**
 * Prompt user to confirm proceeding with changes
 * @returns true if user confirms, false otherwise
 */
const promptConfirmation = async (): Promise<boolean> => {
	try {
		const enquirer = new Enquirer();
		const response = await enquirer.prompt({
			type: 'select',
			name: 'proceed',
			message: 'Do you want to proceed with these changes?',
			choices: ['Yes', 'No']
		}) as { proceed: string };
		
		return response.proceed === 'Yes';
	} catch (error: any) {
		// User cancelled (Ctrl+C) or error occurred
		return false;
	}
};

export { promptCommitMessage, promptLongCommitMessage, promptConfirmation };