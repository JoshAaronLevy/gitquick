#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const ora = require('ora');

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action(async (message) => {
    const spinner = ora('Nice code! Committing and pushing...').start()
    await runner(message);
    spinner.stop();
  });

program.parse(process.argv);