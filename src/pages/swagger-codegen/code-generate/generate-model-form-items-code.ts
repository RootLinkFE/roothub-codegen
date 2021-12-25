import { cleanParameterDescription, prettyCode } from '../../../shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getFieldInputCode(prop: any): string {
  const { type, format, $ref, name, description, required } = prop;
  const descReg = /^#([^(#|ENUM)]+)(#|ENUM#)/g;
  const result = descReg.exec(description);

  const desc = result && result[1];

  if ($ref) {
    return `
      <ProFormSelect
        name={"${name}"}
        label={"${desc}"}
        required={${required}}
      />
    `;
  }
  if (type === 'string' && format === 'date-time') {
    return `
      <ProFormDatePicker
        name={"${name}"}
        label={"${desc}"}
        required={${required}}
      />
    `;
  }

  switch (type) {
    case 'integer':
      return `
        <ProFormDigit
          name={"${name}"}
          label={"${desc}"}
          required={${required}}
        />
      `;
    default:
      return `
        <ProFormText
          name={"${name}"}
          label={"${desc}"}
          required={${required}}
        />
      `;
  }
}

export default function generateModelFormItemsCode(rows: any[], api: any = {}) {
  return prettyCode(
    `
    /**
     * ${api.description} Form Items
     */
    import React from "react";
    const renderFormItems = () =>(<>${rows
      .map(
        (row) => `
        ${getFieldInputCode(row)}
      `,
      )
      .join('')}</>)`,
  );
}
