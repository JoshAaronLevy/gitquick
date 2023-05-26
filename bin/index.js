#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const { inputCommitMessage } = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("c, commit-only", "Add (stage) and commit changes only. Will not push to remote repository")
	.version("1.2.2", "-v, --version")
	.arguments("[message]")
	.action(async (message, command) => {
		console.log("message: ", message);
		console.log("command: ", command);
		if (command.commitOnly) {
			console.log("Commit only flag is set");
		}
		if (!message) message = await inputCommitMessage();
		if (message, command) {
			return await runner(message, command);
		} else {
			console.log("No message provided");
		}
	});

program.parse(process.argv);
