/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 14:00:58
 * @Description: 注册codegen方法，标明类型
 */

import generateApiDefineition from './generate-api-defineition';
import generateModelClass from './generate-model-class';
import generateTypeScriptType from './generate-typescript-type';
import generateRhTablePageCode from './generate-rhtable-page';
import generateRhTablePageTranscoding from './generate-rhtable-page-transcoding';
import generateReactAntdPageTranscodingAll from './generate-react-antd-page-transcoding-all';
import generateAvueProTablePageCode from './avue/generate-avue-pro-table';

import generateAvueTableColumns from './avue/generate-avue-table-columns';
import generateAvueTablePageCode from './avue/generate-avue-table';
import generateAvueFormColumns from './avue/generate-avue-form-columns';
import generateAvueFormCode from './avue/generate-avue-form';
import generatAvueColumnsTranscoding from './avue/generate-avue-columns-transcoding';
import generatAvueTranscodeAll from './avue/generate-avue-transcode-all';
import generateElTableOrFromTranscoding from './generate-element-table-form-transcoding';

import generateTableColumnsProps from './generate-table-columns-props';
import generateModelFormItemsCode from './generate-model-form-items-code';
import { generateEnumCode } from './generate-enum-code';

import {
  textCodeGenObject,
  textCodeGenList,
  textCodeGenOptions,
  textCodeGenAvueColumns,
  textCodeGenReactTable,
  textCodeGenAvueFormColumns,
  textCodeGenElementTable,
  textCodeGenAvueSearchColumns,
  textCodeGenElementFrom,
  textCodeGenAntdFrom,
} from './generate-text-code-gen';

import generateExtractBaiduOcrapi from './generate-extract-baidu-ocrapi';

import generateTransformTextToZhAndEn from './generate-transform-text';
import generateSplitTransformTextToZhAndEn from './generate-split-transform-text';
import generateTransformTextByForm from './generate-transform-text-by-form';

export type CodeGenerateOption = {
  key: string;
  label: string;
  type: string;
  source: string;
  status: number;
  sort: number;
  language: string;
  function: any; // funciton
};

// 代码匹配Options
export const trancodingOptions: CodeGenerateOption[] = [
  {
    key: 'avue-table-columns-transcoding',
    label: 'avue-table-columns-代码匹配',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 95,
    language: 'vue',
    function: generatAvueColumnsTranscoding,
  },
  {
    key: 'generate-avue-transcode-all',
    label: 'avue代码匹配全替换',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 94,
    language: 'vue',
    function: generatAvueTranscodeAll,
  },
  {
    key: 'el-table-from-transcoding',
    label: 'element-table-from-代码匹配',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 94,
    language: 'vue',
    function: generateElTableOrFromTranscoding,
  },
  {
    key: 'RhTablePageTranscoding',
    label: 'RhTablePage代码匹配',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: generateRhTablePageTranscoding,
  },
  {
    key: 'generate-react-transcoding-all',
    label: 'ReactPage代码匹配全替换',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: generateReactAntdPageTranscodingAll,
  },
];

// 代码生成方法Options
export const codeGenerateMethods = [
  ...trancodingOptions,
  ...trancodingOptions.map((v) => ({
    ...v,
    type: 'response',
  })),
  {
    key: 'fetch-api',
    label: 'fetch-api',
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
    sort: 101,
    language: 'typescript',
    function: textCodeGenOptions,
  },
  {
    key: 'textCodeGenObject',
    label: 'object',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 100,
    language: 'typescript',
    function: textCodeGenObject,
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
    key: 'AntdFrom',
    label: 'AntdFrom',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 86,
    language: 'typescript',
    function: textCodeGenAntdFrom,
  },
  {
    key: 'AvueFormColumns',
    label: 'AvueFormColumns',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 97,
    language: 'typescript',
    function: textCodeGenAvueFormColumns,
  },
  {
    key: 'AvueSearchColumns',
    label: 'AvueSearchColumns',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 95,
    language: 'typescript',
    function: textCodeGenAvueSearchColumns,
  },
  {
    key: 'ElementTable',
    label: 'ElementTable',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: textCodeGenElementTable,
  },
  {
    key: 'ElementFrom',
    label: 'ElementFrom',
    type: 'text',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: textCodeGenElementFrom,
  },
  {
    key: 'ExtractBaiduOcrapi',
    label: '百度高精度文字识别', // 百度通用文字识别
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
    key: 'avue-table-columns',
    label: 'avue-table-columns',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 96,
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
  {
    key: 'avue-form-columns',
    label: 'avue-form-columns',
    type: 'request',
    source: 'root',
    status: 1,
    sort: 94,
    language: 'vue',
    function: generateAvueFormColumns,
  },
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
    key: 'RhTablePage',
    label: 'RhTablePage 定义',
    type: 'response',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: generateRhTablePageCode,
  },

  {
    key: 'RhTablePage',
    label: 'RhTablePage 定义',
    type: 'model',
    source: 'root',
    status: 1,
    sort: 76,
    language: 'typescript',
    function: generateRhTablePageCode,
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

// 文本过滤Options
export const orderCodeGenerateMethods = [
  {
    key: 'generate-transform-text-zh-en',
    label: '过滤输出中英文',
    type: 'transform',
    source: 'root',
    status: 1,
    sort: 92,
    language: 'javascript',
    function: generateTransformTextToZhAndEn,
  },
  {
    key: 'generate-split-transform-text-zh-en',
    label: '分割过滤输出中英文',
    type: 'transform',
    source: 'root',
    status: 1,
    sort: 92,
    language: 'javascript',
    function: generateSplitTransformTextToZhAndEn,
  },
  {
    key: 'generate-transform-text-by-form',
    label: '表单文本过滤',
    type: 'transform',
    source: 'root',
    status: 1,
    sort: 91,
    language: 'javascript',
    function: generateTransformTextByForm,
  },
];
