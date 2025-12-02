#!/usr/bin/env node
import { program } from 'commander';
import runGitQuick, { setDebugMode } from '../lib/runner.js';
import { promptCommitMessage, promptLongCommitMessage } from '../lib/prompt.js';
import { checkCommitMessageLength } from '../lib/validation.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { version }: { version: string } = require('../../package.json');

interface ProgramOptions {
	debug?: boolean;
	verbose?: boolean;
	target?: string;
}

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]', 'Commit message')
	.option('-d, --debug', 'Enable debug mode with verbose output')
	.option('--verbose', 'Enable verbose output (alias for --debug)')
	.option('--target <branch>', 'Sync current branch with the specified target branch before pushing')
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
			// If no message provided, prompt for one
			if (!message) {
				message = await promptCommitMessage() || undefined;
			}
			
			// Check if message exceeds length limit
			if (message) {
				const lengthCheck = checkCommitMessageLength(message);
				
				// If message is too long, prompt user to shorten or keep original
				if (!lengthCheck.isValid) {
					const newMessage = await promptLongCommitMessage(message);
					if (newMessage) {
						message = newMessage;
					} else {
						console.log('Unable to initiate commit process. Please try again.');
						process.exit(1);
					}
				}
				
				return await runGitQuick(message, { targetBranch: options.target });
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
