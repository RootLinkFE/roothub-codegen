/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description: 表格code生成 | 生成 ReactTable 列配置
 */
import { cleanParameterDescription, prettyJSON, filterTransformArrayByRows } from '@/shared/utils';

type filterItemFn = (row: any, index: number, rows: any[]) => any | null;

/**
 * 获取表格字段
 * @param rows 字段记录
 * @param filter 是否过滤表格不需要字段
 * @returns
 */
export default function generateTableColumnsProps(
  selectedData: any,
  filter: boolean = true,
  filterItem?: filterItemFn,
) {
  let rows: any[] = [];
  if (Array.isArray(selectedData)) {
    rows = selectedData;
  } else {
    rows = selectedData.responseSelectedData;
    if (selectedData?.transformTextRecord) {
      rows = filterTransformArrayByRows(rows, selectedData.transformTextRecord);
    }
  }

  const columns: any[] = [];
  rows.forEach((row, index) => {
    if (filter) {
      if (/\[\]/.test(row.type)) {
        // 数组类型过滤掉
        return;
      }
      if (/\S*Desc$/.test(row.name)) {
        // 枚举翻译字段去掉
        return;
      }
      if (/id|ID/.test(row.name)) {
        // 主键id去掉
        return;
      }
    }

    const c = filterItem
      ? filterItem(row, index, rows)
      : {
          dataIndex: row.name,
          title: cleanParameterDescription(row.description),
          hideInSearch: index === 0 || row.name === 'name' ? false : true, // 临时只显示第一个字段作为查询
        };

    columns.push(c);
  });

  return prettyJSON(columns);
}
