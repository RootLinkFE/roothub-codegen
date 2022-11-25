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
