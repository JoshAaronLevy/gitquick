#!/usr/bin/env node
'use strict'
const inquirer = require('inquirer');
const runner = require('./runner.js');
const ora = require('ora');

let questions = [
  {
    type: 'input',
    name: 'commitMessage',
    message: 'Commit message',
    validate: function(answer) {
      if (answer.length > 5) {
        return true;
      } else {
        return "Please enter a valid commit message";
      }
    }
  }
];

module.exports = function () {
  inquirer.prompt(questions).then(answers => {
    ora('Nice code! Git committing and pushing...').start();

    const commitMessage = answers.commitMessage;
    runner(commitMessage);
  });
}