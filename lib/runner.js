const { logs } = require('./messages');
const { commands } = require('./commands');
const ora = require('ora');
const chalk = require('chalk');
let remoteUrl = '';
let currentBranch = '';
let fileList;
let stageMessage = '';

module.exports = async (message) => {
	try {
		remoteUrl = await getRepoUrls();
		currentBranch = await identifyCurrentBranch();
		return await getUnstagedFiles(message);
	} catch (error) {
		console.error(logs.gitRemoteError(error));
	}
};

const identifyCurrentBranch = async () => {
	try {
		const p = await commands.getBranch();
		return p.stdout;
	} catch (error) {
		console.error(logs.gitRemoteError(error));
	}
};

const getRepoUrls = async () => {
	try {
		const p = await commands.getRemoteUrl();
		const remoteUrlList = [p.all][0].split('\n').filter(url => url.includes('origin'));
		return await identifyOriginUrl(remoteUrlList[0]);
	} catch (error) {
		console.warn(logs.gitRemoteWarning(error));
	}
};

const identifyOriginUrl = async (rawRemoteUrl) => {
	try {
		if (rawRemoteUrl.includes('https')) {
			return rawRemoteUrl.substring(6, rawRemoteUrl.length - 12).trim();
		} else if (rawRemoteUrl.includes('github')) {
			return `https://github.com/${rawRemoteUrl.substring(22, rawRemoteUrl.length - 12).trim()}`;
		} else if (rawRemoteUrl.includes('gitlab')) {
			return `https://gitlab.com/${rawRemoteUrl.substring(22, rawRemoteUrl.length - 12).trim()}`;
		} else {
			return rawRemoteUrl;
		}
	} catch (error) {
		console.error(logs.gitRemoteError(error));
	}
};

const getUnstagedFiles = async (message) => {
	const spinner = ora('Gathering file changes...').start();
	fileList = [];
	try {
		const p = await commands.getStatus();
		fileList = p.stdout.split('\n');
		let filteredList = fileList.filter(file => file.includes('\t')).map(file => {
			if (file.includes('modified:')) {
				return file.slice(12).trim();
			} else {
				return file.slice(1).trim();
			}
		});
		filteredList = filteredList.filter((item, index) => filteredList.indexOf(item) === index);
		if (filteredList.length === 0) return spinner.warn(chalk.yellow.bold('ALERT! ') + chalk.white('No file change(s) found'));
		if (filteredList.length > 0) {
			if (filteredList.length === 1) stageMessage = `${filteredList.length} file`;
			if (filteredList.length > 1) stageMessage = `${filteredList.length} files`;
			spinner.succeed();
			return await gitAddStep(message, stageMessage);
		}
	} catch (e) {
		return spinner.warn(
			chalk.yellow.bold('ALERT! ') + chalk.white('Process aborted')
		);
	}
};

const gitAddStep = async (message, stageMessage) => {
	const spinner = ora('Adding file(s)...').start();
	try {
		await commands.stageFiles();
		spinner.succeed(
			chalk.white(`${stageMessage} added`)
		);
		return gitCommitStep(message);
	} catch (error) {
		spinner.fail(logs.gitAddError(error));
	}
};

const gitCommitStep = async (message) => {
	const spinner = ora('Committing your awesome code...').start();
	let commitMessage = message.trim();
	if (message.includes('\'') || message.includes('"')) {
		commitMessage = `${message.replace(/'/g, '""')}`;
	} else {
		commitMessage = message;
	}
	try {
		await commands.commitChanges(commitMessage);
		spinner.succeed(
			chalk.white(`'${message}' successfully committed`)
		);
		return await gitPushStep(message);
	} catch (error) {
		return spinner.fail(
			chalk.red.bold('ERROR! ') + chalk.white(`${error}`)
		);
	}
};

const gitPushStep = async (message) => {
	const spinner = ora(`Pushing "${message}" to remote repository...`).start();
	try {
		await commands.pushChanges();
		return spinner.succeed(logs.pushSuccess(message, currentBranch, remoteUrl));
	} catch (p_1) {
		if (p_1.exitCode === 128) {
			spinner.warn(logs.pushingUpstream(currentBranch));
			return await gitPushUpstream(currentBranch, message);
		} else {
			spinner.fail(logs.pushError(p_1));
		}
	}
};

const gitPushUpstream = async (currentBranch, message) => {
	const spinner = ora(`Attempting to push ${currentBranch} upstream...`).start();
	try {
		await commands.pushUpstream(currentBranch);
		return spinner.succeed(logs.pushSuccess(message, currentBranch, remoteUrl));
	} catch (p_1) {
		spinner.fail(logs.pushUpstreamError(p_1));
	}
};