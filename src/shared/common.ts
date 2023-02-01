/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-07 19:24:01
 * @Description: common
 */
export const MethodColors: any = {
  post: '#49cc90',
  get: '#61affe',
  delete: '#f93e3e',
  put: '#fca130',
  POST: '#49cc90',
  GET: '#61affe',
  DELETE: '#f93e3e',
  PUT: '#fca130',
};

// 方法类型
export const MethodTypes: string[] = ['api', 'model', 'request', 'response'];

export type OptionItem = {
  value: string;
  key: string;
};
export const FileTypes: OptionItem[] = [
  {
    value: ' Chinese(Simplified)',
    key: 'chs',
  },
  {
    value: 'Chinese(Traditional)',
    key: 'cht',
  },
  {
    value: 'English',
    key: 'eng',
  },
  {
    value: 'Finnish',
    key: 'fin',
  },
];

export const ImageTypes: string[] = ['PDF', 'GIF', 'PNG', 'JPG', 'JPEG', 'TIF', 'BMP'];

export const ApiDataTypes: OptionItem[] = [
  {
    value: '请求参数',
    key: 'request',
  },
  {
    value: '响应参数',
    key: 'response',
  },
];

// CodeMirror-language-types
export const CodeMirrorTypes: string[] = [
  'javascript',
  'javascriptreact',
  'typescript',
  'typescriptreact',
  'vue',
  'vue-postcss',
  'vue-sugarss',
  'vue-html',
  'json',
  'jsonc',
  'graphql',
  'dart',
  'sql',
  'go',
  'java',
  'php',
  'jade',
  'python',
  'swift',
  'markdown',
];
