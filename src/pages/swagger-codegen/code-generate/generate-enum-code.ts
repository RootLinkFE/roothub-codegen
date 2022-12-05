/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-27 17:16:27
 * @Description: 枚举格式化方法
 */

import { prettyCode } from '@/shared/utils';
import { unionBy } from 'lodash';

/** 判断是否存在枚举项,返回数字对应枚举类型
 * @description:
 * @param {any} item
 * @return {number}
 */
export function checkIsEnum(item: any): number {
  if (item.enum && item.enum.length > 0) {
    return 1;
  } else if (item && item.description) {
    const description = item.description;
    if (description.indexOf('ENUM#') !== -1) {
      return 2;
    } else if (/[是否|排序|状态]/.test(description) && /[0\:|\:0|0\-|0为]/.test(description)) {
      return 3;
    }
  }
  return 0;
}

/**
 * @description: 正则格式化键值对
 * @param {string} str
 * @param {RegExp} reg
 * @return {Object}
 */
function getExecObj(str: string, reg: RegExp): Object {
  const enumObj: Record<string, any> = {};
  const matchs = str.match(reg) || [];

  for (let i = 0; i < matchs.length; i++) {
    let execItem = reg.exec(str);
    if (execItem) {
      let leftKey: number = 2;
      let rightKey: number = 1;
      if (
        (execItem[leftKey] && /.*[\u4e00-\u9fa5]+.*/.test(execItem[leftKey])) ||
        (execItem[rightKey] && /\d/g.test(execItem[rightKey]))
      ) {
        // 中文为唯一键或数字为键值时转换
        leftKey = 1;
        rightKey = 2;
      }
      enumObj[execItem[leftKey] || i] = execItem[rightKey];
    }
  }
  return enumObj;
}

// 获取枚举项，及数据格式化
/**
 * @description:
 * @param {any} rows
 * @return {Array}
 */
export function getEnumCodeData(rows: any[]): any[] {
  return rows.reduce((pre, item) => {
    const { description } = item;
    let enumObj: Record<string, any> = {};
    switch (checkIsEnum(item)) {
      case 1: // enum
      // pre.push(item);
      case 2: // ENUM
        const enumStrReg = /([^ENUM]+)ENUM#(.+)(#)?$/g;
        let enumStr: string = '';
        let nameStr: string | null = '';

        if (/ENUM/g.test(description)) {
          const result = enumStrReg.exec(description);
          nameStr = result && result[0] && result[0].replace(/[ENUM|#]/g, '');
          enumStr = (result && result[2].replace(/#/g, '')) || '';

          if (enumStr && /\d:([^:]+)[:!,]([^:,;]+)/g.test(enumStr)) {
            // 1:a:A
            enumObj = getExecObj(enumStr, /\d:([^:]+):([^:,;]+)/g);
          } else if (enumStr && /\d:([^,]+)/.test(enumStr)) {
            // 1:a
            enumObj = getExecObj(enumStr, /\d:([^,]+)/g);
          }
        } else if (/^#/g.test(description)) {
          // 未标明ENUM
          enumStr = description.replace(/#/g, '') || '';
          enumObj = getExecObj(enumStr, /([^:：、]+):([^:、]+)/g);
        } else {
          item.enum.forEach((v: string) => {
            enumObj[v] = v;
          });
        }

        pre.push({
          ...item,
          enumStr: enumStr || description,
          nameStr: nameStr || description, // 注释
          enum: item.enum || enumObj,
          enumDescription: enumObj,
        });
        return pre;
      case 3: // other 非规范模式
        // case 3 用例
        // let a = [
        //   '是否禁用，0:启用，1:禁用',
        //   '是否存在有效期, 0:无,1:有',
        //   '是否启用(1:是 0:否)',
        //   '是否开启,0-否,1-是',
        //   '是否已禁用 0=否 1=是',
        //   '状态,启用:0 停用:1',
        //   '状态,启用:0 停用:1',
        //   '任务类型排序, 0为升序、1为降序',
        // ];

        if (/([^:：、, ，(]+)[:|：|\-|=|为]([^:、，,) ]+)/g.test(description)) {
          enumObj = getExecObj(description, /([^:：、, ，(]+)[:|：|\-|=|为]([^:、，,) ]+)/g);
        }
        pre.push({
          ...item,
          enumStr: description,
          nameStr: description, // 注释
          enum: item.enum || enumObj,
          enumDescription: enumObj,
        });
        return pre;

      default:
        return pre;
    }
  }, []);
}

/**
 * @description: 单项枚举数据转换为数组
 * @param {any} prop
 * @return {string}
 */
export function getEnumCode(prop: any): string {
  const { name, nameStr } = prop;
  return `
  // ${nameStr}
  const ${name} = ${JSON.stringify(prop.enum, null)}
`;
}

/**
 * @description: 单项枚举数据转换为options
 * @param {any} prop
 * @return {string}
 */
export function getEnumCodeToOptions(prop: any): string {
  const { name, description, nameStr, enumDescription = {} } = prop;
  const options = [];

  for (let key in enumDescription) {
    options.push({ value: key, label: enumDescription[key] });
  }

  return `
    // ${nameStr}
    const ${name}Options = ${JSON.stringify(options, null)}
  `;
}

/**
 * @description: 枚举数组格式化为array字符串
 * @param {any} rows
 * @return {string}
 */
export function handleEnumCodeDataToArray(rows: any): string {
  return rows
    .map(
      (row: any) => `
    ${getEnumCode(row)}
  `,
    )
    .join('');
}

/**
 * @description: 枚举数组格式化为options字符串
 * @param {any} rows
 * @return {string}
 */
export function handleEnumCodeDataToOptions(rows: any): string {
  return rows
    .map(
      (row: any) => `
    ${getEnumCodeToOptions(row)}
  `,
    )
    .join('');
}

// 收集枚举项并格式化字符串显示
/**
 * @description:
 * @param {any} selectedData
 * @return {string}
 */
export function generateEnumCode(
  selectedData:
    | {
        requestSelectedData: any[];
        responseSelectedData: any[];
      }
    | any[],
): string {
  let rows = [];
  if (Array.isArray(selectedData)) {
    rows = getEnumCodeData(selectedData);
  } else {
    const { requestSelectedData, responseSelectedData } = selectedData;

    let resData = [];
    if (responseSelectedData && responseSelectedData.length) {
      resData = responseSelectedData.find((item: { name: string }) => item.name === 'data')?.children ?? [];
    }
    if (requestSelectedData && requestSelectedData.length) {
      resData = [
        ...resData,
        ...(requestSelectedData.find((item: { name: string }) => item.name === 'data')?.children ?? []),
        ...(requestSelectedData[0]?.children || []),
      ];
    }

    function recursionReduce(list: any[]) {
      list.forEach((item: { children: Record<string, any>[] }) => {
        if (item && item.children && item.children.length) {
          recursionReduce(item.children);
        }
      });
    }
    recursionReduce(resData || []);
    rows = getEnumCodeData(resData);
    // 去掉重复的枚举
    rows = unionBy(rows, 'name');
  }

  return prettyCode(
    `
    ${handleEnumCodeDataToArray(rows)}
    ${handleEnumCodeDataToOptions(rows)}`,
  );
}
