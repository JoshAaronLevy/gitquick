import { red, yellow, green, white, bold } from 'colorette';

export const gitRemoteError = (error: string): string =>
	red(bold('ERROR! ')) + white('Unable to find git remote URL:\n') + red(bold(error));

export const gitRemoteWarning = (error: string): string =>
	yellow(bold('WARNING! ')) + white('Unable to identify git remote URL\n') + red(bold(error));

export const gitAddError = (error: string): string =>
	red(bold('ERROR! ')) + white('Could not stage changes. See details below:\n') + red(bold(error));

export const pushingUpstream = (currentBranch: string): string => 
	yellow(bold('ALERT! ')) +
	white(
		`${currentBranch} branch does not exist in remote repository yet.`
	);

export const pushSuccess = (message: string, currentBranch: string, remoteUrl: string): string =>
	white('Code changes pushed\n') +
	green(bold('Summary:\n')) +
	bold(white('Commit Message: ')) + white(`'${message}'\n`) +
	bold(white('Branch Name: ')) + white(`${currentBranch}\n`) +
	bold(white('Git Remote URL: ')) + white(`${remoteUrl}`);

export const pushError = (error: string): string =>
	red(bold('ERROR! ')) +
	white(
		'Could not push to remote repository. See details below:\n' +
		`${error}`
	);

export const pushUpstreamError = (error: string): string =>
	red(bold('ERROR!')) +
	white(
		' Could not push to remote repository via --set-upstream. See details below:\n' +
		`${error}`
	);

export const logs = {
	gitRemoteError,
	gitRemoteWarning,
	gitAddError,
	pushingUpstream,
	pushSuccess,
	pushError,
	pushUpstreamError
};