/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 10:30:49
 * @Description: Custom-ts-声明
 */

export type types = ['api', 'model', 'request', 'response'];

export interface CustomMethodsItem {
  key: string;
  label: string;
  language?: string; // CodeMirror.language
  description?: string;
  type: string; // types
  source: string; // root、soucre
  function: string | void;
}

export interface CustomTypeMethods {
  model: {
    key: 'model';
    description: string;
    list: CustomMethodsItem[];
  };
  request: {
    key: 'request';
    description: string;
    list: CustomMethodsItem[];
  };
  response: {
    key: 'response';
    description: string;
    list: CustomMethodsItem[];
  };
}
