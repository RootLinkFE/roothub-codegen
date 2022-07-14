/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:00:58
 * @Description: 注册codegen方法，标明类型
 */

import generateApiDefineition from './generate-api-defineition';
import generateModelClass from './generate-model-class';
import generateTypeScriptType from './generate-typescript-type';

import generateAvueTableColumns from './generate-avue-table-columns';
import generateAvueTablePageCode from './generate-avue-table';

export const codeGenerateMethods = [
  {
    key: 'copy-api',
    label: '复制API',
    type: 'api',
    function: generateApiDefineition,
  },
  {
    key: 'model-class',
    label: '模型配置',
    type: 'model',
    function: generateModelClass,
  },
  {
    key: 'typescript-definitions',
    label: 'TypeScript 定义',
    type: 'model',
    function: generateTypeScriptType,
  },
  {
    key: 'avue-table-columns',
    label: 'avue-table-columns',
    type: 'model',
    function: generateAvueTableColumns,
  },
  {
    key: 'avue-table',
    label: 'avue-table',
    type: 'response',
    function: generateAvueTablePageCode,
  },
];
