/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 17:19:48
 * @Description: generateAvueTableColumns
 */
import generateTableColumnsProps from './generate-table-columns-props';
import {
  cleanParameterDescription,
  filterTransformArrayByRows,
  filterBaseCodeByRows,
  prettyJSON,
} from '@/shared/utils';

export default function generateAvueTableColumns(body: any, record?: any, api?: any, selectedData?: any) {
  const TypeMap: Record<string, string> = {
    integer: 'number',
    string: 'input',
  };

  function getFieldType(prop: any): string {
    const { type, format, $ref } = prop;
    if ($ref) {
      return 'object';
    }
    if (type === 'string' && format === 'date-time') {
      return 'datetime';
    }
    return `${TypeMap[type] || prop.type}`;
  }

  const parametersSet = new Set();
  (api?.parameters ?? []).forEach((param: { name: string }) => {
    parametersSet.add(param.name);
  });
  let rows = Array.isArray(body) ? body : record?.children || [];
  if (selectedData?.baseCode) {
    let code = filterBaseCodeByRows(rows, selectedData.baseCode);
    return typeof code === 'string' ? code : prettyJSON(code);
  } else if (selectedData?.transformTextArray) {
    rows = filterTransformArrayByRows(rows, selectedData.transformTextArray);
  }

  return generateTableColumnsProps(rows, true, (row, index) => {
    const type = getFieldType(row);
    let result: any = {
      prop: row.name,
      label: cleanParameterDescription(row.description),
      minWidth: 150,
      overHidden: true,
      type,
    };
    const item = parametersSet.has(row.name);
    if (item) {
      result.search = true;
      result.searchPlaceholder = '请输入';

      if (
        row.description?.indexOf('状态') !== -1 ||
        (row.description && row.description.indexOf('ENUM#') !== -1) ||
        (row.enum && row.enum.length > 0)
      ) {
        result.searchType = 'select';
        result.type = 'select';
        result.searchPlaceholder = '请选择';
        result.dicData = [
          { label: '启用', value: 0 },
          { label: '停用', value: 1 },
        ];
      } else if (['date', 'time'].includes(row.name)) {
        result.searchType = 'datetime';
        result.type = 'datetime';
        result.format = 'YYYY-MM-DD HH:mm:ss';
        result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
        result.searchPlaceholder = '请选择';
        result.minWidth = 170;
      } else if (type === 'number') {
        result.min = 0;
        result.max = 999999999;
      }
    }
    return result;
  });
}
