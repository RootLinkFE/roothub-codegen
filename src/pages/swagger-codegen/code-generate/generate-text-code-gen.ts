/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-03 14:46:27
 * @Description: generate-text-code-gen
 */
import { prettyJSON, isChinese, indexOfArray } from '@/shared/utils';
import generateAvueFormColumns from './avue/generate-avue-form-columns';

// 原数组
export const textCodeGenList = (textRecord: any[]) => {
  return `${prettyJSON(textRecord)}`;
};

// Options
export const textCodeGenOptions = (textRecord: any[], translateReault?: Map<string, string>) => {
  const columns: any[] = [];
  textRecord.forEach((text, i) => {
    let key = isChinese(text) ? translateReault?.get(text) ?? `value${i + 1}` : text;
    columns.push({
      label: text,
      value: key,
    });
  });
  return prettyJSON(columns);
};

// AvueColumns
export const textCodeGenAvueColumns = (textRecord: any[], translateReault?: Map<string, string>) => {
  const columns: any[] = [];
  let reg = new RegExp(/[a-zA-Z]+/g);
  textRecord.forEach((text, i) => {
    let key = isChinese(text) ? translateReault?.get(text) ?? `prop${i + 1}` : text;
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
export const textCodeGenReactTable = (textRecord: any[], translateReault?: Map<string, string>) => {
  const columns: any[] = [];
  textRecord.forEach((text, i) => {
    let key = isChinese(text) ? translateReault?.get(text) ?? `key${i + 1}` : text;
    columns.push({
      key: key,
      dataIndex: key,
      title: text,
    });
  });
  return prettyJSON(columns);
};

// AvueFormColumns
export const textCodeGenAvueFormColumns = (textRecord: any[], translateReault?: Map<string, string>) => {
  const rows: any = textRecord.map((text, i) => ({
    name: isChinese(text) ? translateReault?.get(text) ?? `key${i + 1}` : text,
    description: text,
    type: 'string',
  }));
  return generateAvueFormColumns(rows);
};

// ElementTable
export const textCodeGenElementTable = (textRecord: any[], translateReault?: Map<string, string>) => {
  const columns: any[] = [];
  textRecord.forEach((text, i) => {
    let key = isChinese(text) ? translateReault?.get(text) ?? `key${i + 1}` : text;
    let reg = new RegExp(/[a-zA-Z]+/g);

    columns.push(
      `<el-table-column prop="${key}" label="${text}" width=${
        reg.test(text) ? (text.length > 16 ? text.length * 7 + 10 : 140) : text.length > 8 ? text.length * 14 + 10 : 140
      } />`,
    );
  });
  return `
<el-table :data="tableData" border style="width: 100%">
  ${columns.reduce((a, b) => a + '\n  ' + b)}
</el-table>
  `;
};

const filterAvueSearchColumns = (value: string[], setSearchOrder = false, translateReault?: Map<string, string>) => {
  return value.map((text: string, i: number) => {
    let result: any = {
      label: text,
      prop: isChinese(text) ? translateReault?.get(text) ?? `key${i + 1}` : text,
      placeholder: '请输入',
    };
    if (setSearchOrder) {
      result.searchOrder = (value.length - i) * 10;
    }
    if (indexOfArray(text, ['状态', '类型', 'status'])) {
      result.type = 'select';
      result.dicUrl = '';
      result.dicData = [
        { label: '启用', value: 0 },
        { label: '停用', value: 1 },
      ];
      result.placeholder = '请选择';
    } else if (text.indexOf('是否') !== -1) {
      result.type = 'select';
      result.dicData = [
        { label: '是', value: 0 },
        { label: '否', value: 1 },
      ];
      result.placeholder = '请选择';
    } else if (indexOfArray(text, ['时间', 'datetime'])) {
      result.type = 'datetime';
      result.format = 'YYYY-MM-DD HH:mm:ss';
      result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
      result.placeholder = '请选择';
    } else if (indexOfArray(text, ['日期', 'date'])) {
      result.type = 'date';
      result.format = 'YYYY-MM-DD';
      result.valueFormat = 'YYYY-MM-DD';
      result.placeholder = '请选择';
    } else if (indexOfArray(text, ['月份', 'month'])) {
      result.type = 'month';
      result.format = 'YYYY-MM';
      result.valueFormat = 'YYYY-MM';
      result.placeholder = '请选择';
    }

    return result;
  });
};

// AvueSearchColumns
export const textCodeGenAvueSearchColumns = (value: any, translateReault?: Map<string, string>) => {
  const isCall = Object.prototype.toString.call(value);
  if (isCall === '[object Array]') {
    const rows = filterAvueSearchColumns(value, true, translateReault);
    return prettyJSON(rows);
  } else if (isCall === '[object Object]' && value.hasOwnProperty('search')) {
    // search 搜索部分， column表头部分，结合生成searchOrder
    const rows = filterAvueSearchColumns(value.column, false, translateReault);
    let baseSearchOrder = -1; // 起始searchOrder记录
    value.search.forEach((text: string) => {
      const index = rows.findIndex((v) => v.label === text);
      if (index !== -1) {
        rows[index].searchOrder = baseSearchOrder + 1;
        baseSearchOrder = index; // 记录对应index，用做未匹配插入
      } else {
        if (baseSearchOrder === -1) {
          baseSearchOrder = 0;
        }
        rows.splice(baseSearchOrder, 0, {
          prop: isChinese(text) ? `searchKey${baseSearchOrder + 1}` : text,
          label: text,
          placeholder: '请输入',
          searchOrder: baseSearchOrder + 2,
        });
        baseSearchOrder = baseSearchOrder + 1;
      }
    });
    return prettyJSON(rows);
  }
};
