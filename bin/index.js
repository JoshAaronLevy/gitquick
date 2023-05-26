#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const { inputCommitMessage } = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("[message]")
	.version("1.2.2", "-v, --version")
	.action(async (message) => {
		console.log("message: ", message);
		await runner(message);
	});

program.parse(process.argv);
