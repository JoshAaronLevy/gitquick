const chalk = require('chalk');

const gitRemoteError = (error) =>
	chalk.red.bold('ERROR! ') + chalk.white('Unable to find git remote URL:\n') + chalk.red.bold(error);

const gitRemoteWarning = (error) =>
	chalk.yellow.bold('WARNING! ') + chalk.white('Unable to identify git remote URL\n') + chalk.red.bold(error);

const gitAddError = (error) =>
	chalk.red.bold('ERROR! ') + chalk.white('Could not stage changes. See details below:\n') + chalk.red.bold(error);

const pushingUpstream = (currentBranch) => 
	chalk.yellow.bold('ALERT! ') +
	chalk.white(
		`${currentBranch} branch does not exist in remote repository yet.`
	);

const pushSuccess = (message, currentBranch, remoteUrl) => 
	chalk.white('Code changes pushed\n') +
	chalk.green.bold('Summary:\n') +
	chalk.white.bold('Commit Message: ') + chalk.white(`'${message}'\n`) +
	chalk.white.bold('Branch Name: ') + chalk.white(`${currentBranch}\n`) +
	chalk.white.bold('Git Remote URL: ') + chalk.white(`${remoteUrl}`);

const pushError = (p_1) =>
	chalk.red.bold('ERROR! ') +
	chalk.white(
		'Could not push to remote repository. See details below:\n' +
		`${p_1.all}`
	);

const pushUpstreamError = (p_1) =>
	chalk.red.bold('ERROR!') +
	chalk.white(
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