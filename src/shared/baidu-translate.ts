/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-04 11:32:36
 * @Description: 百度翻译-处理
 */
import { requestToBody } from '@/shared/fetch/requestToBody';
import state from '@/stores/index';
const SparkMD5 = require('spark-md5/spark-md5.js');

const qfrom = 'zh';
const qto = 'en';
const apiUrl = 'https://fanyi-api.baidu.com/api/trans/vip/translate';

// 存在跨域限制
// https://fanyi-api.baidu.com/doc/21

/**
 * @description: 百度翻译中文转英文
 * @param {string} q \n分割多个文本
 * @return {*}
 */
export const translateZhToEn = (q: string) => {
  const appid = state.settings.Settings.baiduTransAppid;
  const secret = state.settings.Settings.baiduTransSecret;
  const salt = Date.now();
  const sign = SparkMD5.hash(appid + q + salt + secret);
  const url = `${apiUrl}?q=${q}&from=${qfrom}&to=${qto}&appid=${appid}&salt=${salt}&sign=${sign}`;
  return requestToBody(url, 'GET');
};
