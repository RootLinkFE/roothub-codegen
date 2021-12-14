import { cleanParameterDescription, prettyCode } from '../../../shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getFieldInputCode(prop: any): string {
  const { type, format, $ref, name, description, required } = prop;
  if ($ref) {
    return `
      <ProFormSelect
        name={"${name}"}
        label={"${description}"}
        required={${required}}
      />
    `;
  }
  if (type === 'string' && format === 'date-time') {
    return `
      <ProFormDatePicker
        name={"${name}"}
        label={"${description}"}
        required={${required}}
      />
    `;
  }

  switch (type) {
    case 'integer':
      return `
        <ProFormDigit
          name={"${name}"}
          label={"${description}"}
          required={${required}}
        />
      `;
    default:
      return `
        <ProFormText
          name={"${name}"}
          label={"${description}"}
          required={${required}}
        />
      `;
  }
}

export default function generateModelFormItemsCode(rows: any[]) {
  return prettyCode(
    `
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
