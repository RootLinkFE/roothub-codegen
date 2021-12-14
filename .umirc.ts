import { defineConfig } from 'umi';
const basePath = '/codegen/';
export default defineConfig({
  title: 'CodeGen',
  base: basePath,
  publicPath: basePath,
  qiankun: {
    slave: {},
  },
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [{ path: '/', component: '@/pages/index' }],
  fastRefresh: {},
});
