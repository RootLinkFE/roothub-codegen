/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-04-23 09:17:07
 * @Description: rhtablePageTranscoding
 */
import { replaceDescriptionByRows, filterStrRepeat, matchCodeByName, prettyJSON } from '@/shared/utils';
import { isNil } from 'lodash';

/**
 * @description: rhtablePage原始代码与响应参数匹配字段后返回
 * @param {any} list
 * @param {any} baseCode
 * @return {string}
 */
export function transcodingByRows(list: any[], baseCode: any) {
  const rows = replaceDescriptionByRows(list);
  const labelField = 'title';
  const propField = 'dataIndex';
  if (Array.isArray(baseCode)) {
    const nextArr: { i: number; codeItem: any }[] = []; // baseCode未比对部分

    baseCode.forEach((codeItem: any, i: number) => {
      const item = rows.find((v) => {
        return (
          !isNil(v.description) &&
          (v.description === codeItem[labelField] || v.description.indexOf(codeItem[labelField]) !== -1)
        );
      });
      if (item) {
        codeItem.dataIndex = item.name;
      } else {
        nextArr.push({ i, codeItem });
      }
    });
    nextArr.forEach((m: { i: number; codeItem: any }) => {
      let item = filterStrRepeat(rows, m.codeItem[labelField]);
      if (item) {
        baseCode[m.i] = {
          ...m.codeItem,
          dataIndex: item.name,
        };
      }
    });
  } else if (typeof baseCode === 'string') {
    const splitReg = '},';
    const splitCodes = baseCode.split(splitReg);
    const baseCodeList = splitCodes.map((code, index) => {
      return {
        isMatch: /(?=.*dataIndex:)(?=.*title:)/s.test(code),
        code: code + (index !== splitCodes.length - 1 ? splitReg : ''),
      };
    });

    const newCodeList: string[] = baseCodeList.map((codeItem) => {
      if (codeItem.isMatch) {
        return matchCodeByName(codeItem.code, rows, { labelField, propField });
      } else {
        return codeItem.code;
      }
    });
    return newCodeList.join('');
  }
  // 未匹配项原样输出
  return baseCode;
}

export default function rhtablePageTranscoding(body: any, record?: any, api?: any, selectedData?: any) {
  let baseCode = selectedData?.baseCode || body?.baseCode || ''; // baseCode获取
  let rows = body?.requestSelectedData || record?.children || []; // 处理rows传入

  if (baseCode === '') {
    return 'no base code';
  } else if (rows?.length === 0) {
    return 'no rows';
  }

  let code = transcodingByRows(rows, baseCode);
  return typeof code === 'string' ? code : prettyJSON(code);
}
