import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import { prettyCode } from '../utils';
import generateTableColumnsProps from './generate-table-columns-props';

export default function generateRhTablePageCode(
  body: any,
  api: { api: string; description: string },
) {
  const columnCode = generateTableColumnsProps(body);

  const componentName = getApiNameAsPageName(api.api);

  const columnCodeBlock = `
  const columns: any[] = ${columnCode}
  `;

  const getListBlock = `
    const getList =  useCallback(
      async (params) => {
        return fetch('${defaultSwaggerUrl}/${api.api}', {
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
   * ${api.description}
   */
    import React, { useCallback } from 'react';
     import { RhTable } from '@roothub/components';

      function ${componentName}Table() {

          ${columnCodeBlock}

          ${getListBlock}

          return (
            <>
            <RhTable columns={columns}  request={getList} />
            </>
          );
        }

      export default ${componentName}Table;`);
}
