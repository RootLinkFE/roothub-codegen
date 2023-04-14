/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-12-01 11:25:13
 * @Description: api请求函数注释生成
 */
import { pathsItem } from '@/shared/ts/api-interface';

/**
 * @description: api请求函数注释生成
 * @param {pathsItem} apiData
 * @return {string} notes
 */
export default function generateNotes(apiData: pathsItem & { requestParams: any }) {
  const { summary, requestParams } = apiData;
  function forEachParam(list: any[], params: string[], parentName?: string) {
    const FieldTypeMap: Record<string, string> = {
      integer: 'number',
      parseFloat: 'number',
      float: 'number',
    };

    list.forEach((row: any) => {
      params.push(
        `* @param {${FieldTypeMap[row.type] || row.type}} ${parentName ? `${parentName}.` : ''}${row.name || ''} ${
          row.description || ''
        }`,
      );
      if (row.children && row.children.length > 0) {
        forEachParam(row.children, params, row.name);
      }
    });
  }
  const params: any[] = [];
  forEachParam(requestParams || [], params);

  return `/**
 * @description: ${summary}
${params.reduce((pre, cur) => {
  return `${pre ? pre + '\n' : pre} ${cur}`;
}, '')}
 * @return {*}
 */`;
}
