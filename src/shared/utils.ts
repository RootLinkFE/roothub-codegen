/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
import getParameterObject from './getParameterObject';
import { isNil, uniqueId, camelCase } from 'lodash';

export function cleanParameterDescription(s: string) {
  let s1 = cleanEnumDesc(s);
  s1 = cleanREF(s1);
  return s1.replace(/([\.@#*+?^=!:${}()|\[\]\/\\])/g, '');
}

function cleanEnumDesc(s: string) {
  if (!s) {
    return '';
  }
  const idx = s.indexOf('ENUM#');
  if (idx !== -1) {
    return s.substring(0, idx);
  }
  return s;
}

function cleanREF(s: string) {
  const idx = s.indexOf('REF#');
  if (idx !== -1) {
    return s.substring(0, idx);
  }
  return s;
}

export function prettyCode(code: string) {
  const prettier = require('prettier/esm/standalone').default;
  const parserBabel = require('prettier/esm/parser-babel').default;
  try {
    return prettier.format(code, {
      parser: 'babel',
      plugins: [parserBabel],
    });
  } catch (err) {
    console.error(err);
    return code;
  }
}

export function prettyJSON(json: object) {
  return JSON.stringify(json, null, 2);
}

export function formatUrlChar(url: string) {
  const match = url.match(/\/doc.html/);
  if (match) {
    return url.substr(0, match.index);
  } else {
    return url.lastIndexOf('/') === url.length - 1 ? url.slice(0, -1) : url;
  }
}

// 将tags与paths关联
export function classifyPathsToTags(tags: any[], pathObj: object) {
  const tagMap = new Map();
  tags.forEach((tag) => {
    tagMap.set(tag.name, tag);
  });
  Object.entries(pathObj).forEach(([api, apiDetail]) => {
    Object.entries(apiDetail).forEach(([method, methodDetail]: [string, any]) => {
      // console.log(api, method, methodDetail)
      methodDetail.tags.forEach((tagKey: string) => {
        const tag = tagMap.get(tagKey);
        tag.paths = tag.paths || [];
        methodDetail.api = api;
        methodDetail.method = method;
        methodDetail.methodUpper = method.toLocaleUpperCase();
        methodDetail.uuid = method + '$' + api; // 添加唯一key
        tag.paths.push(methodDetail);
      });
    });
  });
}

/**
 * @description: text 模糊匹配数组项
 * @param {string} text
 * @param {string[]} arr
 * @return {boolean}
 */
export const indexOfArray = (text: string, arr: string[]) => {
  for (let i = 0; i < arr.length; i++) {
    if (text?.indexOf(arr[i]) !== -1) {
      return true;
    }
  }
  return false;
};

/**
 * @description: 字符串函数转换成js函数
 * @param {string} val
 * @return {*}
 */
export const getStringToFn = (val: string) => {
  return Function('"use strict";return (' + val + ')')();
};

/**
 * @description: 扁平化子数组
 * @param {any} list
 * @param {any} result
 * @param {string} type
 * @return {*}
 */
export function flatChildren(list: any, result: any = [], type: string = 'children') {
  list.forEach((item: any) => {
    result.push(item);
    if (item[type]) {
      flatChildren(item[type], result);
    }
  });
  return result;
}

export function getHeaderParams(api: any) {
  if (api.parameters?.length > 0) {
    return api.parameters?.filter((parameter: any) => {
      return parameter.in === 'header';
    });
  }
  return [];
}

export function getRequestParams(api: any, resourceDetail: any) {
  if (api.parameters?.length > 0) {
    return api.parameters
      .filter((parameter: any) => {
        return parameter.in !== 'header';
      })
      .map((parameter: any) => {
        return getParameterObject(resourceDetail, parameter);
      });
  }
  return [];
}

/**
 * @description: 导出json文件
 * @param {any} data
 * @param {string} filename
 * @return {*}
 */
export function dataSaveToJSON(data: any, filename: string = 'openapi') {
  if (!data) {
    console.error('保存的数据为空');
    return false;
  }
  if (typeof data === 'object') {
    data = JSON.stringify(data, undefined, 2);
  }
  const blob = new Blob([data], { type: 'text/json' }),
    e = document.createEvent('MouseEvents'),
    a = document.createElement('a');
  a.download = `${filename}.json`;
  a.href = window.URL.createObjectURL(blob);
  a.dataset.downloadurl = ['text/json', a.download, a.href].join(':');
  e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  a.dispatchEvent(e);
}

/**
 * @description: 对比两个数组，获取rows中description的与transformArray相近内容，返回数组
 * @param {any[]} list
 * @param {string[]} transformArray
 * @return {any[]}
 */
export function filterTransformArrayByRows(list: any[], transformArray: string[]) {
  const rows = replaceDescriptionByRows(list);
  const result: any = [];
  const resultArr: any[] = [];
  resultArr.length = transformArray.length;
  const nextArr: { i: number; text: string }[] = []; // transformArray未比对部分
  transformArray.forEach((text: string, i: number) => {
    const item = rows.find((v) => {
      return !isNil(v.description) && (v.description === text || v.description.indexOf(text) !== -1);
    });
    if (item) {
      resultArr[i] = item;
    } else {
      nextArr.push({ i, text });
    }
  });
  nextArr.forEach((m: { i: number; text: string }) => {
    let item = filterStrRepeat(rows, m.text);
    if (item) {
      resultArr[m.i] = item;
    }
  });

  resultArr.forEach((m: any) => {
    m && result.push(m);
  });
  return result;
}

/**
 * @description: 根据str获取数组中description最相符项
 * @param {any} rows
 * @param {string} str
 * @return {*}
 */
export function filterStrRepeat(rows: any[], str: string): any {
  let repeatTextArr: any = [];
  rows.forEach((m: any) => {
    if (!isNil(m.description)) {
      let repeatText = strRepeat(str, m.description);
      if (repeatText !== '') {
        repeatTextArr.push({
          text: repeatText,
          item: m,
        });
      }
    }
  });
  let result = null;
  let max = 0;
  repeatTextArr.forEach((m: any) => {
    // 以匹配字符长度最多为最相符
    if (m.text.length > max) {
      max = m.text.length;
      result = m.item;
    }
  });
  return result;
}

/**
 * @description: 获取两个字符串重合部分
 * @param {string} preStr
 * @param {string} nextStr
 * @return {string}
 */
export function strRepeat(preStr: string, nextStr: string): string {
  let repeat = '';
  let nextIdx = 0;
  for (var i = 0; i < preStr.length; i++) {
    for (let j = nextIdx; j < nextStr.length; j++) {
      // 重复
      if (preStr[i] === nextStr[j]) {
        repeat += nextStr[j];
        nextIdx = j; // 已比较位置不再次对比
      }
    }
  }
  return repeat;
}

/**
 * @description: description集中处理#
 * @param {any} rows
 * @return {any}rows
 */
export const replaceDescriptionByRows = (rows: any[]) => {
  return rows.map((row) => {
    return {
      ...row,
      description: row.description ? row.description?.replace(/#/g, '') : '',
    };
  });
};

/**
 * @description: 原始代码与响应参数匹配字段后返回
 * @param {any} list
 * @param {any} baseCode
 * @return {string}
 */
export function filterBaseCodeByRows(list: any[], baseCode: any) {
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

/**
 * @description: 字符串匹配替换；寻找出代码字符串中的label值，并与
 * @param {string} codeStr
 * @param {any} rows
 * @param {Object} fieldData
 * @return {string}
 */
export const matchCodeByName = (
  codeStr: string,
  rows: any,
  fieldData?: { propField?: string; labelField?: string },
) => {
  const { propField = 'prop', labelField = 'label' } = fieldData ?? {};
  // 提取label的值
  const labelReg = new RegExp(`${labelField}:\\s*['"](.+?)['"]`);
  const labelMatch = codeStr.match(labelReg);
  let labelText = '';
  if (!labelMatch) {
    return codeStr;
  } else {
    labelText = labelMatch[1];
  }
  for (let i = 0; i < rows.length; i++) {
    const item = rows[i];
    if (item.description === labelText) {
      // 相等匹配，替换返回
      return replacePropValue(codeStr, item.name, propField);
    }
  }
  let item = filterStrRepeat(rows, labelText);
  if (item) {
    // 非等量匹配下，找到与label匹配的子项，替换返回
    return replacePropValue(codeStr, item.name, propField);
  }
  return codeStr;
};

/**
 * @description: 将value与代码中的prop值替换并返回
 * @param {string} codeStr
 * @param {string} value
 * @return {string}
 */
export function replacePropValue(codeStr: string, value: string, propField?: string) {
  // 匹配prop的值并替换
  const propReg = new RegExp(`(${propField ?? 'prop'}:\\s*['"])(.+?)(['"])`);
  const propMatch = codeStr.match(propReg);
  if (!propMatch) {
    return codeStr;
  }
  return codeStr.replace(propReg, `$1${value}$3`);
}

/**
 * @description: 包含汉字
 * @param {tring} s
 * @return {boolean}
 */
export function isChinese(s: string) {
  let reg = new RegExp('[\\u4E00-\\u9FFF]+', 'g');
  return reg.test(s);
}

/**
 * @description: 文件流转base64
 * @param {any} file
 * @return {*}
 */
export function filetoBase64(file: any) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader(); // 实例化文件读取对象
    reader.readAsDataURL(file); // 将文件读取为 DataURL,也就是base64编码
    reader.onload = (e: any) => {
      //文件读取成功完成时触发
      let result: string = e.target.result;
      // 获得文件读取成功后的DataURL,也就是base64编码
      if (result) {
        resolve(result);
      } else {
        reject(result);
      }
    };
  });
}

/**
 * @description: 如果图片宽度过大则切割图片
 * @param {any} file
 * @return {Promise} resolve - Base64图片数组
 */
export const splitImageToBase64 = function (file: any) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader(); // 实例化文件读取对象
    reader.readAsDataURL(file);
    reader.onload = function (e: any) {
      let oImg: any = new Image();
      const imgResult = e.target.result;
      oImg.src = imgResult;
      document.body.appendChild(oImg);
      // 会受到当前浏览器样式影响
      oImg.onload = function () {
        let imgWidth = oImg.offsetWidth;
        let imgHeight = oImg.offsetHeight;
        const splitWidth = 1300;
        if (imgWidth > splitWidth) {
          // 分割图片
          let splitCount = Math.ceil(imgWidth / splitWidth);
          let canvas = document.createElement('canvas');
          canvas.width = splitWidth;
          canvas.height = imgHeight;
          let ctx: any = canvas.getContext('2d');
          let imgDataArr = [];
          for (let i = 0; i < splitCount; i++) {
            let x = i * splitWidth;
            let y = 0;
            let w = i === splitCount - 1 ? imgWidth - x : splitWidth;
            if (w < 10) {
              // 边界宽度不解析
              continue;
            }
            let h = imgHeight;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(oImg, x, y, w, h, 0, 0, w, h);
            let imageDataURL = canvas.toDataURL(); // 返回base64
            imgDataArr.push(imageDataURL);
          }
          resolve(imgDataArr);
          console.log('imgDataArr', imgDataArr);
          document.body.removeChild(oImg);
        } else {
          resolve([imgResult]);
        }
      };
    };
  });
};

