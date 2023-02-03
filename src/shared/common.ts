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
export const MethodTypes: string[] = ['api', 'text', 'model', 'request', 'response'];

export type OptionItem = {
  value: string;
  label: string;
};
export const languageOptions: OptionItem[] = [
  {
    label: ' Chinese(Simplified)',
    value: 'chs',
  },
  {
    label: 'Chinese(Traditional)',
    value: 'cht',
  },
  {
    label: 'English',
    value: 'eng',
  },
  {
    label: 'Finnish',
    value: 'fin',
  },
];

export const ImageTypes: string[] = ['PDF', 'GIF', 'PNG', 'JPG', 'JPEG', 'TIF', 'BMP'];

export const ApiDataTypes: OptionItem[] = [
  {
    label: '请求参数',
    value: 'request',
  },
  {
    label: '响应参数',
    value: 'response',
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
