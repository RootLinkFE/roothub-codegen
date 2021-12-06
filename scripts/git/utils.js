const exec = require('child_process').execSync;

function getRespGitBranch() {
  const name = exec('git rev-parse --abbrev-ref HEAD').toString().trim();
  // console.log(`当前分支：${name}`);
  return name;
}

module.exports = { getRespGitBranch };
