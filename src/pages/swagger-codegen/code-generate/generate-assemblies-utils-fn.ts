/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-12 15:05:23
 * @Description:
 */
import axios from 'axios';
import generateApiNotes from './generate-api-notes';
import generateApiConstName from './generate-api-const-name';
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription, filetoBase64 } from '@/shared/utils';
import generateAvueTableColumns from './generate-avue-table-columns';

export default {
  axios,
  generateApiNotes,
  generateApiConstName,
  getApiNameAsPageName,
  prettyCode,
  filterTransformArrayByRows,
  generateTableColumnsProps,
  cleanParameterDescription,
  filetoBase64,
  generateAvueTableColumns,
};
