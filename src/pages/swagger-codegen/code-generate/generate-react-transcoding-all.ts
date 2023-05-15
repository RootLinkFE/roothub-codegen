/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-15 09:17:07
 * @Description: generate-rhtable-page-transcoding-all
 */
import {
  replaceDescriptionByRows,
  getReplacePropKey,
  getMatchRowsName,
  matchCodeReplace,
  prettyJSON,
} from '@/shared/utils';

type FieldData = {
  labelField: string;
  propField: string;
};

/**
 * @description: avueColums的代码匹配后全代码替换
 * @param {any} list
 * @param {any} baseCode
 * @return {string}
 */
export function transcodingByRows(list: any[], baseCode: any, fieldData: FieldData) {
  const rows = replaceDescriptionByRows(list);
  const { labelField, propField } = fieldData;
  let resultCode = baseCode;
  if (typeof baseCode === 'string') {
    const splitReg = '},';
    const splitCodes = baseCode.split(splitReg);
    const matchReg = new RegExp(`(?=.*${propField}:)(?=.*${labelField}:)`, 's');
    const matchList = splitCodes.map((code) => {
      const isMatch = matchReg.test(code);
      return {
        isMatch,
        replaceKey: isMatch ? getReplacePropKey(code, propField) : null,
        replaceName: isMatch ? getMatchRowsName(code, rows, labelField) : null,
      };
    });
    matchList.map((item) => {
      if (item.isMatch && item.replaceKey !== null && item.replaceName !== null) {
        resultCode = matchCodeReplace(resultCode, item.replaceKey, item.replaceName);
      }
    });
  }
  return resultCode;
}

export function transcodingAll(fieldData: FieldData, body: any, record?: any, api?: any, selectedData?: any) {
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

const generatAvueTranscodeAll = (...argetment: [body: any, record?: any, api?: any, selectedData?: any]) => {
  return transcodingAll(
    {
      labelField: 'dataIndex',
      propField: 'title',
    },
    ...argetment,
  );
};

export default generatAvueTranscodeAll;
