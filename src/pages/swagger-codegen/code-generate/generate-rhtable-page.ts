/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:generate-rhtable-page
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateTableColumnsProps from './generate-table-columns-props';
import state from '@/stores/index';

export default function generateRhTablePageCode(
  selectedData: any,
  apiData: { api: string; description: string; summary: string; children: any[] },
) {
  let body: any[] = Array.isArray(selectedData) ? selectedData : apiData?.children || [];

  const { urlValue } = state.swagger;
  const { apiurlPrefixList } = state.settings.Settings;
  const prefix = apiurlPrefixList.find((v) => v.status && v.url === urlValue)?.prefix || '';
  if (selectedData.transformTextRecord) {
    body = filterTransformArrayByRows(body, selectedData.transformTextRecord);
  }
  const columnCode = generateTableColumnsProps(body, true);

  const componentName = apiData.api ? getApiNameAsPageName(apiData.api) : 'get';

  const columnCodeBlock = `
  const columns: any[] = ${columnCode}
  `;

  const getListBlock = `
    const getList =  useCallback(
      async (params) => {
        return fetch('${urlValue + prefix}${apiData.api ?? ''}', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        })
        .then(response => response.json())
      },
      [],
    )
  `;

  return prettyCode(`
  /**
   * ${apiData.description ?? apiData.summary}
   */
    import React, { useCallback } from 'react';
     import { RhTable } from '@roothub/components';

      function ${componentName}Table() {

          ${columnCodeBlock}

          ${getListBlock}

          return (
            <RhTable columns={columns}  request={getList} />
          );
        }

      export default ${componentName}Table;`);
}
