/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-11-06 14:46:27
 * @Description: generateApiGroupObject - API组基础对象生成
 */
import { cleanParameterDescription } from '@/shared/utils';
import { pathsItem } from '@/shared/ts/api-interface';
import generateApiConstName from './generate-api-const-name';

// API组基础对象生成
export default function generateApiGroupObject(
  apiData: pathsItem & { requestParams: any; responseParams: any },
  prefix: string = '',
) {
  console.log('apiData', apiData);
  const { api, summary, method, requestParams, responseParams } = apiData;
  const apiName = generateApiConstName(apiData) || summary.replace(/\s+/g, '') || 'api';
  let apiPath = prefix + api;
  const apiStrReg = /\{([\d\D]*)\}/g;

  // 处理URL路径参数
  const matchPathId = apiStrReg.exec(api);
  if (matchPathId) {
    apiPath = apiPath.replace(apiStrReg, function (str) {
      return `$${str}`;
    });
  }

  let result = `// ${summary || '无描述'}\n`;
  result += `const ${apiName} = {`;
  result += `  url: \`${apiPath}\`,\n`;
  result += `  method: '${method}',\n`;

  // 递归处理带有children的项
  function processParams(item: any, indent = 2): string {
    let result = '';
    const spaces = ' '.repeat(indent);
    const { name, type, description, children, schema } = item;

    // 如果是对象或数组类型且有children
    if (schema && (schema.type === 'object' || schema.type === 'array') && children && children.length > 0) {
      result += `\n${spaces}${name || ''}: `;

      if (type.includes('[]')) {
        result += `${spaces}[{`;
      } else if (schema.type === 'object') {
        result += `${spaces}{`;
      }

      // 递归处理children
      children.forEach((child: any, childIdx: number) => {
        // if (child.type.includes('[]')) {
        //   result += `\n${spaces}  {`;
        //   result += processParams(child, indent + 2);
        //   result += `\n${spaces}  }`;
        // } else {
        result += processParams(child, indent + 2);
        // }
        result += childIdx < children.length - 1 ? ',' : '';
      });

      if (type.includes('[]')) {
        result += `\n${spaces}}]`;
      } else if (type === 'object') {
        result += `\n${spaces}}`;
      }
    } else if (name) {
      // 常规类型
      result += `\n${spaces}${name}: '', // ${type || typeof item} - ${cleanParameterDescription(description || '')}`;
    }

    return result;
  }

  // 请求参数
  if (requestParams && requestParams.length > 0) {
    result += '  requestParams: {';
    requestParams.forEach((param: any, index: number) => {
      result += processParams(param);
      result += index < requestParams.length - 1 ? ',' : '';
    });
    result += '  \n},';
  } else {
    result += '  requestParams: {},';
  }

  // 返回参数
  if (responseParams && responseParams.length > 0) {
    result += '  \nresponseParams: {';
    responseParams.forEach((param: any, index: number) => {
      const { name } = param;
      if (name === 'data') {
        result += processParams(param);
      }
    });
    result += '  \n}';
  } else {
    result += `   responseParams: {}`;
  }

  result += '\n};';
  return result;
}
