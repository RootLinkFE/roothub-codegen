/**
 * @description: generateTransformText 剔除非中文及英文, 及剔除表单的包含请输出、请输入字段
 * @return {string[] | string}
 */

export default function generateTransformTextToZhAndEn(values: any) {
  const reg = new RegExp(/[^a-zA-Z\u4e00-\u9fa5]/g);
  if (values instanceof Array) {
    values = values.map((v: any) => {
      return v.replace(reg, '');
    });

    let result = [];
    for (let i = 0; i < values.length; i++) {
      const text = values[i];
      if (!/[请输入|请选择]/.test(text)) {
        result.push(text);
      }
    }
    return result;
  }

  if (typeof values === 'string') {
    return values.replace(reg, '').split(',');
  }
  return values;
}
