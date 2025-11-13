const execa = require('execa');
const { GitRepositoryError, GitNotFoundError, GitCommandError } = require('./errors');
const { ERROR_MESSAGES } = require('./constants');
const directory = process.cwd();

/**
 * Check if git is installed and available
 * @throws {GitNotFoundError} If git is not found
 */
const checkGitInstalled = async () => {
	try {
		await execa('git', ['--version']);
	} catch (error) {
		if (error.code === 'ENOENT') {
			throw new GitNotFoundError();
		}
		throw error;
	}
};

/**
 * Check if current directory is a git repository
 * @throws {GitRepositoryError} If not a git repository
 */
const checkGitRepository = async () => {
	try {
		await execa('git', ['rev-parse', '--git-dir'], { cwd: directory });
	} catch (error) {
		if (error.stderr && error.stderr.includes('not a git repository')) {
			throw new GitRepositoryError();
		}
		throw new GitCommandError(
			ERROR_MESSAGES.NO_GIT_REPOSITORY,
			'Navigate to a git repository or run "git init" to create one.',
			error
		);
	}
};

const getBranch = async () => await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
  cwd: directory,
  all: true
});

const getRemoteUrl = async () => await execa('git', ['remote', '-v'], { cwd: directory, all: true });

const getStatus = async () => await execa('git', ['status'], { cwd: directory, all: true });

const stageFiles = async () => await execa('git', ['add', '-A'], { cwd: directory, all: true });

const commitChanges = async (commitMessage) => await execa(
  'git',
  ['commit', '-m', commitMessage],
  {
    cwd: directory,
    all: true
  }
);

const pushChanges = async () => await execa('git', ['push'], { cwd: directory, all: true });

const pushUpstream = async (currentBranch) => await execa(
  'git',
  ['push', '-u', 'origin', `${currentBranch}`],
  {
    cwd: directory,
    all: true
  }
);

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
