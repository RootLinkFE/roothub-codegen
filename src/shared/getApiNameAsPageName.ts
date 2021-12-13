import { camelCase } from 'lodash';

export default function getApiNameAsPageName(apiPath: string) {
  const api = apiPath.replace(/\/api/, '');
  const camelCaseApiName = camelCase(api);
  return `${camelCaseApiName
    .substring(0, 1)
    .toUpperCase()}${camelCaseApiName.substring(1)}`;
}
