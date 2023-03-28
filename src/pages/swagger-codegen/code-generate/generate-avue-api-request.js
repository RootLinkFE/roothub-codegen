/**
 * avue-api-request
 */
function generateApiDefineition(apiData, prefix) {
  const { api, summary, method, parameters } = apiData;
  const utilsFn = window.utilsFn ?? {};

  const apiMatch = api.match(/[a-zA-Z0-9]*$/);
  // window.lodash
  const name = apiMatch && apiMatch.length > 0 ? lodash.camelCase(`${method} ${apiMatch[0]}`) : lodash.camelCase(api);
  let apiParams = 'params';
  let apiPath = prefix + api;
  const apiStrReg = /\{([\d\D]*)\}/g;
  let argumentsData = ['params'];
  let inBody = false;
  let inQuery = false;
  (parameters || []).forEach((v) => {
    if (v.in === 'body') {
      inBody = true;
    } else if (v.in === 'query') {
      inQuery = true;
    }
  });
  // 处理接口传参格式
  if (inBody && inQuery) {
    argumentsData.push('data');
    apiParams = `params,
    data: data`;
  } else if (inQuery) {
    apiParams = 'params';
  } else if (inBody || method === 'post') {
    apiParams = 'data: params';
  }

  let packTableData = '';
  if (/[page|list]$/.test(api)) {
    packTableData = '.then(packTableData)';
  }

  const matchPathId = apiStrReg.exec(api);
  if (matchPathId) {
    argumentsData.unshift(matchPathId[1]);
    apiPath = apiPath.replace(apiStrReg, function (str) {
      return `$${str}`;
    });
  }
  const notes = utilsFn.generateApiNotes(apiData);

  return `${notes}
  export const ${name || 'fetch'} = (${argumentsData.join(', ')}) => {
    return request(
      {
        url: ${'`'}${apiPath}${'`'},
        method: '${method}',
        ${apiParams}
      }
    ).then(responseHandle)${packTableData};
  };
    `;
}
