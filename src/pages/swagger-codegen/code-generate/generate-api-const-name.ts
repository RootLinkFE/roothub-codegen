/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-12-01 11:25:13
 * @Description: api名称生成
 */
import { pathsItem } from '@/shared/ts/api-interface';
import { camelCase } from 'lodash';

/**
 * @description: api名称生成
 * @param {pathsItem} apiData
 * @return {string}
 */
export default function generateApiConstName(apiData: pathsItem) {
  const { api, method } = apiData;
  const apiStrReg = /\{([\d\D]*)\}/;
  const preReg = new RegExp(`^${method}`);
  let resultStr = '';
  const splitApi = api.split('/');
  for (let i = splitApi.length - 1; i > splitApi.length - 4; i--) {
    const str = preReg.test(splitApi[i]) ? splitApi[i]?.replace(method, '') : splitApi[i];
    if (!apiStrReg.test(str) && !['v1'].includes(str)) {
      resultStr = str + '-' + resultStr;
      if (resultStr.length > 24) {
        break;
      }
    }
  }
  return camelCase(method + '-' + resultStr);
}
