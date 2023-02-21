/**
 * @description: generateTransformText 剔除非中文及英文
 * @return {string[] | string}
 */

export default function generateTransformTextToZhAndEn(values: any) {
  const reg = new RegExp(/[^a-zA-Z\u4e00-\u9fa5]/g);
  if (values instanceof Array) {
    values = values.map((v: any) => {
      return v.replace(reg, '');
    });
  }
  if (typeof values === 'string') {
    values = values.replace(reg, '').split(',');
  }
  return values;
}
