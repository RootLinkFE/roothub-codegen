import getParameterObject from './getParameterObject';

export default function getResponseParams(api: any, resourceDetail: any) {
  if (!api.responses['200']) {
    return [];
  }
  return (
    getParameterObject(resourceDetail, api.responses['200']).children || []
  );
}
