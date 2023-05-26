#!/usr/bin/env node
const commander = require("commander");
const program = new commander.Command();
const runner = require("../lib/runner.js");
const prompt = require("../lib/prompt.js");

// program
// 	.name("gitquick")
// 	.description("CLI to add, commit and push changes to remote repository in one step")
// 	.version("4.4.2");

console.log("process.argv: ", process.argv);

program
	.description("Example: gitquick \"I fixed a bug\"")
	.option("[message]")
	.option("-c, --commit", "Commit changes only without pushing to remote repository", false)
	.version("4.4.2")
	.action(async (command, options) => {
		let message;
		// console.log("command: ", command);
		console.log("options: ", options);
		// console.log("commitFlag: ", commitFlag);
		let commit = false;
		// (!options || (options && !options.commit)) ? commit = false : commit = true;
		// console.log("commit: ", commit);
		command ? message = command.trim() : message = await prompt.commitMessageInput();
		if (!message) return;
		await runner(message, commit);
	});

program.parse(process.argv);

const options = program.opts();
console.log("options: ", options);
