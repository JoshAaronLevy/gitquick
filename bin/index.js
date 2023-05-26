#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const { inputCommitMessage } = require('../lib/prompt.js');

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]')
	.version('4.4.3', '-v, --version')
	.action(async (message) => {
		const processArgs = process.argv.slice(2);
		console.log('processArgs: ', processArgs);
		try {
			if (!message) message = await inputCommitMessage();
			if (message) {
				if (message[0] === '"' && (program.args && program.args.length > 1)) {
					message = program.args.join(' ');
				}
				console.log('program: ', program);
				return await runner(message);
			} else {
				console.log('Unable to initiate commit process. Please try again.');
			}
		} catch (error) {
			console.error(error);
		}
	});

console.log('process.argv: ', process.argv);

program.parse(process.argv);
