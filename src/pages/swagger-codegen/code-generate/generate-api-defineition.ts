/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:31:41
 * @Description: api声明生成方法
 */
import { pathsItem } from '@/shared/ts/api-interface';
import { camelCase } from 'lodash';

export default function generateApiDefineition(apiData: pathsItem) {
  const { api, summary, method } = apiData;

  const apiMatch = api.match(/[a-zA-Z0-9]*$/);
  const name = apiMatch && apiMatch.length > 0 ? camelCase(`${method} ${apiMatch[0]}`) : camelCase(api);

  return `
/**
 * ${summary}
 */
 const ${name || 'fetch'} = (params) => {
  return axios(
    {
      path: '${api}',
      method: '${method}'
      params
    }
  )
};
  `;
}
