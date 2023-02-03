/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 17:19:48
 * @Description: generateAvueTableColumns
 */
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription, filterTransformArrayByRows } from '@/shared/utils';

export default function generateAvueTableColumns(body: any, record?: any, api?: any, selectedData?: any) {
  const parametersSet = new Set();
  (api?.parameters ?? []).forEach((param: { name: string }) => {
    parametersSet.add(param.name);
  });
  let rows = Array.isArray(body) ? body : record?.children || [];
  if (selectedData?.transformTextArray) {
    rows = filterTransformArrayByRows(rows, selectedData.transformTextArray);
  }
  return generateTableColumnsProps(rows, true, (row, index) => {
    let result: any = {
      prop: row.name,
      label: cleanParameterDescription(row.description),
      minWidth: 150,
      overHidden: true,
    };
    const item = parametersSet.has(row.name);
    if (item) {
      result.search = true;

      if (
        row.name.indexOf('状态') !== -1 ||
        (row.description && row.description.indexOf('ENUM#') !== -1) ||
        (row.enum && row.enum.length > 0)
      ) {
        result.searchType = 'select';
      }
      if (['date', 'time'].includes(row.name)) {
        result.searchType = 'datetime';
        result.format = 'YYYY-MM-DD HH:mm:ss';
        result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
      }
    }
    return result;
  });
}
