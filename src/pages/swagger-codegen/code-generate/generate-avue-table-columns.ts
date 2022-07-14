/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 17:19:48
 * @Description: generateAvueTableColumns
 */
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription } from '@/shared/utils';

export default function generateAvueTableColumns(body: any, record?: any) {
  const rows = Array.isArray(body) ? body : record?.children || [];
  return generateTableColumnsProps(rows, true, (row, index) => {
    return {
      prop: row.name,
      label: cleanParameterDescription(row.description),
      minWidth: 150,
      overHidden: true,
      search: index === 0 || row.name === 'name' ? false : true, // 临时只显示第一个字段作为查询
    };
  });
}
