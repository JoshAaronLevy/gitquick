#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const { inputCommitMessage } = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("[message]")
	.option("-c, --commit-only", "Commit changes only. Skip pushing to remote repository")
	.version("1.2.2", "-v, --version")
	.action(async (message, command) => {
		console.log("message: ", message);
		console.log("command: ", command);
		if (message?.args?.length === 0) message = await inputCommitMessage();
		return await runner(message);
	});

program.parse(process.argv);
