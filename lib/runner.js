const execa = require('execa');
const directory = process.cwd();
const ora = require('ora');

// module.exports = async (commitMessage) => {
// 	const spinner = ora(`Nice code! Adding file(s)...`).start()
// 	const p = await execa('git', ['add', '-A'], {cwd: directory});
// 	if (p.exitCode !== 0) {
// 		return spinner.fail(p.all)
// 	} else {
// 		spinner.succeed(`Files successfully staged! Committing...`)
// 		await gitCommitStep(commitMessage)
// 		return p
// 	}
// };

// const gitCommitStep = async (commitMessage) => {
// 	const spinner = ora(`Good message! Committing "${commitMessage}"...`).start()
// 	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
// 	if (p.exitCode !== 0) {
// 		return spinner.fail(p.all)
// 	} else {
// 		spinner.succeed(`"${commitMessage}" successfully committed! Pushing...`)
// 		await gitPushStep(commitMessage)
// 		return p
// 	}
// };

// const gitPushStep = async (commitMessage) => {
// 	const spinner = ora(`Pushing to GitHub. Prepare for takeoff...`).start()
// 	const p = await execa('git', ['push'], {cwd: directory})
// 	if (p.exitCode !== 0) {
// 		return spinner.fail(p.all)
// 	} else {
// 		spinner.succeed(`"${commitMessage}" successfully pushed to GitHub!`);
// 		return p
// 	}
// };

module.exports = async (commitMessage) => {
	gitAddStep(commitMessage);
	// const spinner = ora(`Nice code! Adding file(s)...`).start()
	// const p = await execa('git', ['add', '-A'], {cwd: directory})
	// 	.then(() => {
	// 		spinner.succeed(`Files successfully staged! Committing...`)
	// 		gitCommitStep(commitMessage)
	// 		return p
	// 	}).catch(p => {
	// 		return spinner.fail(p.all)
	// 	})
};

const gitAddStep = async (commitMessage) => {
	const spinner = ora(`Nice code! Adding file(s)...`).start();
	const p = await execa('git', ['add', '-A'], {cwd: directory})
		.then(() => {
			spinner.succeed(`Files successfully staged! Committing...`);
			return gitCommitStep(commitMessage);
		}).catch(() => {
			return spinner.fail(p.all);
		});
};

const gitCommitStep = async (commitMessage) => {
	const spinner = ora(`Good message! Committing "${commitMessage}"...`).start();
	const p = await execa('git', ['commit', '-m', `"${commitMessage}"`], {cwd: directory})
		.then(() => {
			spinner.succeed(`"${commitMessage}" successfully committed! Pushing...`);
			return gitPushStep(commitMessage);
		}).catch(() => {
			return spinner.fail(p.all);
		});
};

const gitPushStep = async (commitMessage) => {
	const spinner = ora(`Pushing "${commitMessage}" to GitHub...`).start();
	const p = await execa('git', ['push'], {cwd: directory})
		.then(() => {
			return spinner.succeed(`"${commitMessage}" successfully pushed!`);
		}).catch(() => {
			return spinner.fail(p.all);
		});
};