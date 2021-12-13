const packageJson = {
  name: 'react-components-demo',
  main: 'index.tsx',
  dependencies: {
    antd: '4.x',
    react: '>=16.9.0',
    'react-dom': '>=16.9.0',
    '@ant-design/pro-field': '1.24.1',
    '@ant-design/pro-form': '1.46.0',
  },
  devDependencies: {
    typescript: '^4',
  },
  postcss: {
    plugins: {
      autoprefixer: {},
    },
  },
  browserslist: ['> 1%', 'last 2 versions', 'not ie <= 8'],
  keywords: ['react', 'antd'],
  description: 'React.js example starter project',
};

export default function genJson(dependencies = {}) {
  packageJson.dependencies = Object.assign(
    packageJson.dependencies,
    dependencies,
  );
  return JSON.stringify(packageJson, null, 2);
}
