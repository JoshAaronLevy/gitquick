const execa = require("execa");
const directory = process.cwd();
const ora = require("ora");
const chalk = require("chalk");
let repoUrl = "";
let httpsUrl = "";
let sshUrl = "";
let remoteUrl = "";
let currentBranch = "";
let trackedStartIndex = 0;
let trackedEndIndex = 0;
let untrackedIndex = 0;
let untrackedFileList = [];
let trackedFileList = [];
let fileList;
let stageMessage = "";

module.exports = async (message, commit) => {
	try {
		// const p = await execa("git", ["remote", "-v"], { cwd: directory, all: true });
		remoteUrl = await getRepoUrlStuff();
		console.log("remoteUrl: ", remoteUrl);
	} catch (error) {
		console.log(chalk.red.bold("ERROR! ") + chalk.white("Unable to find git remote URL:\n") + chalk.red.bold(error));
	}
	currentBranch = await identifyCurrentBranch();
	await getUnstagedFiles(message, commit);
};

const identifyCurrentBranch = async () => {
	const p = await execa("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
		cwd: directory,
		all: true
	});
	return p.stdout;
};

const getRepoUrls = async (p) => {
	const gitUrls = {
		"github.com": "git@github.com:",
		"gitlab.com": "git@gitlab.com:",
		"dev.azure.com": "git@ssh.dev.azure.com:"
	};

	try {
		const remoteUrl = p.all.match(/\bgit@github.com?:\S+/gi)[0] || p.all.match(/\bgit@gitlab.com?:\S+/gi)[0] || p.all.match(/\bhttps?:\/\/\S+/gi)[0] || p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];
		console.log("remoteUrl: ", remoteUrl);
		if (!remoteUrl) {
			throw new Error("Git remote URL not found.");
		}

		const hostnames = new URL(remoteUrl);
		console.log("hostnames: ", hostnames);
		const { hostname } = new URL(remoteUrl);
		console.log("gitUrls[hostname]: ", gitUrls[hostname]);
		if (!(hostname in gitUrls)) {
			throw new Error(`Unsupported Git hosting service: ${hostname}.`);
		}

		console.log("gitUrls[hostname]: ", gitUrls[hostname]);

		sshUrl = gitUrls[hostname];
		repoUrl = remoteUrl.startsWith("https://") ? remoteUrl : sshUrl + remoteUrl.slice(sshUrl.length);
		return repoUrl.slice(0, -4);
	} catch (error) {
		console.error(`ERROR! Unable to find Git remote URL:\n${error}`);
	}
};

const getRepoUrlStuff = async () => {
	try {
		const p = await execa("git", ["remote", "-v"], { cwd: directory, all: true });
		console.log("p.all: ", p.all);
		const remoteUrlList = [p.all][0].split("\n").filter(url => url.includes("origin"));
		const originUrl = await identifyOriginUrl(remoteUrlList[0]);
		console.log("originUrl: ", originUrl);
		if (p.all.match(/\bgit@github.com?:\S+/gi) != null) {
			sshUrl = p.all.match(/\bgit@github.com?:\S+/gi)[0];
			return sshUrl.substring(0, sshUrl.length - 4);
		} else if (p.all.match(/\bgit@gitlab.com?:\S+/gi) != null) {
			sshUrl = p.all.match(/\bgit@gitlab.com?:\S+/gi)[0];
			return sshUrl.substring(0, sshUrl.length - 4);
		} else if (p.all.match(/\bhttps?:\/\/\S+/gi) != null) {
			httpsUrl = p.all.match(/\bhttps?:\/\/\S+/gi)[0];
			return httpsUrl.substring(0, httpsUrl.length - 4);
		} else if (p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi) != null) {
			sshUrl = p.all.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];
			let remoteSubString = sshUrl.substring(25, sshUrl.length);
			return `https://dev.azure.com/${remoteSubString}`;
		}
	} catch (error) {
		console.log(chalk.red.bold("ERROR! ") + chalk.white("Unable to find git remote URL:\n") + chalk.red.bold(error));
	}
};

