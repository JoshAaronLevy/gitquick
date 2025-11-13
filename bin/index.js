#!/usr/bin/env node
import { program } from 'commander';
import runGitQuick, { setDebugMode } from '../lib/runner.js';
import { promptCommitMessage } from '../lib/prompt.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]', 'Commit message')
	.option('-d, --debug', 'Enable debug mode with verbose output')
	.option('--verbose', 'Enable verbose output (alias for --debug)')
	.version(version, '-v, --version')
	.action(async (message, options) => {
		// Enable debug mode if flag is set
		if (options.debug || options.verbose) {
			setDebugMode(true);
		}

		// Handle multi-word messages without quotes
		const processArgs = process.argv.slice(2);
		const flagArgs = processArgs.filter(arg => arg.startsWith('-'));
		const messageArgs = processArgs.filter(arg => !arg.startsWith('-'));
		
		if (messageArgs.length > 1) {
			message = messageArgs.join(' ');
		}

		try {
			if (!message) message = await promptCommitMessage();
			if (message) {
				return await runGitQuick(message);
			} else {
				console.log('Unable to initiate commit process. Please try again.');
				process.exit(1);
			}
		} catch (error) {
			console.error(error.message || error);
			process.exit(1);
		}
	});

program.parse(process.argv);
