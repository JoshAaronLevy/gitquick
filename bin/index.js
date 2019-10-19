#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .description(`Example: gitquick "I fixed a bug"`)
  .option('[message]')
  .option('-c, --commit', '[message]')
  .version('1.5.2', '-v, --version')
  .action(async (option, message) => {
    console.log(option)
    await runner(option, message);
  });

program.parse(process.argv);