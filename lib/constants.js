/**
 * Constants used throughout the gitquick application
 */

// Git-related constants
const GIT_EXIT_CODES = {
	UPSTREAM_NOT_SET: 128
};

const GIT_STATUS_PATTERNS = {
	TAB_CHARACTER: '\t',
	MODIFIED_PREFIX: 'modified:',
	ORIGIN_REMOTE: 'origin'
};

const GIT_REMOTE_TYPES = {
	HTTPS: 'https',
	GITHUB: 'github',
	GITLAB: 'gitlab'
};

// URL parsing indices (for string manipulation fallback)
const URL_PARSE_INDICES = {
	HTTPS_START: 6,
	SSH_START: 22,
	TRIM_END: 12
};

// File change messages
const CHANGE_MESSAGES = {
	SINGLE_FILE: 'file',
	MULTIPLE_FILES: 'files'
};

// Validation constants
const VALIDATION = {
	COMMIT_MESSAGE_MAX_LENGTH: 72,
	COMMIT_MESSAGE_MIN_LENGTH: 1
};

// Error messages
const ERROR_MESSAGES = {
	EMPTY_COMMIT_MESSAGE: 'Commit message cannot be empty',
	COMMIT_MESSAGE_TOO_LONG: `Commit message should not exceed ${72} characters for the first line`,
	NO_GIT_REPOSITORY: 'Not a git repository (or any parent up to mount point)',
	GIT_NOT_FOUND: 'git command not found',
	NO_CHANGES: 'No file change(s) found'
};

module.exports = {
	GIT_EXIT_CODES,
	GIT_STATUS_PATTERNS,
	GIT_REMOTE_TYPES,
	URL_PARSE_INDICES,
	CHANGE_MESSAGES,
	VALIDATION,
	ERROR_MESSAGES
};
