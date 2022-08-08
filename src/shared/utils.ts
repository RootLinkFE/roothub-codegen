/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
import { tagsItem, pathsItem } from '@/shared/ts/api-interface';
import getParameterObject from './getParameterObject';

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
