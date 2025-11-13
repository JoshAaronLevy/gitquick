import { logs } from './messages.js';
import { commands } from './commands.js';
import {
	GIT_EXIT_CODES,
	GIT_STATUS_PATTERNS,
	GIT_REMOTE_TYPES,
	URL_PARSE_INDICES,
	CHANGE_MESSAGES,
	ERROR_MESSAGES
} from './constants.js';
import { validateCommitMessage } from './validation.js';
import {
	ValidationError,
	GitRepositoryError,
	GitNotFoundError,
	GitCommandError
} from './errors.js';
import { createSpinner } from 'nanospinner';
import { red, yellow, green, white, bold, dim } from 'colorette';
import { GitContext, FileChanges } from './types.js';
import { promptConfirmation } from './prompt.js';

// Global debug flag
let debugMode: boolean = false;

/**
 * Set debug mode
 * @param enabled - Enable debug mode
 */
const setDebugMode = (enabled: boolean): void => {
	debugMode = enabled;
};

/**
 * Log debug information if debug mode is enabled
 * @param message - Debug message
 * @param data - Optional data to log
 */
const debugLog = (message: string, data: any = null): void => {
	if (debugMode) {
		console.log(dim(`[DEBUG] ${message}`));
		if (data) {
			console.log(dim(JSON.stringify(data, null, 2)));
		}
	}
};

/**
 * Handle and display errors with helpful messages
 * @param error - Error object
 */
const handleError = (error: any): void => {
	if (error instanceof ValidationError) {
		console.error(red(bold('VALIDATION ERROR: ')) + white(error.message));
		if (error.suggestion) {
			console.error(yellow('Suggestion: ') + white(error.suggestion));
		}
	} else if (error instanceof GitRepositoryError) {
		console.error(red(bold('GIT REPOSITORY ERROR: ')) + white(error.message));
		if (error.suggestion) {
			console.error(yellow('Suggestion: ') + white(error.suggestion));
		}
	} else if (error instanceof GitNotFoundError) {
		console.error(red(bold('GIT NOT FOUND: ')) + white(error.message));
		if (error.suggestion) {
			console.error(yellow('Suggestion: ') + white(error.suggestion));
		}
	} else if (error instanceof GitCommandError) {
		console.error(red(bold('GIT COMMAND ERROR: ')) + white(error.message));
		if (error.suggestion) {
			console.error(yellow('Suggestion: ') + white(error.suggestion));
		}
		if (debugMode && error.originalError) {
			console.error(dim('\nOriginal error:'));
			console.error(dim(error.originalError.stack || String(error.originalError)));
		}
	} else {
		console.error(red(bold('ERROR: ')) + white(error.message || error));
		if (debugMode && error.stack) {
			console.error(dim('\nStack trace:'));
			console.error(dim(error.stack));
		}
	}
};

/**
 * Main entry point - executes the complete git workflow
 * @param message - Commit message
 */
const runGitQuick = async (message: string): Promise<void> => {
	try {
		debugLog('Starting gitquick workflow');
		
		// Validate commit message
		const validatedMessage: string = validateCommitMessage(message);
		debugLog('Commit message validated', { message: validatedMessage });
		
		// Check git installation and repository
		await commands.checkGitInstalled();
		debugLog('Git is installed');
		
		await commands.checkGitRepository();
		debugLog('Git repository detected');
		
		// Get repository context
		const context: GitContext = {
			remoteUrl: await getRemoteUrl(),
			currentBranch: await getCurrentBranch()
		};
		debugLog('Repository context', context);
		
		// Execute workflow
		return await executeGitWorkflow(validatedMessage, context);
	} catch (error: any) {
		handleError(error);
		process.exit(1);
	}
};

export default runGitQuick;
export { setDebugMode };

/**
 * Get the current git branch name
 * @returns Current branch name
 */
const getCurrentBranch = async (): Promise<string> => {
	try {
		const result = await commands.getBranch();
		return result.stdout;
	} catch (error: any) {
		console.error(logs.gitRemoteError(error));
		return '';
	}
};

/**
 * Get the git remote URL for origin
 * @returns Remote URL
 */
