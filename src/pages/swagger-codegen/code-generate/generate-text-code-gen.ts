/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-03 14:46:27
 * @Description: generate-text-code-gen
 */
import { prettyJSON, isChinese } from '@/shared/utils';
import generateAvueFormColumns from './generate-avue-form-columns';

// 原数组
export const textCodeGenList = (textArray: any[]) => {
  return `${prettyJSON(textArray)}`;
};

// Options
export const textCodeGenOptions = (textArray: any[]) => {
  const columns: any[] = [];
  textArray.forEach((text, i) => {
    let key = isChinese(text) ? `value${i + 1}` : text;
    columns.push({
      label: text,
      value: key,
    });
  });
  return prettyJSON(columns);
};

// AvueColumns
export const textCodeGenAvueColumns = (textArray: any[]) => {
  const columns: any[] = [];
  let reg = new RegExp(/[a-zA-Z]+/g);
  textArray.forEach((text, i) => {
    let key = isChinese(text) ? `prop${i + 1}` : text;
    columns.push({
      label: text,
      prop: key,
      minWidth: reg.test(text)
        ? text.length > 16
          ? text.length * 7 + 10
          : 140
        : text.length > 8
        ? text.length * 14 + 10
        : 140,
      overHidden: true,
    });
  });
  return prettyJSON(columns);
};

// ReactTable
export const textCodeGenReactTable = (textArray: any[]) => {
  const columns: any[] = [];
  textArray.forEach((text, i) => {
    let key = isChinese(text) ? `key${i + 1}` : text;
    columns.push({
      key: key,
      dataIndex: key,
      title: text,
    });
  });
  return prettyJSON(columns);
};

// AvueFormColumns
export const textCodeGenAvueFormColumns = (textArray: any[]) => {
  const rows: any = textArray.map((text, i) => ({
    name: isChinese(text) ? `key${i + 1}` : text,
    description: text,
    type: 'string',
  }));
  return generateAvueFormColumns(rows);
};

// ElementTable
export const textCodeGenElementTable = (textArray: any[]) => {
  const columns: any[] = [];
  textArray.forEach((text, i) => {
    let key = isChinese(text) ? `key${i + 1}` : text;
    let reg = new RegExp(/[a-zA-Z]+/g);

    columns.push(
      `<el-table-column prop="${key}" label="${text}" width=${
        reg.test(text) ? (text.length > 16 ? text.length * 7 + 10 : 140) : text.length > 8 ? text.length * 14 + 10 : 140
      } />`,
    );
  });
  return `
<el-table :data="tableData" border style="width: 100%">
  ${prettyJSON(columns)}
</el-table>
  `;
};
