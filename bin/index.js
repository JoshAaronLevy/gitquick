#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const { promptCommitMessage } = require('../lib/prompt.js');
const { version } = require('../package.json');

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]')
	.version(version, '-v, --version')
	.action(async (message) => {
		const processArgs = process.argv.slice(2);
		if (processArgs.length > 1) {
			message = processArgs.slice(0, processArgs.length).join(' ');
		}
		try {
			if (!message) message = await promptCommitMessage();
			if (message) {
				return await runner(message);
			} else {
				console.log('Unable to initiate commit process. Please try again.');
			}
		} catch (error) {
			console.error(error);
		}
	});

program.parse(process.argv);
