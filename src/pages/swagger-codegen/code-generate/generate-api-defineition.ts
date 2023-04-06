/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:31:41
 * @Description: api声明生成方法
 */
import { pathsItem } from '@/shared/ts/api-interface';
import { camelCase } from 'lodash';
import generateApiNotes from './generate-api-notes';

export default function generateApiDefineition(apiData: pathsItem & { requestParams: any }, prefix: string = '') {
  const { api, method, parameters } = apiData;
  const apiMatch: any = api.match(/[a-zA-Z0-9]*$/);
  const apiMatchName = apiMatch?.length > 0 ? apiMatch[0] : '';
  const preReg = new RegExp(`^${method}`);
  const name =
    apiMatch && apiMatch.length > 0
      ? camelCase(`${preReg.test(apiMatchName) ? '' : method} ${apiMatchName}`)
      : camelCase(api);
  let apiParams = 'params';
  let apiPath = prefix + api;
  const apiStrReg = /\{([\d\D]*)\}/g;
  let argumentsData = ['params'];
  let inBody = false;
  let inQuery = false;
  (parameters || []).forEach((v) => {
    if (v.in === 'body') {
      inBody = true;
    } else if (v.in === 'query') {
      inQuery = true;
    }
  });
  // 处理接口传参格式
  if (inBody && inQuery) {
    argumentsData.push('data');
    apiParams = `params,
    data: data`;
  } else if (inQuery) {
    apiParams = 'params';
  } else if (inBody || method === 'post') {
    apiParams = 'data: params';
  }

  const matchPathId = apiStrReg.exec(api);
  if (matchPathId) {
    argumentsData.unshift(matchPathId[1]);
    apiPath = apiPath.replace(apiStrReg, function (str) {
      return `$${str}`;
    });
  }

  const notes = generateApiNotes(apiData);

  return `${notes}
const ${name || 'fetch'} = (${argumentsData.join(', ')}) => {
  return axios(
    {
      path: ${'`'}${apiPath}${'`'},
      method: '${method}',
      ${apiParams}
    }
  )
};
  `;
}
