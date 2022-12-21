/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:31:41
 * @Description: api声明生成方法
 */
import { pathsItem } from '@/shared/ts/api-interface';
import { camelCase } from 'lodash';
import generateApiNotes from './generate-api-notes';

export default function generateApiDefineition(apiData: pathsItem & { requestParams: any }, prefix: string = '') {
  const { api, method } = apiData;

  const apiMatch = api.match(/[a-zA-Z0-9]*$/);
  const name = apiMatch && apiMatch.length > 0 ? camelCase(`${method} ${apiMatch[0]}`) : camelCase(api);
  let apiParams = 'params';
  let apiPath = prefix + api;
  const apiStrReg = /\{([\d\D]*)\}/g;
  if (method === 'post') {
    apiParams = 'data: params';
  }
  let argumentsData = ['params'];
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