/**
 * @description: 重置HistoryTexts，增加id
 * @param {any} list
 * @return {} array
 */
export const filterHasIdByHistoryTexts = function (list: any) {
  return list.map((k: any) => {
    if (k instanceof Object && k.hasOwnProperty('id')) {
      return k;
    } else {
      return {
        id: uniqueId('history_text_'),
        content: k,
      };
    }
  });
};

export const filterSplitText = function (value: any) {
  if (Object.prototype.toString.call(value) === '[object Array]') {
    return value.map((v: any) => {
      return v.words;
    });
  } else {
    const isT = /\t/g.test(value);
    const replaceEndReg = new RegExp(`${isT ? '\t' : ''}\r\n$`);
    const replaceReg = new RegExp(`${isT ? '\r' : ''}\n`, 'g');
    const splitReg = new RegExp(isT ? '\t' : '\r');
    return value.replace(replaceEndReg, '').replace(replaceReg, '').split(splitReg);
  }
};

/**
 * @description: 判断是否OCRapi的文本处理成百度ocr返回格式
 * @param {string} value
 * @return {Array}
 */
export const filterSplitTextTowords = function (value: string | any[]) {
  if (Object.prototype.toString.call(value) === '[object String]') {
    return filterSplitText(value).map((v: string) => {
      return {
        words: v,
      };
    });
  } else {
    return value;
  }
};

type TransResult = {
  src: string;
  dst: string;
};
/**
 * @description: 百度翻译结果处理为Map
 * @param {TransResult} trans_result
 * @return {Map}
 */
export const filterTransResult = function (trans_result: TransResult[]) {
  const result = new Map();
  trans_result.forEach((item: any) => {
    result.set(item.src, camelCase(item.dst));
  });
  return result;
};
