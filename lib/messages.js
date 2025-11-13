const { red, yellow, green, white, bold } = require('colorette');

const gitRemoteError = (error) =>
	red(bold('ERROR! ')) + white('Unable to find git remote URL:\n') + red(bold(error));

const gitRemoteWarning = (error) =>
	yellow(bold('WARNING! ')) + white('Unable to identify git remote URL\n') + red(bold(error));

const gitAddError = (error) =>
	red(bold('ERROR! ')) + white('Could not stage changes. See details below:\n') + red(bold(error));

const pushingUpstream = (currentBranch) => 
	yellow(bold('ALERT! ')) +
	white(
		`${currentBranch} branch does not exist in remote repository yet.`
	);

const pushSuccess = (message, currentBranch, remoteUrl) => 
	white('Code changes pushed\n') +
	green(bold('Summary:\n')) +
	bold(white('Commit Message: ')) + white(`'${message}'\n`) +
	bold(white('Branch Name: ')) + white(`${currentBranch}\n`) +
	bold(white('Git Remote URL: ')) + white(`${remoteUrl}`);

const pushError = (p_1) =>
	red(bold('ERROR! ')) +
	white(
		'Could not push to remote repository. See details below:\n' +
		`${p_1.all}`
	);

const pushUpstreamError = (p_1) =>
	red(bold('ERROR!')) +
	white(
		' Could not push to remote repository via --set-upstream. See details below:\n' +
		`${p_1}`
	);

const logs = {
	gitRemoteError,
	gitRemoteWarning,
	gitAddError,
	pushingUpstream,
	pushSuccess,
	pushError,
	pushUpstreamError
};

module.exports = {
	logs
};