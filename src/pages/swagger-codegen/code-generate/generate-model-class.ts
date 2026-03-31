import { cleanParameterDescription, prettyCode } from '@/shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getFieldType(prop: any): string {
  const { type, format, $ref } = prop;
  if ($ref) {
    return 'FieldType.object';
  }
  if (type === 'string' && format === 'date-time') {
    return 'FieldType.dateTime';
  }
  return `FieldType.${FieldTypeMap[type] || prop.type}`;
}

export default function generateModelClass(definition: any) {
  const { properties, required = [], title, description } = definition;

  function processProperty(propKey: string, prop: any, indent = 2): string {
    const spaces = ' '.repeat(indent);
    let result = `${spaces}{ name: '${propKey}', label: '${cleanParameterDescription(
      prop.description || '',
    )}', type: ${getFieldType(prop)},`;

    if (required.includes(propKey)) {
      result += ` required: true,`;
    }

    if (prop.type === 'object' && prop.properties) {
      const nestedFields = Object.entries(prop.properties).map(([key, val]: [string, any]) =>
        processProperty(key, val, indent + 2),
      );
      result += `\n${spaces}  children: [\n${nestedFields.join(',\n')}\n${spaces}  ],`;
    } else if (prop.type === 'array' && prop.items) {
      if (prop.items.type === 'object' && prop.items.properties) {
        const nestedFields = Object.entries(prop.items.properties).map(([key, val]: [string, any]) =>
          processProperty(key, val, indent + 2),
        );
        result += `\n${spaces}  children: [\n${nestedFields.join(',\n')}\n${spaces}  ],`;
      }
    }

    result += ` }`;
    return result;
  }

  const fields = Object.entries(properties).map(([propKey, prop]: [string, any]) => processProperty(propKey, prop));

  return prettyCode(
    `
import { Model, FieldType } from '@rh/model';

/**
 * ${description || title}
 */
export class ${title} extends Model {
  constructor() {
    super({
      fields:[
        ${fields.join(',\n')}
      ]
    })
  }
}
  `,
  );
}
