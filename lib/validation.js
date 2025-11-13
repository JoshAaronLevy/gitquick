/**
 * Validation utilities for gitquick
 */

const { VALIDATION, ERROR_MESSAGES } = require('./constants');
const { ValidationError } = require('./errors');

/**
 * Validate commit message
 * @param {string} message - Commit message to validate
 * @throws {ValidationError} If validation fails
 * @returns {string} Trimmed and validated message
 */
const validateCommitMessage = (message) => {
	if (!message || typeof message !== 'string') {
		throw new ValidationError(
			ERROR_MESSAGES.EMPTY_COMMIT_MESSAGE,
			'Provide a commit message as an argument or use the interactive prompt.'
		);
	}

	const trimmedMessage = message.trim();

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
	const firstLine = trimmedMessage.split('\n')[0];
	if (firstLine.length > VALIDATION.COMMIT_MESSAGE_MAX_LENGTH) {
		throw new ValidationError(
			ERROR_MESSAGES.COMMIT_MESSAGE_TOO_LONG,
			`Consider shortening your message or use a multi-line format:\n  "Short summary\n\nLonger description"`
		);
	}

	return trimmedMessage;
};

module.exports = {
	validateCommitMessage
};
