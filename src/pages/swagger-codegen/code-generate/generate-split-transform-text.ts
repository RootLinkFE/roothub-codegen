/**
 * @description: generateSplitTransformText 分割剔除非中文及英文
 * @return {string[] | string}
 */

export default function generateSplitTransformTextToZhAndEn(values: any) {
  if (typeof values === 'string') {
    values = values.split(',');
  }
  if (values instanceof Array) {
    let result: string[] = [];
    values = values.forEach((v: any) => {
      const arr = v.split(/[^a-zA-Z\u4e00-\u9fa5]+/); // 非中英文
      result = [...result, ...arr];
    });
    return result.filter((item) => item !== '');
  }
  return values;
}
