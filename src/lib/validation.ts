/**
 * Validation utilities for gitquick
 */

import { VALIDATION, ERROR_MESSAGES } from './constants.js';
import { ValidationError } from './errors.js';

/**
 * Check if commit message exceeds maximum length without throwing
 * @param message - Commit message to check
 * @returns Object with isValid flag and trimmed message
 */
export const checkCommitMessageLength = (message: string): { isValid: boolean; message: string; firstLine: string } => {
	const trimmedMessage: string = message.trim();
	const firstLine: string = trimmedMessage.split('\n')[0];
	const isValid: boolean = firstLine.length <= VALIDATION.COMMIT_MESSAGE_MAX_LENGTH;
	
	return {
		isValid,
		message: trimmedMessage,
		firstLine
	};
};

/**
 * Validate commit message
 * @param message - Commit message to validate
 * @throws {ValidationError} If validation fails
 * @returns Trimmed and validated message
 */
export const validateCommitMessage = (message: string): string => {
	if (!message || typeof message !== 'string') {
		throw new ValidationError(
			ERROR_MESSAGES.EMPTY_COMMIT_MESSAGE,
			'Provide a commit message as an argument or use the interactive prompt.'
		);
	}

	const trimmedMessage: string = message.trim();

	if (trimmedMessage.length === 0) {
		throw new ValidationError(
			ERROR_MESSAGES.EMPTY_COMMIT_MESSAGE,
			'Provide a non-empty commit message.'
		);
	}

	if (trimmedMessage.length < VALIDATION.COMMIT_MESSAGE_MIN_LENGTH) {
		throw new ValidationError(
			ERROR_MESSAGES.EMPTY_COMMIT_MESSAGE,
			'Commit message must contain at least one character.'
		);
	}

	// Check first line length (split on newline for multi-line messages)
	const firstLine: string = trimmedMessage.split('\n')[0];
	if (firstLine.length > VALIDATION.COMMIT_MESSAGE_MAX_LENGTH) {
		throw new ValidationError(
			ERROR_MESSAGES.COMMIT_MESSAGE_TOO_LONG,
			`Consider shortening your message or use a multi-line format:\n  "Short summary\n\nLonger description"`
		);
	}

	return trimmedMessage;
};
