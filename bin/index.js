#!/usr/bin/env node
const program = require('commander');
const runner = require('../lib/runner.js');

program
  .version('0.12.0', '-v, --version')
  .option('[message]', `Example: gitquick "I added some features"`)
  .option('-h, --help')
  .description('Add, Commit, and Push on the Fly')
  .action(async (message) => {
    await runner(message);
  });

// program.on('-h, --help', function(){
//   console.log('');
//   console.log('Example:');
//   console.log(`gitquick "I added some features"`);
// });

program.parse(process.argv);
