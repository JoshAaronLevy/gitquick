const execa = require('execa');
const chalk = require('chalk');

module.exports = async () => {
  const directory = process.cwd()
	const {stdout} = await execa('git', ['add', '-A'], {cwd: directory});
  console.log(stdout)
	return {stdout}
};
