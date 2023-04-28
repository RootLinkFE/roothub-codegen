/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateTableColumnsProps from './generate-table-columns-props';

export default function generateRhTablePageCode(
  selectedData: any,
  api: { api: string; description: string; summary: string },
) {
  let { responseSelectedData: body, transformTextRecord } = selectedData;

  if (transformTextRecord) {
    body = filterTransformArrayByRows(body, transformTextRecord);
  }
  const columnCode = generateTableColumnsProps(body, true);

  const componentName = getApiNameAsPageName(api.api);

  const columnCodeBlock = `
  const columns: any[] = ${columnCode}
  `;

  const getListBlock = `
    const getList =  useCallback(
      async (params) => {
        return fetch('${defaultSwaggerUrl}${api.api}', {
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
   * ${api.description ?? api.summary}
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
