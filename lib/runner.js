const { logs } = require('./messages');
const { commands } = require('./commands');
const {
	GIT_EXIT_CODES,
	GIT_STATUS_PATTERNS,
	GIT_REMOTE_TYPES,
	URL_PARSE_INDICES,
	CHANGE_MESSAGES
} = require('./constants');
const ora = require('ora');
const chalk = require('chalk');

/**
 * Main entry point - executes the complete git workflow
 * @param {string} message - Commit message
 */
module.exports = async (message) => {
	try {
		const context = {
			remoteUrl: await getRemoteUrl(),
			currentBranch: await getCurrentBranch()
		};
		return await executeGitWorkflow(message, context);
	} catch (error) {
		console.error(logs.gitRemoteError(error));
	}
};

/**
 * Get the current git branch name
 * @returns {Promise<string>} Current branch name
 */
const getCurrentBranch = async () => {
	try {
		const result = await commands.getBranch();
		return result.stdout;
	} catch (error) {
		console.error(logs.gitRemoteError(error));
	}
};

/**
 * Get the git remote URL for origin
 * @returns {Promise<string>} Remote URL
 */
const getRemoteUrl = async () => {
	try {
		const result = await commands.getRemoteUrl();
		const remoteUrlList = result.all.split('\n').filter(url => url.includes(GIT_STATUS_PATTERNS.ORIGIN_REMOTE));
		return await parseOriginUrl(remoteUrlList[0]);
	} catch (error) {
		console.warn(logs.gitRemoteWarning(error));
	}
};

/**
 * Parse and format the git remote URL from various formats
 * Handles HTTPS and SSH formats for GitHub, GitLab, and other Git hosts
 * @param {string} rawRemoteUrl - Raw remote URL from git remote -v
 * @returns {Promise<string>} Formatted URL
 */
const parseOriginUrl = async (rawRemoteUrl) => {
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
			const repoPath = rawRemoteUrl.substring(
				URL_PARSE_INDICES.SSH_START,
				rawRemoteUrl.length - URL_PARSE_INDICES.TRIM_END
			).trim();
			return `https://github.com/${repoPath}`;
		}
		
		// Convert SSH format to HTTPS for GitLab
		if (rawRemoteUrl.includes(GIT_REMOTE_TYPES.GITLAB)) {
			const repoPath = rawRemoteUrl.substring(
				URL_PARSE_INDICES.SSH_START,
				rawRemoteUrl.length - URL_PARSE_INDICES.TRIM_END
			).trim();
			return `https://gitlab.com/${repoPath}`;
		}
		
		// Return as-is for other formats
		return rawRemoteUrl;
	} catch (error) {
		console.error(logs.gitRemoteError(error));
		return '';
	}
};

/**
 * Execute the complete git workflow: analyze, stage, commit, and push
 * @param {string} message - Commit message
 * @param {object} context - Context object containing remoteUrl and currentBranch
 */
const executeGitWorkflow = async (message, context) => {
	const changeCount = await analyzeChanges();
	
	if (changeCount === 0) {
		return;
	}
	
	await stageChanges(changeCount);
	await commitChanges(message);
	await pushToRemote(message, context);
};

/**
 * Analyze git status and count changed files
 * @returns {Promise<number>} Number of changed files
 */
const analyzeChanges = async () => {
	const spinner = ora('Gathering file changes...').start();
	
	try {
		const result = await commands.getStatus();
		const statusLines = result.stdout.split('\n');
		
		// Filter and parse changed files
		const changedFiles = statusLines
			.filter(line => line.includes(GIT_STATUS_PATTERNS.TAB_CHARACTER))
			.map(line => {
				if (line.includes(GIT_STATUS_PATTERNS.MODIFIED_PREFIX)) {
					return line.slice(12).trim();
				}
				return line.slice(1).trim();
			});
		
		// Remove duplicates
		const uniqueFiles = [...new Set(changedFiles)];
		
		if (uniqueFiles.length === 0) {
			spinner.warn(chalk.yellow.bold('ALERT! ') + chalk.white('No file change(s) found'));
			return 0;
		}
		
		spinner.succeed();
		return uniqueFiles.length;
	} catch (error) {
		spinner.warn(chalk.yellow.bold('ALERT! ') + chalk.white('Process aborted'));
		return 0;
	}
};

/**
 * Stage all changed files
 * @param {number} changeCount - Number of files to stage
 */
const stageChanges = async (changeCount) => {
	const spinner = ora('Adding file(s)...').start();
	
	try {
		await commands.stageFiles();
		
		const fileWord = changeCount === 1 ? CHANGE_MESSAGES.SINGLE_FILE : CHANGE_MESSAGES.MULTIPLE_FILES;
		const stageMessage = `${changeCount} ${fileWord} added`;
		
		spinner.succeed(chalk.white(stageMessage));
	} catch (error) {
		spinner.fail(logs.gitAddError(error));
		throw error;
	}
};

/**
 * Commit staged changes with the provided message
 * @param {string} message - Commit message
 */
const commitChanges = async (message) => {
	const spinner = ora('Committing your awesome code...').start();
	
	try {
		// Sanitize commit message - escape single quotes
		const commitMessage = message.includes('\'') || message.includes('"')
			? message.replace(/'/g, '""')
			: message;
		
		await commands.commitChanges(commitMessage);
		spinner.succeed(chalk.white(`'${message}' successfully committed`));
	} catch (error) {
		spinner.fail(chalk.red.bold('ERROR! ') + chalk.white(`${error}`));
		throw error;
	}
};

/**
 * Push committed changes to remote repository
 * @param {string} message - Commit message
 * @param {object} context - Context object containing remoteUrl and currentBranch
 */
const pushToRemote = async (message, context) => {
	const spinner = ora(`Pushing "${message}" to remote repository...`).start();
	
	try {
		await commands.pushChanges();
		spinner.succeed(logs.pushSuccess(message, context.currentBranch, context.remoteUrl));
	} catch (error) {
		// If upstream is not set, try to set it
		if (error.exitCode === GIT_EXIT_CODES.UPSTREAM_NOT_SET) {
			spinner.warn(logs.pushingUpstream(context.currentBranch));
			await pushUpstream(message, context);
		} else {
			spinner.fail(logs.pushError(error));
		}
	}
};

/**
 * Push to remote with upstream set
 * @param {string} message - Commit message
 * @param {object} context - Context object containing remoteUrl and currentBranch
 */
const pushUpstream = async (message, context) => {
	const spinner = ora(`Attempting to push ${context.currentBranch} upstream...`).start();
	
	try {
		await commands.pushUpstream(context.currentBranch);
		spinner.succeed(logs.pushSuccess(message, context.currentBranch, context.remoteUrl));
	} catch (error) {
		spinner.fail(logs.pushUpstreamError(error));
	}
};