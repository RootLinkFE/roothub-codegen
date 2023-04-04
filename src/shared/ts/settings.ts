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
}

export type TransformSateHistoryArrayItem = {
  key: string;
  text: string;
};
export interface TransformSate {
  status: boolean; // 代码转换关联转换文本
  textArray: string[]; // 最后文本记录数组
  historyArray: TransformSateHistoryArrayItem[]; // 历史文本转换记录
  isBaseCode: boolean; // 是否原始代码
  baseCode: any;
}
