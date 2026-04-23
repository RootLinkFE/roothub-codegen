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
    // 解决浏览器开发时的跨域问题，可以添加对应的代理配置
    // '/swagger-proxy': {
    //   target: 'http://xxx.xx.xx.xx:xxxx',
    //   changeOrigin: true,
    //   pathRewrite: { '^/swagger-proxy': '' },
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
