/**
 * Shared type definitions for gitquick
 */

export interface GitContext {
	remoteUrl: string;
	currentBranch: string;
}

export interface RunOptions {
	targetBranch?: string;
}

export interface CommandResult {
	stdout: string;
	stderr: string;
	all: string;
	exitCode: number;
	code: number;
}

export interface ValidationConfig {
	COMMIT_MESSAGE_MAX_LENGTH: number;
	COMMIT_MESSAGE_MIN_LENGTH: number;
}

export interface ErrorMessages {
	EMPTY_COMMIT_MESSAGE: string;
	COMMIT_MESSAGE_TOO_LONG: string;
	NO_GIT_REPOSITORY: string;
	GIT_NOT_FOUND: string;
	NO_CHANGES: string;
}

export interface FileChanges {
	added: string[];
	modified: string[];
	deleted: string[];
	renamed: string[];
	totalCount: number;
}

export type GitCliPreference = 'None' | 'GitHub' | 'GitLab' | null;

export interface GitQuickProjectConfig {
	projectName: string;
	gitCli: GitCliPreference;
}

export type PushFailureType =
	| 'NO_UPSTREAM'
	| 'NON_FAST_FORWARD'
	| 'AUTHENTICATION'
	| 'NETWORK'
	| 'GENERIC';

export type PushResolutionAction =
	| 'retryPush'
	| 'pullWithRebase'
	| 'pullWithMerge'
	| 'setUpstream'
	| 'abort';

export interface PushResolutionOption {
	label: string;
	value: PushResolutionAction;
	hint?: string;
}

export interface PushFailureScenario {
	type: PushFailureType;
	headline: string;
	details: string;
	options: PushResolutionOption[];
	rawMessage: string;
}
