const shell = require('shelljs');
const { GitRepositoryError, GitNotFoundError, GitCommandError } = require('./errors');
const { ERROR_MESSAGES } = require('./constants');

// Configure shell to be silent by default
shell.config.silent = true;

/**
 * Execute a git command and return result
 * @param {string} command - Git command to execute
 * @returns {object} Result object with stdout, stderr, code
 */
const execGitCommand = (command) => {
	const result = shell.exec(command);
	return {
		stdout: result.stdout.trim(),
		stderr: result.stderr.trim(),
		all: (result.stdout + result.stderr).trim(),
		exitCode: result.code,
		code: result.code
	};
};

/**
 * Check if git is installed and available
 * @throws {GitNotFoundError} If git is not found
 */
const checkGitInstalled = async () => {
	if (!shell.which('git')) {
		throw new GitNotFoundError();
	}
};

/**
 * Check if current directory is a git repository
 * @throws {GitRepositoryError} If not a git repository
 */
const checkGitRepository = async () => {
	const result = execGitCommand('git rev-parse --git-dir');
	if (result.code !== 0) {
		if (result.stderr.includes('not a git repository')) {
			throw new GitRepositoryError();
		}
		throw new GitCommandError(
			ERROR_MESSAGES.NO_GIT_REPOSITORY,
			'Navigate to a git repository or run "git init" to create one.',
			new Error(result.stderr)
		);
	}
};

const getBranch = async () => {
	const result = execGitCommand('git rev-parse --abbrev-ref HEAD');
	return result;
};

const getRemoteUrl = async () => {
	const result = execGitCommand('git remote -v');
	return result;
};

const getStatus = async () => {
	const result = execGitCommand('git status');
	return result;
};

const stageFiles = async () => {
	const result = execGitCommand('git add -A');
	if (result.code !== 0) {
		throw new Error(result.stderr || 'Failed to stage files');
	}
	return result;
};

const commitChanges = async (commitMessage) => {
	// Escape the commit message properly for shell
	const escapedMessage = commitMessage.replace(/"/g, '\\"');
	const result = execGitCommand(`git commit -m "${escapedMessage}"`);
	if (result.code !== 0) {
		throw new Error(result.stderr || 'Failed to commit changes');
	}
	return result;
};

const pushChanges = async () => {
	const result = execGitCommand('git push');
	if (result.code !== 0) {
		const error = new Error(result.stderr || 'Failed to push changes');
		error.exitCode = result.code;
		error.all = result.all;
		throw error;
	}
	return result;
};

const pushUpstream = async (currentBranch) => {
	const result = execGitCommand(`git push -u origin ${currentBranch}`);
	if (result.code !== 0) {
		throw new Error(result.stderr || 'Failed to push upstream');
	}
	return result;
};

const commands = {
  checkGitInstalled,
  checkGitRepository,
  getBranch,
  getRemoteUrl,
  getStatus,
  stageFiles,
  commitChanges,
  pushChanges,
  pushUpstream
};

module.exports = { commands };
