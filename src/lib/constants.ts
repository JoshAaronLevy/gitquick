/**
 * Constants used throughout the gitquick application
 */

// Git-related constants
export const GIT_EXIT_CODES: Record<string, number> = {
	UPSTREAM_NOT_SET: 128
} as const;

export const GIT_STATUS_PATTERNS: Record<string, string> = {
	TAB_CHARACTER: '\t',
	MODIFIED_PREFIX: 'modified:',
	ORIGIN_REMOTE: 'origin'
} as const;

export const GIT_REMOTE_TYPES: Record<string, string> = {
	HTTPS: 'https',
	GITHUB: 'github',
	GITLAB: 'gitlab'
} as const;

// URL parsing indices (for string manipulation fallback)
export const URL_PARSE_INDICES: Record<string, number> = {
	HTTPS_START: 6,
	SSH_START: 22,
	TRIM_END: 12
} as const;

// File change messages
export const CHANGE_MESSAGES: Record<string, string> = {
	SINGLE_FILE: 'file',
	MULTIPLE_FILES: 'files'
} as const;

// Validation constants
export const VALIDATION: Record<string, number> = {
	COMMIT_MESSAGE_MAX_LENGTH: 72,
	COMMIT_MESSAGE_MIN_LENGTH: 1
} as const;

// Error messages
export const ERROR_MESSAGES: Record<string, string> = {
	EMPTY_COMMIT_MESSAGE: 'Commit message cannot be empty',
	COMMIT_MESSAGE_TOO_LONG: `Commit message should not exceed ${72} characters for the first line`,
	NO_GIT_REPOSITORY: 'Not a git repository (or any parent up to mount point)',
	GIT_NOT_FOUND: 'git command not found',
	NO_CHANGES: 'No file change(s) found'
} as const;
