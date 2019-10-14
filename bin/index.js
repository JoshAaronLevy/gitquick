#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const ora = require('ora');

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action(async (message) => {
    const spinner = ora(`Adding, committing and pushing "${message}"`).start()
    await runner(message);
    spinner.succeed('Success!');
  });

program.parse(process.argv);