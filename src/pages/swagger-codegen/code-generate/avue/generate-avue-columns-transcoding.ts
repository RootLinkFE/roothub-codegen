/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-04-23 09:17:07
 * @Description: avueColumnTranscoding
 */
import { replaceDescriptionByRows, filterStrRepeat, matchCodeByName, prettyJSON } from '@/shared/utils';
import { isNil } from 'lodash';

/**
 * @description: avueColumn原始代码与响应参数匹配字段后返回
 * @param {any} list
 * @param {any} baseCode
 * @return {string}
 */
export function transcodingByRows(list: any[], baseCode: any) {
  const rows = replaceDescriptionByRows(list);
  if (Array.isArray(baseCode)) {
    const nextArr: { i: number; codeItem: any }[] = []; // baseCode未比对部分
    const labelField = 'label';

    baseCode.forEach((codeItem: any, i: number) => {
      const item = rows.find((v) => {
        return (
          !isNil(v.description) &&
          (v.description === codeItem[labelField] || v.description.indexOf(codeItem[labelField]) !== -1)
        );
      });
      if (item) {
        codeItem.prop = item.name;
      } else {
        nextArr.push({ i, codeItem });
      }
    });
    nextArr.forEach((m: { i: number; codeItem: any }) => {
      let item = filterStrRepeat(rows, m.codeItem[labelField]);
      if (item) {
        baseCode[m.i] = {
          ...m.codeItem,
          prop: item.name,
        };
      }
    });
  } else if (typeof baseCode === 'string') {
    const splitReg = '},';
    const splitCodes = baseCode.split(splitReg);
    const baseCodeList = splitCodes.map((code, index) => {
      return {
        isMatch: /(?=.*prop:)(?=.*label:)/s.test(code),
        // /label:/.test(code) && /prop:/.test(code),
        code: code + (index !== splitCodes.length - 1 ? splitReg : ''),
      };
    });

    const newCodeList: string[] = baseCodeList.map((codeItem) => {
      if (codeItem.isMatch) {
        return matchCodeByName(codeItem.code, rows);
      } else {
        return codeItem.code;
      }
    });
    return newCodeList.join('');
  }
  // 未匹配项原样输出
  return baseCode;
}

export default function avueColumnTranscoding(body: any, record?: any, api?: any, selectedData?: any) {
  let baseCode = '';
  let rows = [];

  if (Object.prototype.toString.call(body) === '[object Object]') {
    baseCode = body.baseCode;
    rows = body?.requestSelectedData;
  } else if (selectedData?.baseCode) {
    baseCode = selectedData.baseCode;
  } else if (record?.children) {
    rows = record.children;
  }
  if (baseCode === '' || baseCode === undefined || baseCode === null) {
    return 'no base code';
  }

  let code = transcodingByRows(rows, baseCode);
  return typeof code === 'string' ? code : prettyJSON(code);
}
