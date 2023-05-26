#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");
const { inputCommitMessage } = require("../lib/prompt.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.argument("[message]")
	.version("1.2.2", "-v, --version")
	.action(async (message) => {
		try {
			console.log("program: ", program);
			if (!message) message = await inputCommitMessage();
			if (message) {
				return await runner(message);
			} else {
				console.log("Unable to initiate commit process. Please try again.");
			}
		} catch (error) {
			console.error(error);
		}
	});

program.parse(process.argv);
