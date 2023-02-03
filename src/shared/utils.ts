/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
import { tagsItem, pathsItem } from '@/shared/ts/api-interface';
import getParameterObject from './getParameterObject';
import { isNil } from 'lodash';

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
  if (/\/doc.html$/.test(url)) {
    return url.slice(0, -9);
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
 * @param {any[]} rows
 * @param {string[]} transformArray
 * @return {any[]}
 */
export function filterTransformArrayByRows(rows: any[], transformArray: string[]) {
  const result: any = [];
  const nextArr: string[] = []; // transformArray未比对部分
  transformArray.forEach((text: string) => {
    const item = rows.find((v) => {
      return !isNil(v.description) && (v.description === text || v.description.indexOf(text) !== -1);
    });
    if (item) {
      result.push(item);
    } else {
      nextArr.push(text);
    }
  });
  nextArr.forEach((text: string) => {
    let item = filterStrRepeat(rows, text);
    if (item) {
      result.push(item);
    }
  });
  return result;
}

/**
 * @description: 根据str获取数组中description最相符项
 * @param {any} rows
 * @param {string} str
 * @return {*}
 */
function filterStrRepeat(rows: any[], str: string): any {
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
function strRepeat(preStr: string, nextStr: string): string {
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
