const packageJson = {
  name: 'react-components-demo',
  main: 'index.tsx',
  dependencies: {
    antd: '^4.14.0',
    react: '^17.0.0',
    'react-dom': '^17.0.0',
    '@ant-design/icons': '4.7.0',
    '@ant-design/pro-table': '2.60.0',
    '@roothub/components': '0.2.15',
  },
  devDependencies: {
    typescript: '^4.2.2',
  },
  keywords: ['react', 'antd'],
  description: 'React.js example codegen',
};

export default function genJson(dependencies = {}) {
  packageJson.dependencies = Object.assign(
    packageJson.dependencies,
    dependencies,
  );
  return JSON.stringify(packageJson, null, 2);
}
