/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-15 16:17:07
 * @Description: generate-element-table-form-transcoding
 */
import { replaceDescriptionByRows, matchCodeByName, prettyJSON } from '@/shared/utils';

type FieldData = {
  labelField: string;
  propField: string;
  symbolField?: string;
};

/**
 * @description: 原始代码(el-table-column|el-form-item)分割后与响应参数匹配字段后返回
 * @param {any} list
 * @param {any} baseCode
 * @return {string}
 */
export function transcodingByRows(list: any[], baseCode: any, fieldData: FieldData) {
  const rows = replaceDescriptionByRows(list);
  const { labelField, propField, symbolField } = fieldData;
  if (typeof baseCode === 'string') {
    const splitReg = /(<el-table-column|<el-form-item)/;
    const splitCodes = baseCode.split(splitReg);
    const matchReg = new RegExp(`(?=.*${propField}${symbolField})(?=.*${labelField}${symbolField})`, 's');
    console.log('', matchReg);
    const baseCodeList = splitCodes.map((code) => {
      return {
        isMatch: matchReg.test(code),
        code: code,
      };
    });

    const newCodeList: string[] = baseCodeList.map((codeItem) => {
      if (codeItem.isMatch) {
        return matchCodeByName(codeItem.code, rows, { labelField, propField, symbolField });
      } else {
        return codeItem.code;
      }
    });
    return newCodeList.join('');
  }
  // 未匹配项原样输出
  return 'no transcoding';
}

export function transcoding(fieldData: FieldData, body: any, record?: any, api?: any, selectedData?: any) {
  let baseCode = selectedData?.baseCode || body?.baseCode || ''; // baseCode获取
  let rows = body?.requestSelectedData || record?.children || []; // 处理rows传入

  if (baseCode === '') {
    return 'no base code';
  } else if (rows?.length === 0) {
    return 'no rows';
  }

  let code = transcodingByRows(rows, baseCode, fieldData);
  return typeof code === 'string' ? code : prettyJSON(code);
}

const elTableOrFormTranscoding = (...argetment: [body: any, record?: any, api?: any, selectedData?: any]) => {
  return transcoding(
    {
      labelField: 'label',
      propField: 'prop',
      symbolField: '=',
    },
    ...argetment,
  );
};

export default elTableOrFormTranscoding;
