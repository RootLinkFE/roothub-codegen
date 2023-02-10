/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-26 16:18:42
 * @Description: generateAvueFormColumns
 */
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription } from '@/shared/utils';

export default function generateAvueFormColumns(body: any, record?: any, api?: any) {
  const TypeMap: Record<string, string> = {
    integer: 'number',
  };

  function getFieldType(prop: any): string {
    const { type, format, $ref } = prop;
    if ($ref) {
      return 'object';
    }
    if (type === 'string' && format === 'date-time') {
      return 'dateTime';
    }
    return `${TypeMap[type] || prop.type}`;
  }

  const rows = Array.isArray(body) ? body : record?.children || [];
  return generateTableColumnsProps(rows, true, (row, index) => {
    let result: any = {
      prop: row.name,
      label: cleanParameterDescription(row.description),
      span: 24,
    };

    if (
      row.name.indexOf('状态') !== -1 ||
      (row.description && row.description.indexOf('ENUM#') !== -1) ||
      (row.enum && row.enum.length > 0)
    ) {
      result.type = 'select';
    } else if (['date', 'time'].includes(row.name)) {
      result.type = 'datetime';
      result.format = 'YYYY-MM-DD HH:mm:ss';
      result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
    } else {
      result.type = getFieldType(row);
    }
    return result;
  });
}
