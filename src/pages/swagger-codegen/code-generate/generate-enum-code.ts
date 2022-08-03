/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-27 17:16:27
 * @Description:
 */
import { prettyCode } from '@/shared/utils';

import { unionBy } from 'lodash';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getEnumCode(prop: any): string {
  const { name, description } = prop;
  if (prop.enum) {
    const result = description.split('：');
    const nameStr = result && result[0] && result[0].replace(/#/g, '');

    return `
      // ${nameStr}
      const ${name} = ${JSON.stringify(prop.enum, null)}
    `;
  } else {
    const enumStrReg = /([^ENUM]+)ENUM#(.+)#$/g;
    const result = enumStrReg.exec(description);

    const nameStr = result && result[1] && result[1].replace(/#/g, '');
    const enumStr = result && result[2];
    const obj: Record<string, any> = {};
    if (enumStr) {
      const enumReg = /\d:([^:]+):([^:,;]+)/g;
      let match;
      while ((match = enumReg.exec(enumStr)) !== null) {
        obj[match[2]] = match[1];
      }
    }
    return `
      // ${nameStr}
      const ${name} = ${JSON.stringify(obj, null)}
    `;
  }
}

export default function generateEnumCode(
  selectedData:
    | {
        requestSelectedData: any[];
        responseSelectedData: any[];
      }
    | any[],
  api: any = {},
) {
  console.log('selectedData', selectedData);
  let rows = [];
  if (Array.isArray(selectedData)) {
    rows = selectedData;
  } else {
    const { requestSelectedData, responseSelectedData } = selectedData;

    let resData;
    let resDataAll: any[] = [];
    if (requestSelectedData && requestSelectedData.length) {
      resData = responseSelectedData.find((item: { name: string }) => item.name === 'data').children ?? [];
    }

    function recursionReduce(list: any[]) {
      list.forEach((item: { children: Record<string, any>[] }) => {
        if (item && item.children && item.children.length) {
          recursionReduce(item.children);
        } else {
          resDataAll.push(item);
        }
      });
    }
    recursionReduce(resData || []);
    const data = requestSelectedData[0]?.children || [];

    rows = [...resData, ...data].filter((item: { description: string | string[] }) => {
      if (item && item.description && item.description.indexOf) {
        return item.description.indexOf('ENUM#') !== -1;
      }
      return false;
    });

    // 去掉重复的枚举
    rows = unionBy(rows, 'name');
  }
  return prettyCode(
    `
    ${rows
      .map(
        (row) => `
        ${getEnumCode(row)}
      `,
      )
      .join('')}`,
  );
}
