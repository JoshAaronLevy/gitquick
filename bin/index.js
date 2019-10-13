#!/usr/bin/env node
const program = require('commander');
// const gitquick = require('../lib/gitquick');
const runner = require('../lib/runner.js');

// program
//   .description('Add, Commit, and Push')
//   .action(function () {
//     gitquick();
//   });

// program.parse(process.argv);

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action((message) => {
    console.log(message)
    runner(message);
  });

program.parse(process.argv);