import { defineConfig } from 'umi';
const basePath = '/gencode/';
export default defineConfig({
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
