import { cleanParameterDescription, prettyCode, prettyJSON } from '../utils';

export default function generateTableColumnsProps(rows: any[]) {
  return prettyJSON(
    rows.map((row) => {
      return {
        dataIndex: row.name,
        title: cleanParameterDescription(row.description),
        hideInSearch: true,
      };
    }),
  );
}
