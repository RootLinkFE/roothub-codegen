/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-26 14:46:27
 * @Description: generateCodeGenObject
 */
import { cleanParameterDescription } from '@/shared/utils';

// 基础对象
export default function generateCodeGenObject(
  selectedData: any,
  apiData: { api: string; description: string; summary: string; children: any[] },
) {
  let body: any[] = Array.isArray(selectedData) ? selectedData : apiData?.children || [];

  function processParams(item: any, indent = 2): string {
    let result = '';
    const spaces = ' '.repeat(indent);
    const { name, type, description, children, schema } = item;

    if (schema && (schema.type === 'object' || schema.type === 'array') && children && children.length > 0) {
      result += `\n${spaces}${name || ''}: `;

      const isArray = (typeof type === 'string' && type.includes('[]')) || schema.type === 'array';

      if (isArray) {
        result += `[{`;
      } else if (schema.type === 'object') {
        result += `{`;
      }

      children.forEach((child: any, childIdx: number) => {
        result += processParams(child, indent + 2);
        result += childIdx < children.length - 1 ? ',' : '';
      });

      if (isArray) {
        result += `\n${spaces}}]`;
      } else if (schema.type === 'object') {
        result += `\n${spaces}}`;
      }
    } else if (name) {
      result += `\n${spaces}${name}: '', // ${description ? ' - ' + cleanParameterDescription(description) : ''}`;
    }

    return result;
  }

  let result = `{`;
  body.forEach((item: any, index: number) => {
    result += processParams(item);
    result += index < body.length - 1 ? ',' : '';
  });
  result += `\n}`;

  return result;
}
