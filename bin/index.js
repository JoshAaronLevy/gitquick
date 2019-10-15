#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action(async (message) => {
    await runner(message);
  });

program.parse(process.argv);
