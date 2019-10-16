#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .description(`Example: gitquick "I fixed a bug"`)
  .option('[message]')
  .version('1.1.3', '-v, --version')
  .action(async (message) => {
    await runner(message);
  });

program.parse(process.argv);