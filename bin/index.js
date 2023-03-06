#!/usr/bin/env node
const program = require("commander");
const runner = require("../lib/runner.js");

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("[message]")
	.option("-c, --commit")
	.version("4.2.6", "-v, --version")
	.action(async (message, command) => {
		let commit = command.commit;
		if (!commit) {
			commit = false;
		} else {
			commit = true;
		}
		await runner(message, commit);
	});

program.parse(process.argv);