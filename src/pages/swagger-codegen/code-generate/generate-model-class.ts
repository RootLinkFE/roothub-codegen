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
  const fields = Object.entries(properties).map(([propKey, prop]: [string, any]) => {
    let result = `{ name: '${propKey}', label: '${cleanParameterDescription(prop.description)}', type: ${getFieldType(
      prop,
    )},`;
    if (required.includes(propKey)) {
      result += ` required:true,`;
    }
    result += ' }';
    return result;
  });

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
