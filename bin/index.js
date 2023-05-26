#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const { inputCommitMessage } = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.argument("[message]")
	.option("-c, --commit-only", "Commit changes only. Skip pushing to remote repository")
	.version("1.2.2", "-v, --version")
	.action(async (message) => {
		console.log("program: ", program);
		console.log("message: ", message);
		// console.log("options: ", program.opts());
		if (program.opts().commitOnly) {
			console.log("Commit only flag is set");
		}
		if (!message) message = await inputCommitMessage();
		if (message) {
			return await runner(message);
		} else {
			console.log("No message provided");
		}
	});

program.parse(process.argv);
