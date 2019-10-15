#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .version('0.12.0')
  .option('[message]')
  .option('-v', '--version', '[version]')
  .description('Add, Commit, and Push on the Fly')
  .action(async (message) => {
    await runner(message);
  });

program.parse(process.argv);
