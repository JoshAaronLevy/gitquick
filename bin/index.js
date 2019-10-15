#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const ora = require('ora');

program
  .description(`Example: gitquick "I fixed a bug"`)
  .option('[message]')
  .version('0.14.1', '-v, --version')
  .action(async (message) => {
    await runner(message);
  });

program.parse(process.argv);