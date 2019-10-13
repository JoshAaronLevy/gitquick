const execa = require('execa');
const chalk = require('chalk');

module.exports = async (commitMessage) => {
	const {stdout} = await execa('git', ['add', '.', '&&', 'git', 'commit', '-m', commitMessage, '&&', 'git', 'push']);
	return {stdout}
	//=> 'unicorns'
};