import { prettyCode } from '../../../shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getEnumCode(prop: any): string {
  const { type, format, $ref, name, description, required } = prop;
  const enumStrReg = /ENUM#(.+)#$/g;
  const result = enumStrReg.exec(description);

  const enumStr = result && result[1];
  const obj: Record<string, any> = {};
  if (enumStr) {
    const enumReg = /\d:([^:]+):([^:,;]+)/g;
    let match;
    while ((match = enumReg.exec(enumStr)) !== null) {
      obj[match[1]] = match[2];
    }
  }
  return `const ${name} = ${JSON.stringify(obj, null)}`;
}

export default function generateEnumCode(rows: any[], api: any = {}) {
  return prettyCode(
    `
    /**
     * ${api.description} 枚举
     */
    ${rows
      .map(
        (row) => `
        ${getEnumCode(row)}
      `,
      )
      .join('')}`,
  );
}
