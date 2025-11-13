#!/usr/bin/env node
import { program } from 'commander';
import runGitQuick, { setDebugMode } from '../lib/runner.js';
import { promptCommitMessage } from '../lib/prompt.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version }: { version: string } = require('../../package.json');

interface ProgramOptions {
	debug?: boolean;
	verbose?: boolean;
}

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]', 'Commit message')
	.option('-d, --debug', 'Enable debug mode with verbose output')
	.option('--verbose', 'Enable verbose output (alias for --debug)')
	.version(version, '-v, --version')
	.action(async (message: string | undefined, options: ProgramOptions) => {
		// Enable debug mode if flag is set
		if (options.debug || options.verbose) {
			setDebugMode(true);
		}

		// Handle multi-word messages without quotes
		const processArgs: string[] = process.argv.slice(2);
		const flagArgs: string[] = processArgs.filter(arg => arg.startsWith('-'));
		const messageArgs: string[] = processArgs.filter(arg => !arg.startsWith('-'));
		
		if (messageArgs.length > 1) {
			message = messageArgs.join(' ');
		}

		try {
			if (!message) message = await promptCommitMessage() || undefined;
			if (message) {
				return await runGitQuick(message);
			} else {
				console.log('Unable to initiate commit process. Please try again.');
				process.exit(1);
			}
		} catch (error: any) {
			console.error(error.message || error);
			process.exit(1);
		}
	});

program.parse(process.argv);
