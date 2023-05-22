import { defineConfig } from 'umi';
// const basePath = '/';

export default defineConfig({
  favicon: 'https://avatars.githubusercontent.com/u/76474279?s=200&v=4',
  devServer: {
    port: 3031,
  },
  title: 'CodeGen',
  // base: basePath,
  // publicPath: basePath,
  nodeModulesTransform: {
    type: 'none',
  },
  proxy: {
    // 'http://youip/swagger-resources': {
    //   target: 'http://youip/swagger-resources',
    //   changeOrigin: true,
    // },
  },
  history: {
    // 默认的类型是 `browser`，但是由于 vscode webview 环境不存在浏览器路由，改成 `memory` 和 `hash` 都可以（这里坑了好久）
    type: 'memory',
  },
  // 兼容VSCode开发
  outputPath: process.env.APP_TYPE === 'site' ? 'dist' : '../../templates/codegen',
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
});
