/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-26 16:18:42
 * @Description: generateAvueSearchColumns
 */
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription } from '@/shared/utils';

export default function generateAvueSearchColumns(body: any, record?: any, option?: any) {
  const TypeMap: Record<string, string> = {
    integer: 'number',
    // string: 'input',
  };

  function getFieldType(prop: any): string {
    const { type, format, $ref } = prop;
    if ($ref) {
      return 'object';
    }
    if (type === 'string' && format === 'date-time') {
      return 'datetime';
    }
    return TypeMap[type] || (prop.type === 'string' ? null : prop.type);
  }

  const rows = Array.isArray(body) ? body : record?.children || body?.requestSelectedData || [];
  return generateTableColumnsProps(rows, true, (row, index) => {
    let result: any = {
      prop: row.name,
      label: cleanParameterDescription(row.description),
      span: 24,
      placeholder: '请输入',
    };
    const type = getFieldType(row);

    if (
      row.description?.indexOf('状态') !== -1 ||
      (row.description && row.description.indexOf('ENUM#') !== -1) ||
      (row.enum && row.enum.length > 0)
    ) {
      result.type = 'select';
      result.dicData = [
        { label: '启用', value: 0 },
        { label: '停用', value: 1 },
      ];
      result.placeholder = '请选择';
    } else if (['date', 'time'].includes(row.name)) {
      result.type = 'datetime';
      result.format = 'YYYY-MM-DD HH:mm:ss';
      result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
      result.placeholder = '请选择';
    } else if (type === 'number') {
      if (!/(Id|id)$/.test(row.name)) {
        result.min = 0;
        result.max = 999999999;
      }
    } else if (
      row.description?.indexOf('备注') !== -1 ||
      row.description?.indexOf('说明') !== -1 ||
      row.description?.indexOf('原因') !== -1
    ) {
      result.maxLength = 200;
      result.row = 3;
      if (type) {
        result.type = type;
      }
    } else {
      result.maxLength = 50;
      if (type) {
        result.type = type;
      }
    }
    return result;
  });
}
