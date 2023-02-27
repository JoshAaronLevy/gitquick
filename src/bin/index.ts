import commander from 'commander';
import { runner } from '../lib/runner';

const program = new commander.Command();

program
	.description(`Example: gitquick "I fixed a bug"`)
	.option('[message]')
	.option('-c, --commit')
	.version('2.11.16', '-v, --version')
	.action(async (message: string, command: commander.Command) => {
		let commit = command.commit;
		if (!commit) {
			commit = false;
		} else {
			commit = true;
		}
		await runner(message, commit);
	});

program.parse(process.argv);
