/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-11-25 14:13:40
 * @Description: Settings
 */

export interface apiurlPrefixItem {
  key: string;
  url: string; // 接口文档地址
  prefix: string; // 前缀
  status: boolean; // 状态
}

export interface Settings {
  language: string;
  theme: string;
  apiurlPrefixList: apiurlPrefixItem[];
  baiduTransAppid: string;
  baiduTransSecret: string;
  baiduApiToken: string;
}

export type TransformSateHistoryArrayItem = {
  key: string;
  text: string;
};
export interface TransformSate {
  status: boolean; // 代码转换关联转换文本
  textRecord: string[] | { search: string[]; column: string[] }; // 最后文本记录
  historyArray: TransformSateHistoryArrayItem[]; // 历史文本转换记录
  baseCode: any; // 用做匹配的原始代码
  isTranslate: boolean;
}
