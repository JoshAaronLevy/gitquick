#!/usr/bin/env node
// 'use strict'
// const inquirer = require('inquirer');
// const runner = require('./runner.js');

// let questions = [
//   {
//     type: 'input',
//     name: 'commitMessage',
//     message: 'commit message:',
//     validate: function(answer) {
//       if (answer.length > 5) {
//         return true;
//       } else {
//         return "Please enter a valid commit message";
//       }
//     }
//   }
// ];

// module.exports = function () {
//   inquirer.prompt(questions).then(answers => {
//     const commitMessage = answers.commitMessage;
//     runner(commitMessage);
//   });
// }