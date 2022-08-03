/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
function getSwaggerRef(obj: any) {
  return obj.schema?.$ref || obj.$ref || obj.items?.$ref || obj.schema?.items?.$ref || obj?.originalRef;
}

export default function getParameterObject(resourceDetail: any, parameter: any, parent: string = ''): any {
  const $ref = getSwaggerRef(parameter);
  let definition: any;
  let children;
  if ($ref) {
    let refKey = $ref; // originalRef 可直接获取
    if (/#\/definitions\//.test($ref)) {
      refKey = $ref.replace('#/definitions/', '');
    }
    definition = resourceDetail.definitions?.[refKey];
    if (definition) {
      const { properties = {}, required } = definition;
      children = Object.entries(properties).map(([propertyKey, property]: [string, any]) => {
        let result;
        const hasRef = getSwaggerRef(property);
        if (hasRef) {
          if (hasRef !== $ref) {
            result = {
              name: propertyKey,
              ...getParameterObject(resourceDetail, property, `${parent}${propertyKey}#`),
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
      });
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
