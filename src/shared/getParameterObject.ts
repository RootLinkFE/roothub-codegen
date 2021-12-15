function getSwaggerRef(obj: any) {
  return obj.schema?.$ref || obj.$ref || obj.items?.$ref;
}

export default function getParameterObject(
  resourceDetail: any,
  parameter: any,
  parent: string = '',
): any {
  const $ref = getSwaggerRef(parameter);
  let definition: any;
  let children;
  if ($ref && /#\/definitions\//.test($ref)) {
    const refKey = $ref.replace('#/definitions/', '');
    definition = resourceDetail.definitions?.[refKey];
    if (definition) {
      const { properties = {}, required } = definition;
      children = Object.entries(properties).map(
        ([propertyKey, property]: [string, any]) => {
          let result;
          const hasRef = getSwaggerRef(property);
          if (hasRef) {
            if (hasRef !== $ref) {
              result = {
                name: propertyKey,
                ...getParameterObject(
                  resourceDetail,
                  property,
                  `${parent}${propertyKey}#`,
                ),
              };
            } else {
              result = {
                name: propertyKey,
                type: refKey,
                description: definition.title,
              };
            }

            if (hasRef && property.type === 'array') {
              result.type = result.type + '[]';
            }
          } else {
            result = {
              name: propertyKey,
              ...property,
            };
          }
          result.key = parent + propertyKey;
          result.required = required?.includes(propertyKey) ?? false;
          return result;
        },
      );
    }
  }
  const result = { ...parameter, children, key: parent + parameter.name };
  if (definition) {
    result.description = definition.title;
    result.type = definition.title;
    result.schema = {
      ...definition,
    };
  }

  return result;
}
