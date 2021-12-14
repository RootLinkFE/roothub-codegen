import {
  cleanParameterDescription,
  prettyCode,
  prettyJSON,
} from '../../../shared/utils';

export default function generateTableColumnsProps(
  rows: any[],
  filterArray = true,
) {
  const columns: any[] = [];

  rows.forEach((row, index) => {
    if (filterArray && /\[\]/.test(row.type)) {
      // 数组类型过滤掉
      return;
    }
    const c = {
      dataIndex: row.name,
      title: cleanParameterDescription(row.description),
      hideInSearch: index === 0 ? false : true, // 临时只显示第一个字段作为查询
    };
    columns.push(c);
  });

  return prettyJSON(columns);
}