const getRemoteUrl = async (): Promise<string> => {
	try {
		const result = await commands.getRemoteUrl();
		const remoteUrlList: string[] = result.all.split('\n').filter(url => url.includes(GIT_STATUS_PATTERNS.ORIGIN_REMOTE));
		return await parseOriginUrl(remoteUrlList[0]);
	} catch (error: any) {
		console.warn(logs.gitRemoteWarning(error));
		return '';
	}
};

/**
 * Parse and format the git remote URL from various formats
 * Handles HTTPS and SSH formats for GitHub, GitLab, and other Git hosts
 * @param rawRemoteUrl - Raw remote URL from git remote -v
 * @returns Formatted URL
 */
const parseOriginUrl = async (rawRemoteUrl: string): Promise<string> => {
	try {
		if (!rawRemoteUrl) {
			return '';
		}

		// If already HTTPS, extract the clean URL
		if (rawRemoteUrl.includes(GIT_REMOTE_TYPES.HTTPS)) {
			return rawRemoteUrl.substring(
				URL_PARSE_INDICES.HTTPS_START,
				rawRemoteUrl.length - URL_PARSE_INDICES.TRIM_END
			).trim();
		}
		
		// Convert SSH format to HTTPS for GitHub
		if (rawRemoteUrl.includes(GIT_REMOTE_TYPES.GITHUB)) {
			const repoPath: string = rawRemoteUrl.substring(
				URL_PARSE_INDICES.SSH_START,
				rawRemoteUrl.length - URL_PARSE_INDICES.TRIM_END
			).trim();
			return `https://github.com/${repoPath}`;
		}
		
		// Convert SSH format to HTTPS for GitLab
		if (rawRemoteUrl.includes(GIT_REMOTE_TYPES.GITLAB)) {
			const repoPath: string = rawRemoteUrl.substring(
				URL_PARSE_INDICES.SSH_START,
				rawRemoteUrl.length - URL_PARSE_INDICES.TRIM_END
			).trim();
			return `https://gitlab.com/${repoPath}`;
		}
		
		// Return as-is for other formats
		return rawRemoteUrl;
	} catch (error: any) {
		console.error(logs.gitRemoteError(error));
		return '';
	}
};

/**
 * Execute the complete git workflow: analyze, stage, commit, and push
 * @param message - Commit message
 * @param context - Context object containing remoteUrl and currentBranch
 */
const executeGitWorkflow = async (message: string, context: GitContext): Promise<void> => {
	const changes: FileChanges = await analyzeChanges();
	
	if (changes.totalCount === 0) {
		return;
	}
	
	// Display visual breakdown of changes
	displayChangesBreakdown(changes);
	
	// Ask for user confirmation
	const confirmed: boolean = await promptConfirmation();
	
	if (!confirmed) {
		console.log(yellow('\n⚠ Process aborted by user. No changes were staged or committed.\n'));
		return;
	}
	
	await stageChanges(changes.totalCount);
	await commitChanges(message);
	await pushToRemote(message, context);
};

/**
 * Analyze git status and categorize changed files
 * @returns FileChanges object with categorized files
 */
const analyzeChanges = async (): Promise<FileChanges> => {
	const spinner = createSpinner('Gathering file changes...').start();
	
	try {
		const result = await commands.getStatusShort();
		const statusLines: string[] = result.stdout.split('\n').filter(line => line.trim() !== '');
		
		const changes: FileChanges = {
			added: [],
			modified: [],
			deleted: [],
			renamed: [],
			totalCount: 0
		};
		
		// Parse git status --short output
		for (const line of statusLines) {
			if (line.length < 3) continue;
			
			const status = line.substring(0, 2);
			const filePath = line.substring(2).trim();
			
			// Handle different status codes
			if (status.includes('A')) {
				changes.added.push(filePath);
			} else if (status.includes('M')) {
				changes.modified.push(filePath);
			} else if (status.includes('D')) {
				changes.deleted.push(filePath);
			} else if (status.includes('R')) {
				changes.renamed.push(filePath);
			} else if (status === '??') {
				// Untracked files
				changes.added.push(filePath);
			}
		}
		
		changes.totalCount = changes.added.length + changes.modified.length + 
		                     changes.deleted.length + changes.renamed.length;
		
		if (changes.totalCount === 0) {
			spinner.warn({ text: yellow(bold('ALERT! ')) + white('No file change(s) found') });
			return changes;
		}
		
		spinner.success();
		return changes;
	} catch (error: any) {
		spinner.warn({ text: yellow(bold('ALERT! ')) + white('Process aborted') });
		return {
			added: [],
			modified: [],
			deleted: [],
			renamed: [],
			totalCount: 0
		};
	}
};

