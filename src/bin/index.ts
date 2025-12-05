#!/usr/bin/env node
import { program } from 'commander';
import runGitQuick, { setDebugMode } from '../lib/runner.js';
import { promptCommitMessage, promptLongCommitMessage, promptGitCliPreference } from '../lib/prompt.js';
import { checkCommitMessageLength } from '../lib/validation.js';
import { createRequire } from 'module';
import { ensureProjectEntry, getCurrentProjectName, isInteractiveEnvironment, printConfigFile, updateProjectGitCli } from '../lib/config.js';

const require = createRequire(import.meta.url);
const { version }: { version: string } = require('../../package.json');

interface ProgramOptions {
	debug?: boolean;
	verbose?: boolean;
	target?: string;
	config?: boolean;
}

const handleProjectConfigLifecycle = async (): Promise<void> => {
	const projectName = getCurrentProjectName();
	const project = await ensureProjectEntry(projectName);
	if (project.gitCli === null && isInteractiveEnvironment()) {
		const selection = await promptGitCliPreference();
		if (selection === 'No') {
			await updateProjectGitCli(projectName, 'None');
		}
	}
};

program
	.description('Example: gitquick "I fixed a bug"')
	.argument('[message]', 'Commit message')
	.option('-d, --debug', 'Enable debug mode with verbose output')
	.option('--verbose', 'Enable verbose output (alias for --debug)')
	.option('--target <branch>', 'Sync current branch with the specified target branch before pushing')
	.option('--config', 'Show gitquick configuration and exit')
	.version(version, '-v, --version')
	.action(async (message: string | undefined, options: ProgramOptions) => {
		// Enable debug mode if flag is set
		if (options.debug || options.verbose) {
			setDebugMode(true);
		}

		if (options.config) {
			await printConfigFile();
			return;
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
				
				await handleProjectConfigLifecycle();
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
