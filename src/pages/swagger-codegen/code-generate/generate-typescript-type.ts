import { cleanParameterDescription, prettyCode } from '@/shared/utils';

const FieldTypeMap: Record<string, string> = {
  integer: 'number',
};

function getFieldType(prop: any): string {
  const { type, format, $ref } = prop;
  if ($ref) {
    return $ref.replace(/#\/definitions\//, '') + 'Result';
  }
  return FieldTypeMap[type] || prop.type;
}

export default function generateTypeScriptType(definition: any) {
  const { properties, required = [], title, description } = definition;
  const fields = Object.entries(properties).map(([propKey, prop]: [string, any]) => {
    /* let result = `{ name: '${propKey}', label: '${cleanParameterDescription(
        prop.description
      )}', type: ${getFieldType(prop)},`;
      if (required.includes(propKey)) {
        result += ` required:true,`;
      }
      result += " }"; */
    let result = `
      /**
       * ${cleanParameterDescription(prop.description ?? prop.summary)}
       */
      ${propKey}: ${getFieldType(prop)};`;
    return result;
  });

  return prettyCode(
    `
/**
 * ${description}
 */
interface ${title}Result {
  ${fields.join('')}
}
  `,
  );
}
