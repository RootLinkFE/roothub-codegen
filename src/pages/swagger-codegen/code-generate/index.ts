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
import generateAvueFormColumns from './generate-avue-form-columns';
import generateAvueFormCode from './generate-avue-form';

export const codeGenerateMethods = [
  {
    key: 'copy-api',
    label: '复制API',
    type: 'api',
    source: 'root',
    language: 'typescript',
    function: generateApiDefineition,
  },
  {
    key: 'model-class',
    label: '模型配置',
    type: 'model',
    source: 'root',
    language: 'typescript',
    function: generateModelClass,
  },
  {
    key: 'typescript-definitions',
    label: 'TypeScript 定义',
    type: 'model',
    source: 'root',
    language: 'typescript',
    function: generateTypeScriptType,
  },
  {
    key: 'avue-table-columns',
    label: 'avue-table-columns',
    type: 'model',
    source: 'root',
    language: 'vue',
    function: generateAvueTableColumns,
  },
  {
    key: 'avue-table',
    label: 'avue-table',
    type: 'response',
    source: 'root',
    language: 'vue',
    function: generateAvueTablePageCode,
  },
  {
    key: 'avue-form',
    label: 'avue-form',
    type: 'model',
    source: 'root',
    language: 'vue',
    function: generateAvueFormColumns,
  },
  {
    key: 'avue-form',
    label: 'avue-form',
    type: 'request',
    source: 'root',
    language: 'vue',
    function: generateAvueFormCode,
  },
];
