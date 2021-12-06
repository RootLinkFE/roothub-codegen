const { getRespGitBranch } = require('./git/utils');
const child_process = require('child_process');
const execSync = child_process.execSync;

const branchName = getRespGitBranch();

if (branchName === 'master') {
  buildCommand = 'npm run build:prod';
}

// console.log(process.env, process.env.ENV);
// 不同环境构建配置，CD脚本都是 npm run build
let buildCommand = `npm run build:${process.env.ENV}`;

console.log(branchName, '打包命令：', buildCommand);

execSync(buildCommand, { stdio: [0, 1, 2] });