/**
 * Display a visual breakdown of file changes
 * @param changes - FileChanges object with categorized files
 */
const displayChangesBreakdown = (changes: FileChanges): void => {
	console.log('\n' + bold('📋 Changes Summary:'));
	console.log(dim('─'.repeat(50)));
	
	if (changes.added.length > 0) {
		console.log(green(bold(`\n✓ Added (${changes.added.length}):`)));
		changes.added.forEach(file => console.log(green(`  + ${file}`)));
	}
	
	if (changes.modified.length > 0) {
		console.log(yellow(bold(`\n⚡ Modified (${changes.modified.length}):`)));
		changes.modified.forEach(file => console.log(yellow(`  ~ ${file}`)));
	}
	
	if (changes.deleted.length > 0) {
		console.log(red(bold(`\n✗ Deleted (${changes.deleted.length}):`)));
		changes.deleted.forEach(file => console.log(red(`  - ${file}`)));
	}
	
	if (changes.renamed.length > 0) {
		console.log(white(bold(`\n↻ Renamed (${changes.renamed.length}):`)));
		changes.renamed.forEach(file => console.log(white(`  ↻ ${file}`)));
	}
	
	console.log(dim('\n' + '─'.repeat(50)));
	console.log(bold(`Total: ${changes.totalCount} file${changes.totalCount === 1 ? '' : 's'}\n`));
};

/**
 * Stage all changed files
 * @param changeCount - Number of files to stage
 */
const stageChanges = async (changeCount: number): Promise<void> => {
	const spinner = createSpinner('Adding file(s)...').start();
	
	try {
		await commands.stageFiles();
		
		const fileWord: string = changeCount === 1 ? CHANGE_MESSAGES.SINGLE_FILE : CHANGE_MESSAGES.MULTIPLE_FILES;
		const stageMessage: string = `${changeCount} ${fileWord} successfully staged`;
		
		spinner.success({ text: white(stageMessage) });
	} catch (error: any) {
		spinner.error({ text: logs.gitAddError(error) });
		throw error;
	}
};

/**
 * Commit staged changes with the provided message
 * @param message - Commit message
 */
const commitChanges = async (message: string): Promise<void> => {
	const spinner = createSpinner('Committing your awesome code...').start();
	
	try {
		// Sanitize commit message - escape single quotes
		const commitMessage: string = message.includes('\'') || message.includes('"')
			? message.replace(/'/g, '""')
			: message;
		
		await commands.commitChanges(commitMessage);
		spinner.success({ text: white(`'${message}' successfully committed`) });
	} catch (error: any) {
		spinner.error({ text: red(bold('ERROR! ')) + white(`${error}`) });
		throw error;
	}
};

/**
 * Push committed changes to remote repository
 * @param message - Commit message
 * @param context - Context object containing remoteUrl and currentBranch
 */
const pushToRemote = async (message: string, context: GitContext): Promise<void> => {
	const spinner = createSpinner(`Pushing "${message}" to remote repository...`).start();
	
	try {
		await commands.pushChanges();
		spinner.success({ text: logs.pushSuccess(message, context.currentBranch, context.remoteUrl) });
	} catch (error: any) {
		// If upstream is not set, try to set it
		if (error.exitCode === GIT_EXIT_CODES.UPSTREAM_NOT_SET) {
			spinner.warn({ text: logs.pushingUpstream(context.currentBranch) });
			await pushUpstream(message, context);
		} else {
			spinner.error({ text: logs.pushError(error) });
		}
	}
};

/**
 * Push to remote with upstream set
 * @param message - Commit message
 * @param context - Context object containing remoteUrl and currentBranch
 */
const pushUpstream = async (message: string, context: GitContext): Promise<void> => {
	const spinner = createSpinner(`Attempting to push ${context.currentBranch} upstream...`).start();
	
	try {
		await commands.pushUpstream(context.currentBranch);
		spinner.success({ text: logs.pushSuccess(message, context.currentBranch, context.remoteUrl) });
	} catch (error: any) {
		spinner.error({ text: logs.pushUpstreamError(error) });
	}
};