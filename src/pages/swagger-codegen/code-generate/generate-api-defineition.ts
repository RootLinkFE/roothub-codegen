/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:31:41
 * @Description: api声明生成方法
 */
import { pathsItem } from '@/shared/ts/api-interface';
import generateApiNotes from './generate-api-notes';
import generateApiConstName from './generate-api-const-name';

export default function generateApiDefineition(apiData: pathsItem & { requestParams: any }, prefix: string = '') {
  const { api, method, parameters } = apiData;
  const name = generateApiConstName(apiData) ?? method;
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
