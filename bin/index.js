#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .description(`Example: gitquick "I fixed a bug"`)
  .option('[message]')
  .option('-c, --commit')
  .version('1.5.2', '-v, --version')
  .action(async (message, command) => {
    let commit = command.commit;
    if (!commit) {
      commit = false;
    } else {
      commit = true;
    }
    // console.log(message);
    // console.log(commit);
    await runner(message);
  });

program.parse(process.argv);
