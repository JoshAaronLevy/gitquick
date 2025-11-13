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

module.exports = {
	GIT_EXIT_CODES,
	GIT_STATUS_PATTERNS,
	GIT_REMOTE_TYPES,
	URL_PARSE_INDICES,
	CHANGE_MESSAGES
};