const identifyOriginUrl = async (originUrl) => originUrl.match(/\bgit@github.com?:\S+/gi)[0] || originUrl.match(/\bgit@gitlab.com?:\S+/gi)[0] || originUrl.match(/\bhttps?:\/\/\S+/gi)[0] || originUrl.match(/\bgit@ssh.dev.azure.com?:\S+/gi)[0];


const getUnstagedFiles = async (message, commit) => {
	const spinner = ora("Gathering file changes...").start();
	untrackedFileList = [];
	trackedFileList = [];
	fileList = [];
	trackedStartIndex = 0;
	trackedEndIndex = 0;
	untrackedIndex = 0;
	try {
		const p = await execa("git", ["status"], { cwd: directory });
		fileList = p.stdout.split("\n");
		if (fileList.length > 0) {
			for (let i = 0; i < fileList.length; i++) {
				if (fileList[i] === "Changes not staged for commit:") {
					trackedStartIndex = i + 3;
					trackedEndIndex = fileList.length - 2;
				}
				if (fileList[i] === "Untracked files:") {
					untrackedIndex = i + 2;
					trackedEndIndex = i - 1;
				}
			}
			const trackedUnstagedFiles = await identifyTrackedUnstagedFiles(trackedStartIndex, trackedEndIndex, fileList);
			const untrackedUnstagedFiles = await identifyUntrackedUnstagedFiles(untrackedIndex, fileList);
			const unstagedFiles = trackedUnstagedFiles.concat(untrackedUnstagedFiles);
			if (
				trackedUnstagedFiles.length === 0 && untrackedUnstagedFiles.length === 0
			) return spinner.warn(chalk.yellow.bold("ALERT! ") + chalk.white("No file change(s) found"));
			if (unstagedFiles.length === 1) stageMessage = `${unstagedFiles.length} file`;
			if (unstagedFiles.length > 1) stageMessage = `${unstagedFiles.length} files`;
			spinner.succeed();
			return await gitAddStep(message, commit, stageMessage);
		}
	} catch (e) {
		return spinner.warn(
			chalk.yellow.bold("ALERT! ") + chalk.white("Process aborted")
		);
	}
};

const identifyTrackedUnstagedFiles = async (trackedStartIndex, trackedEndIndex, fileList) => {
	let trackedUnstagedFileList = [];
	if (trackedStartIndex > 0) {
		trackedFileList = fileList.slice(
			trackedStartIndex,
			trackedEndIndex
		);
		for (let i_1 = 0; i_1 < trackedFileList.length; i_1++) {
			if (trackedFileList[i_1] !== "") {
				trackedFileList[i_1] = trackedFileList[i_1].slice(12);
				trackedUnstagedFileList.push(trackedFileList[i_1].trim());
			}
		}
	}
	return await checkFileChars(trackedUnstagedFileList);
};

const identifyUntrackedUnstagedFiles = async (untrackedIndex, fileList) => {
	let untrackedUnstagedFileList = [];
	if (untrackedIndex > 0) {
		untrackedFileList = fileList.slice(
			untrackedIndex,
			fileList.length - 1
		);
		for (let i_2 = 0; i_2 < untrackedFileList.length; i_2++) {
			if (untrackedFileList[i_2] !== "") {
				untrackedUnstagedFileList.push(untrackedFileList[i_2]);
			}
		}
	}
	return await checkFileChars(untrackedUnstagedFileList);
};

const checkFileChars = async (fileList) => {
	const checkedList = fileList.map(file => {
		if (file.includes("\t")) {
			return file.replace("\t", "");
		} else {
			return file;
		}
	});
	return checkedList;
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
		return gitPushStep(message);
	} catch (error) {
		return spinner.fail(
			chalk.red.bold("ERROR! ") + chalk.white(`${error}`)
		);
	}
};

const gitPushStep = async (message) => {
	const spinner = ora(`Pushing "${message}" to remote repository...`).start();
	try {
		const pushResult = await execa("git", ["push"], { cwd: directory, all: true });
		console.log("pushResult: ", pushResult);
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
			return gitPushUpstream(currentBranch, message);
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