#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
// const ora = require('ora');

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action(async (message) => {
    // const spinner = ora(`Nice code! Adding, committing and pushing...`).start()
    await runner(message);
    // spinner.succeed(`"${message}" successfully committed and pushed!`);
  });

program.parse(process.argv);
