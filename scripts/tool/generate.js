const { fchownSync } = require('fs');
const fse = require('fs-extra');
const path = require('path');
const args = process.argv.slice(2);
const [type, filePath] = args;
const name = filePath.split('/').pop();

const cwd = path.join(__dirname, '../../src/');

const generate = {
  page() {
    const dir = path.join(cwd, 'pages', filePath);
    this._g(dir);
  },
  component() {
    const dir = path.join(cwd, 'pages', filePath);
    this._g(dir);
  },
  _g(dir) {
    fse.mkdirpSync(dir);
    fse.writeFile(
      path.join(dir, 'index.tsx'),
      `import React from 'react';
import styles from './index.module.less'

const ${name}: React.FC = function () {
  return <div></div>;
};

export default ${name};`,
    );

    fse.writeFile(path.join(dir, 'index.module.less'), '');
    console.log('生成成功');
  },
};

generate[type]();

// console.log('args: ', args)
