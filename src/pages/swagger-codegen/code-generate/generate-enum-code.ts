import { prettyCode } from '../../../shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getEnumCode(prop: any): string {
  const { name, description } = prop;
  const enumStrReg = /([^ENUM]+)ENUM#(.+)#$/g;
  const result = enumStrReg.exec(description);

  const nameStr = result && result[1] && result[1].replace(/#/g, '');
  const enumStr = result && result[2];
  const obj: Record<string, any> = {};
  if (enumStr) {
    const enumReg = /\d:([^:]+):([^:,;]+)/g;
    let match;
    while ((match = enumReg.exec(enumStr)) !== null) {
      obj[match[2]] = match[1];
    }
  }
  return `
    // ${nameStr}
    const ${name} = ${JSON.stringify(obj, null)}
  `;
}

export default function generateEnumCode(rows: any[], api: any = {}) {
  return prettyCode(
    `
    ${rows
      .map(
        (row) => `
        ${getEnumCode(row)}
      `,
      )
      .join('')}`,
  );
}
