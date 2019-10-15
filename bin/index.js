#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const ora = require('ora');

program
  .option('[message]')
  .version('0.14.0', '-v, --version')
  .description('Add, Commit, and Push on the Fly')
  .action(async (message) => {
    await runner(message);
  });

program.parse(process.argv);