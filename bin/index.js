#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const prompt = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("[message]")
	.option("-c, --commit", "Commit changes only without pushing to remote repository", (commitFlag) => commitFlag)
	.version("4.3.7", "-v, --version")
	.action(async (message, command, commitFlag) => {
		console.log("command: ", command);
		console.log("commitFlag: ", commitFlag);
		let commit;
		(!command || (command && !command.commit)) ? commit = false : commit = true;
		console.log("commit: ", commit);
		process.argv.length > 2 ? message = message.trim() : message = await prompt.commitMessageInput();
		if (!message) return;
		await runner(message, commit);
	});

program.parse(process.argv);