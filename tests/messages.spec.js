const chalk = require('chalk');
const { logs } = require('../lib/messages');

describe('Logging functions', () => {
	test('gitRemoteError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.gitRemoteError(error)).toBe(
			chalk.red.bold('ERROR! ') + chalk.white('Unable to find git remote URL:\n') + chalk.red.bold(error)
		);
	});

	test('gitRemoteWarning returns expected string', () => {
		const warning = 'Warning Message';
		expect(logs.gitRemoteWarning(warning)).toBe(
			chalk.yellow.bold('WARNING! ') + chalk.white('Unable to identify git remote URL\n') + chalk.red.bold(warning)
		);
	});

	test('gitAddError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.gitAddError(error)).toBe(
			chalk.red.bold('ERROR! ') + chalk.white('Could not stage changes. See details below:\n') + chalk.red.bold(error)
		);
	});

	test('pushingUpstream returns expected string', () => {
		const branch = 'master';
		expect(logs.pushingUpstream(branch)).toBe(
			chalk.yellow.bold('ALERT! ') + chalk.white(`${branch} branch does not exist in remote repository yet.`)
		);
	});

	test('pushSuccess returns expected string', () => {
		const message = 'commit message';
		const branch = 'master';
		const url = 'http://github.com/repo.git';
		expect(logs.pushSuccess(message, branch, url)).toBe(
			chalk.white('Code changes pushed\n') +
			chalk.green.bold('Summary:\n') +
			chalk.white.bold('Commit Message: ') + chalk.white(`'${message}'\n`) +
			chalk.white.bold('Branch Name: ') + chalk.white(`${branch}\n`) +
			chalk.white.bold('Git Remote URL: ') + chalk.white(`${url}`)
		);
	});

	test('pushError returns expected string', () => {
		const error = { all: 'Error Message' };
		expect(logs.pushError(error)).toBe(
			chalk.red.bold('ERROR! ') + chalk.white('Could not push to remote repository. See details below:\n' + `${error.all}`)
		);
	});

	test('pushUpstreamError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.pushUpstreamError(error)).toBe(
			chalk.red.bold('ERROR!') + chalk.white(' Could not push to remote repository via --set-upstream. See details below:\n' + `${error}`)
		);
	});
});
