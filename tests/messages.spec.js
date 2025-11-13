import { red, yellow, green, white, bold } from 'colorette';
import { logs } from '../lib/messages.js';

describe('Logging functions', () => {
	test('gitRemoteError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.gitRemoteError(error)).toBe(
			red(bold('ERROR! ')) + white('Unable to find git remote URL:\n') + red(bold(error))
		);
	});

	test('gitRemoteWarning returns expected string', () => {
		const warning = 'Warning Message';
		expect(logs.gitRemoteWarning(warning)).toBe(
			yellow(bold('WARNING! ')) + white('Unable to identify git remote URL\n') + red(bold(warning))
		);
	});

	test('gitAddError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.gitAddError(error)).toBe(
			red(bold('ERROR! ')) + white('Could not stage changes. See details below:\n') + red(bold(error))
		);
	});

	test('pushingUpstream returns expected string', () => {
		const branch = 'master';
		expect(logs.pushingUpstream(branch)).toBe(
			yellow(bold('ALERT! ')) + white(`${branch} branch does not exist in remote repository yet.`)
		);
	});

	test('pushSuccess returns expected string', () => {
		const message = 'commit message';
		const branch = 'master';
		const url = 'http://github.com/repo.git';
		expect(logs.pushSuccess(message, branch, url)).toBe(
			white('Code changes pushed\n') +
			green(bold('Summary:\n')) +
			bold(white('Commit Message: ')) + white(`'${message}'\n`) +
			bold(white('Branch Name: ')) + white(`${branch}\n`) +
			bold(white('Git Remote URL: ')) + white(`${url}`)
		);
	});

	test('pushError returns expected string', () => {
		const error = { all: 'Error Message' };
		expect(logs.pushError(error)).toBe(
			red(bold('ERROR! ')) + white('Could not push to remote repository. See details below:\n' + `${error.all}`)
		);
	});

	test('pushUpstreamError returns expected string', () => {
		const error = 'Error Message';
		expect(logs.pushUpstreamError(error)).toBe(
			red(bold('ERROR!')) + white(' Could not push to remote repository via --set-upstream. See details below:\n' + `${error}`)
		);
	});
});
