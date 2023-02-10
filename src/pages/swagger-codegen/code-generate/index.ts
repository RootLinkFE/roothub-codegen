/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:00:58
 * @Description: 注册codegen方法，标明类型
 */

import generateApiDefineition from './generate-api-defineition';
import generateModelClass from './generate-model-class';
import generateTypeScriptType from './generate-typescript-type';
import generateRhTablePageCode from './generate-rhtable-page';
import generateAvueProTablePageCode from './generate-avue-pro-table';

import generateAvueTableColumns from './generate-avue-table-columns';
import generateAvueTablePageCode from './generate-avue-table';
import generateAvueFormColumns from './generate-avue-form-columns';
import generateAvueFormCode from './generate-avue-form';

import generateTableColumnsProps from './generate-table-columns-props';
import generateModelFormItemsCode from './generate-model-form-items-code';
import { generateEnumCode } from './generate-enum-code';

import {
  textCodeGenList,
  textCodeGenOptions,
  textCodeGenAvueColumns,
  textCodeGenReactTable,
} from './generate-text-code-gen';

import generateExtractBaiduOcrapi from './generate-extract-baidu-ocrapi';

export const codeGenerateMethods = [
  {
    key: 'copy-api',
    label: '复制API',
    type: 'api',
    source: 'root',
    status: 1,
    sort: 96,
    language: 'typescript',
    function: generateApiDefineition,
  },
  {
    key: 'options',
    label: 'options',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 97,
    language: 'typescript',
    function: textCodeGenOptions,
  },
  {
    key: 'AvueColumns',
    label: 'AvueColumns',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 98,
    language: 'typescript',
    function: textCodeGenAvueColumns,
  },
  {
    key: 'ReactTable',
    label: 'ReactTable',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 99,
    language: 'typescript',
    function: textCodeGenReactTable,
  },
  {
    key: 'list',
    label: 'list',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 100,
    language: 'typescript',
    function: textCodeGenList,
  },
  {
    key: 'ExtractBaiduOcrapi',
    label: 'ExtractBaiduOcrapi', // 百度通用文字识别
    type: 'extract',
    source: 'root',
    status: 1,
    sort: 98,
    language: 'typescript',
    function: generateExtractBaiduOcrapi,
  },
  {
    key: 'model-class',
    label: '模型配置',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 96,
    language: 'typescript',
    function: generateModelClass,
  },
  {
    key: 'typescript-definitions',
    label: 'TypeScript 定义',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 96,
    language: 'typescript',
    function: generateTypeScriptType,
  },
  {
    key: 'RhTablePage',
    label: 'RhTablePage 定义',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 96,
    language: 'typescript',
    function: generateRhTablePageCode,
  },
  {
    key: 'avue-table-columns',
    label: 'avue-table-columns',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 95,
    language: 'vue',
    function: generateAvueTableColumns,
  },
  {
    key: 'avue-table',
    label: 'avue-table',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 95,
    language: 'vue',
    function: generateAvueTablePageCode,
  },
  {
    key: 'avue-pro-table',
    label: 'avue-pro-table',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 94,
    language: 'vue',
    function: generateAvueProTablePageCode,
  },
  // {
  //   key: 'avue-form-model',
  //   label: 'avue-form',
  //   type: 'model',
  //   source: 'root',
  //   status: 1,
  //   sort: 94,
  //   language: 'vue',
  //   function: generateAvueFormColumns,
  // },
  {
    key: 'avue-form-request',
    label: 'avue-form',
    type: 'request',
    source: 'root',
    status: 1,
    sort: 94,
    language: 'vue',
    function: generateAvueFormCode,
  },
  {
    key: 'react-table-columns',
    label: '生成 ReactTable 列配置',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 93,
    language: 'javascript',
    function: generateTableColumnsProps,
  },
  {
    key: 'react-form',
    label: '生成 ReactForm 配置',
    type: 'request',
    source: 'root',
    status: 1,
    sort: 93,
    language: 'javascript',
    function: generateModelFormItemsCode,
  },
  {
    key: 'generate-request-enum-code',
    label: '生成枚举',
    type: 'request',
    source: 'root',
    status: 1,
    sort: 92,
    language: 'javascript',
    function: generateEnumCode,
  },
  {
    key: 'generate-response-enum-code',
    label: '生成枚举',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 92,
    language: 'javascript',
    function: generateEnumCode,
  },
];
