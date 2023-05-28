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
  const columns: any[] = [];
  let body: any[] = Array.isArray(selectedData) ? selectedData : apiData?.children || [];

  body.map((row) => {
    columns.push(`${row.name}: '', ${row.description ? '// ' + cleanParameterDescription(row.description) : ''}`);
  });
  return `{
  ${columns.reduce((a, b) => a + '\n  ' + b)}
}`;
}
