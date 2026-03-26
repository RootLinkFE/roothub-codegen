/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-11-06 14:46:27
 * @Description: generateApiGroupObject - API组基础对象生成
 */
import { cleanParameterDescription } from '@/shared/utils';
import { pathsItem } from '@/shared/ts/api-interface';
import generateApiConstName from './generate-api-const-name';

// API组基础对象生成
export default function generateApiGroupObject(apiData: any, prefix: any = '') {
  console.log('apiData', apiData);
  const requestParams = apiData?.requestSelectedData ?? apiData?.requestParams ?? [];
  const responseParams = apiData?.responseSelectedData ?? apiData?.responseParams ?? [];
  const api = typeof apiData?.api === 'string' ? apiData.api : '';
  const summary = typeof apiData?.summary === 'string' ? apiData.summary : '';
  const method = typeof apiData?.method === 'string' ? apiData.method : '';

  const apiName = generateApiConstName(apiData as pathsItem) || (summary ? summary.replace(/\s+/g, '') : '') || 'api';
  const prefixStr =
    typeof prefix === 'string'
      ? prefix
      : `${typeof apiData?.apiurlPrefix === 'string' ? apiData.apiurlPrefix : ''}${
          typeof apiData?.resourceDetail?.basePath === 'string' ? apiData.resourceDetail.basePath : ''
        }`;
  let apiPath = `${prefixStr}${api}`;
  const apiStrReg = /\{([\d\D]*)\}/g;

  // 处理URL路径参数
  const matchPathId = apiStrReg.exec(api || '');
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

      const isArray = (typeof type === 'string' && type.includes('[]')) || schema.type === 'array';

      if (isArray) {
        result += `[{`;
      } else if (schema.type === 'object') {
        result += `{`;
      }

      // 递归处理children
      children.forEach((child: any, childIdx: number) => {
        result += processParams(child, indent + 2);
        result += childIdx < children.length - 1 ? ',' : '';
      });

      if (isArray) {
        result += `\n${spaces}}]`;
      } else if (schema.type === 'object') {
        result += `\n${spaces}}`;
      }
    } else if (name) {
      // 常规类型
      const typeStr = typeof type === 'string' ? type : typeof item;
      result += `\n${spaces}${name}: '', // ${typeStr} - ${cleanParameterDescription(description || '')}`;
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
    const responseDataParam = responseParams.find((p: any) => p?.name === 'data');
    const responseParamsToProcess = responseDataParam ? [responseDataParam] : responseParams;
    result += '  \nresponseParams: {';
    responseParamsToProcess.forEach((param: any, index: number) => {
      result += processParams(param);
      result += index < responseParamsToProcess.length - 1 ? ',' : '';
    });
    result += '  \n}';
  } else {
    result += `   responseParams: {}`;
  }

  result += '\n};';
  return result;
}
