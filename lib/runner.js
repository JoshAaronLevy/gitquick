const execa = require("execa");
const directory = process.cwd();
const ora = require("ora");
const chalk = require("chalk");
let sshUrl = "";
let remoteUrl = "";
let currentBranch = "";
let fileList;
let stageMessage = "";

module.exports = async (message, commit) => {
	try {
		remoteUrl = await getRepoUrls();
	} catch (error) {
		console.log(chalk.red.bold("ERROR! ") + chalk.white("Unable to find git remote URL:\n") + chalk.red.bold(error));
	}
	currentBranch = await identifyCurrentBranch();
	return await getUnstagedFiles(message, commit);
};

const identifyCurrentBranch = async () => {
	const p = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
		cwd: directory,
		all: true
	});
	return p.stdout;
};

const getRepoUrls = async () => {
	try {
		const p = await execa("git", ["remote", "-v"], { cwd: directory, all: true });
		const remoteUrlList = [p.all][0].split("\n").filter(url => url.includes("origin"));
		const originUrl = await identifyOriginUrl(remoteUrlList[0]);
		if (originUrl.includes("azure")) {
			const remoteSubString = sshUrl.substring(25, sshUrl.length);
			return `https://dev.azure.com/${remoteSubString}`;
		} else {
			return originUrl.substring(0, originUrl.length - 4);
		}
	} catch (error) {
		console.log(chalk.red.bold("ERROR! ") + chalk.white("Unable to find git remote URL:\n") + chalk.red.bold(error));
	}
};

const identifyOriginUrl = async (originUrl) => originUrl.match(/\bgit@github.com?:\S+/gi)[0] || originUrl.match(/\bgit@gitlab.com?:\S+/gi)[0] || originUrl.match(/\bhttps?:\/\/\S+/gi)[0] || originUrl.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];


const getUnstagedFiles = async (message, commit) => {
	const spinner = ora("Gathering file changes...").start();
	fileList = [];
	try {
		const p = await execa("git", ["status"], { cwd: directory });
		fileList = p.stdout.split("\n");
		let filteredList = fileList.filter(file => file.includes("\t")).map(file => {
			if (file.includes("modified:")) {
				return file.slice(12).trim();
			} else {
				return file.slice(1).trim();
			}
		});
		filteredList = filteredList.filter((item, index) => filteredList.indexOf(item) === index);
		if (filteredList.length === 0) return spinner.warn(chalk.yellow.bold("ALERT! ") + chalk.white("No file change(s) found"));
		if (filteredList.length > 0) {
			if (filteredList.length === 1) stageMessage = `${filteredList.length} file`;
			if (filteredList.length > 1) stageMessage = `${filteredList.length} files`;
			spinner.succeed();
			return await gitAddStep(message, commit, stageMessage);
		}
	} catch (e) {
		return spinner.warn(
			chalk.yellow.bold("ALERT! ") + chalk.white("Process aborted")
		);
	}
};

const gitAddStep = async (message, commit, stageMessage) => {
	const spinner = ora("Adding file(s)...").start();
	try {
		await execa("git", ["add", "-A"], { cwd: directory, all: true });
		spinner.succeed(
			chalk.green.bold("SUCCESS! ") + chalk.white(`${stageMessage} added`)
		);
		if (commit === true) {
			return gitCommitOnly(message);
		} else {
			return gitCommitStep(message);
		}
	} catch (error) {
		spinner.fail(
			chalk.red.bold("ERROR! ") + chalk.white("Could not stage changes. See details below:\n") + chalk.red.bold(error)
		);
	}
};

const gitCommitOnly = async (message) => {
	const spinner = ora("Committing your awesome code...").start();
	try {
		await execa("git", ["commit", "-m", `"${message}"`], { cwd: directory });
		spinner.succeed(
			chalk.green.bold("SUCCESS! ") +
			chalk.white(`Committed message: "${message}"`)
		);
	} catch (error) {
		spinner.fail(
			chalk.red.bold("ERROR! ") + chalk.white("Could not commit changes. See details below:\n") + chalk.red.bold(error)
		);
	}
};

const gitCommitStep = async (message) => {
	const spinner = ora("Committing your awesome code...").start();
	const commitMessage = `${message.replace(/"/g, "\"\"")}`;
	try {
		await execa(
			"git",
			["commit", "-m", commitMessage],
			{
				cwd: directory,
				all: true
			}
		);
		spinner.succeed(
			chalk.green.bold("SUCCESS! ") +
			chalk.white(`'${message}' successfully committed`)
		);
		return await gitPushStep(message);
	} catch (error) {
		return spinner.fail(
			chalk.red.bold("ERROR! ") + chalk.white(`${error}`)
		);
	}
};

const gitPushStep = async (message) => {
	const spinner = ora(`Pushing "${message}" to remote repository...`).start();
	try {
		await execa("git", ["push"], { cwd: directory, all: true });
		return spinner.succeed(
			chalk.green.bold("SUCCESS! ") + chalk.white("Code changes pushed\n") +
			chalk.blue.bold("Summary:\n") +
			chalk.yellow.bold("Commit Message: ") + chalk.white(`'${message}'\n`) +
			chalk.yellow.bold("Branch Name: ") + chalk.white(`${currentBranch}\n`) +
			chalk.yellow.bold("Git Remote URL: ") + chalk.white(`${remoteUrl}`)
		);
	} catch (p_1) {
		if (p_1.exitCode === 128) {
			spinner.warn(
				chalk.yellow.bold("ALERT! ") +
				chalk.white(
					`${currentBranch} branch does not exist in remote repository yet.`
				)
			);
			return await gitPushUpstream(currentBranch, message);
		} else {
			spinner.fail(
				chalk.red.bold("ERROR! ") +
				chalk.white(
					"Could not push to remote repository. See details below:\n" +
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
			"git",
			["push", "-u", "origin", `${currentBranch}`],
			{
				cwd: directory,
				all: true
			}
		);
		return spinner.succeed(
			chalk.green.bold("SUCCESS! ") + chalk.white("Code changes pushed\n") +
			chalk.blue.bold("Summary:\n") +
			chalk.yellow.bold("Commit Message: ") + chalk.white(`'${message}'\n`) +
			chalk.yellow.bold("Branch Name: ") + chalk.white(`${currentBranch}\n`) +
			chalk.yellow.bold("Git Remote URL: ") + chalk.white(`${remoteUrl}`)
		);
	} catch (p_1) {
		spinner.fail(
			chalk.red.bold("ERROR!") +
			chalk.white(
				" Could not push to remote repository via --set-upstream. See details below:\n" +
				`${p_1}`
			)
		);
	}
};