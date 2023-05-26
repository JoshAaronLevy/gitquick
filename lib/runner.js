const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');
const chalk = require('chalk');
let remoteUrl = '';
let currentBranch = '';
let fileList;
let stageMessage = '';

module.exports = async (message) => {
	try {
		remoteUrl = await getRepoUrls();
	} catch (error) {
		console.log(chalk.red.bold('ERROR! ') + chalk.white('Unable to find git remote URL:\n') + chalk.red.bold(error));
	}
	currentBranch = await identifyCurrentBranch();
	return await getUnstagedFiles(message);
};

const identifyCurrentBranch = async () => {
	const p = await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
		cwd: directory,
		all: true
	});
	return p.stdout;
};

const getRepoUrls = async () => {
	try {
		const p = await execa('git', ['remote', '-v'], { cwd: directory, all: true });
		const remoteUrlList = [p.all][0].split('\n').filter(url => url.includes('origin'));
		return await identifyOriginUrl(remoteUrlList[0]);
	} catch (error) {
		console.log(chalk.yellow.bold('WARNING! ') + chalk.white('Unable to identify git remote URL\n') + chalk.red.bold(error));
	}
};

const identifyOriginUrl = async (rawRemoteUrl) => {
	if (rawRemoteUrl.includes('https')) {
		return rawRemoteUrl.substring(6, rawRemoteUrl.length - 12).trim();
	} else if (rawRemoteUrl.includes('github')) {
		return `https://github.com/${rawRemoteUrl.substring(22, rawRemoteUrl.length - 12).trim()}`;
	} else if (rawRemoteUrl.includes('gitlab')) {
		return `https://gitlab.com/${rawRemoteUrl.substring(22, rawRemoteUrl.length - 12).trim()}`;
	} else {
		return rawRemoteUrl;
	}
};


const getUnstagedFiles = async (message) => {
	const spinner = ora('Gathering file changes...').start();
	fileList = [];
	try {
		const p = await execa('git', ['status'], { cwd: directory });
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
		await execa('git', ['add', '-A'], { cwd: directory, all: true });
		spinner.succeed(
			chalk.white(`${stageMessage} added`)
		);
		return gitCommitStep(message);
	} catch (error) {
		spinner.fail(
			chalk.red.bold('ERROR! ') + chalk.white('Could not stage changes. See details below:\n') + chalk.red.bold(error)
		);
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
		await execa(
			'git',
			['commit', '-m', commitMessage],
			{
				cwd: directory,
				all: true
			}
		);
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
		await execa('git', ['push'], { cwd: directory, all: true });
		return spinner.succeed(
			chalk.white('Code changes pushed\n') +
			chalk.green.bold('Summary:\n') +
			chalk.white.bold('Commit Message: ') + chalk.white(`'${message}'\n`) +
			chalk.white.bold('Branch Name: ') + chalk.white(`${currentBranch}\n`) +
			chalk.white.bold('Git Remote URL: ') + chalk.white(`${remoteUrl}`)
		);
	} catch (p_1) {
		if (p_1.exitCode === 128) {
			spinner.warn(
				chalk.yellow.bold('ALERT! ') +
				chalk.white(
					`${currentBranch} branch does not exist in remote repository yet.`
				)
			);
			return await gitPushUpstream(currentBranch, message);
		} else {
			spinner.fail(
				chalk.red.bold('ERROR! ') +
				chalk.white(
					'Could not push to remote repository. See details below:\n' +
					`${p_1.all}`
				)
			);
		}
	}
};

const gitPushUpstream = async (currentBranch, message) => {
	const spinner = ora(
		`Attempting to set ${currentBranch} as upstream and push...`
	).start();
	try {
		await execa(
			'git',
			['push', '-u', 'origin', `${currentBranch}`],
			{
				cwd: directory,
				all: true
			}
		);
		return spinner.succeed(
			chalk.white('Code changes pushed\n') +
			chalk.green.bold('Summary:\n') +
			chalk.white.bold('Commit Message: ') + chalk.white(`'${message}'\n`) +
			chalk.white.bold('Branch Name: ') + chalk.white(`${currentBranch}\n`) +
			chalk.white.bold('Git Remote URL: ') + chalk.white(`${remoteUrl}`)
		);
	} catch (p_1) {
		spinner.fail(
			chalk.red.bold('ERROR!') +
			chalk.white(
				' Could not push to remote repository via --set-upstream. See details below:\n' +
				`${p_1}`
			)
		);
	}
};