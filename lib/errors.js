/**
 * Custom error classes for gitquick
 */

/**
 * Base error class for gitquick errors
 */
export class GitQuickError extends Error {
	constructor(message, suggestion = '') {
		super(message);
		this.name = 'GitQuickError';
		this.suggestion = suggestion;
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends GitQuickError {
	constructor(message, suggestion = '') {
		super(message, suggestion);
		this.name = 'ValidationError';
	}
}

/**
 * Error thrown when git repository is not found or not initialized
 */
export class GitRepositoryError extends GitQuickError {
	constructor(message = 'Not a git repository', suggestion = 'Run "git init" to initialize a repository or navigate to an existing repository.') {
		super(message, suggestion);
		this.name = 'GitRepositoryError';
	}
}

/**
 * Error thrown when git is not installed or not found
 */
export class GitNotFoundError extends GitQuickError {
	constructor(message = 'Git is not installed or not found in PATH', suggestion = 'Install git from https://git-scm.com/downloads') {
		super(message, suggestion);
		this.name = 'GitNotFoundError';
	}
}

/**
 * Error thrown when git command execution fails
 */
export class GitCommandError extends GitQuickError {
	constructor(message, suggestion = '', originalError = null) {
		super(message, suggestion);
		this.name = 'GitCommandError';
		this.originalError = originalError;
	}
}
