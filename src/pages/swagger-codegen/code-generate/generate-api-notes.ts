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

  const FieldTypeMap: Record<string, string> = {
    integer: 'number',
  };

  const params: any[] = [];
  requestParams.forEach((row: any) => {
    params.push(`* @param {${FieldTypeMap[row.type] || row.type}} ${row.name}`);
  });

  return `/**
 * @description: ${summary}
${params.reduce((pre, cur) => {
  return `${pre ? pre + '\n' : pre} ${cur}`;
}, '')}
 * @return {*}
 */`;
}
