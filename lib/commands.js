const execa = require('execa');
const directory = process.cwd();

const getBranch = async () => await execa('git', ['rev-parse', '--abbrev-ref', 'HEAD'], {
  cwd: directory,
  all: true
});

const getRemoteUrl = async () => await execa('git', ['remote', '-v'], { cwd: directory, all: true });

const getStatus = async () => await execa('git', ['status'], { cwd: directory, all: true });

const stageFiles = async () => await execa('git', ['add', '-A'], { cwd: directory, all: true });

const commitChanges = async (commitMessage) => await execa(
  'git',
  ['commit', '-m', commitMessage],
  {
    cwd: directory,
    all: true
  }
);

const pushChanges = async () => await execa('git', ['push'], { cwd: directory, all: true });

const pushUpstream = async (currentBranch) => await execa(
  'git',
  ['push', '-u', 'origin', `${currentBranch}`],
  {
    cwd: directory,
    all: true
  }
);

const commands = {
  getBranch,
  getRemoteUrl,
  getStatus,
  stageFiles,
  commitChanges,
  pushChanges,
  pushUpstream
}

module.exports = { commands };
