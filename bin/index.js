#!/usr/bin/env node
const program = require('commander');
const gitquick = require('../lib/gitquick');

program
  .description('Add, Commit, and Push')
  .action(function () {
    gitquick();
  });

program.parse(process.argv);