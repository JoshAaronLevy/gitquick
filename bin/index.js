#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');
const ora = require('ora');

program
  .option('[message]')
  .description('Add, Commit, and Push')
  .action((message) => {
    ora('Nice code! Committing and pushing...').start()
    // console.log('Nice code! Committing and pushing to git...')
    runner(message);
    ora().stop();
  });

program.parse(process.argv);