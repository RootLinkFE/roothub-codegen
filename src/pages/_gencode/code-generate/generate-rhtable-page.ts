import { prettyCode } from '../utils';

export default function generateRhTablePageCode(rows: any[]) {
  return prettyCode(
    `import React from 'react';

      function RhTable() {
        return (
          <h3>
            RhTable
          </h3>
        );
      }

      export default RhTable;`,
  );
}
