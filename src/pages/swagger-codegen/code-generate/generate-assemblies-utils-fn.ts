/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-12 15:05:23
 * @Description:
 */
import generateApiNotes from './generate-api-notes';
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription } from '@/shared/utils';
import generateAvueTableColumns from './generate-avue-table-columns';

export default {
  generateApiNotes,
  getApiNameAsPageName,
  prettyCode,
  filterTransformArrayByRows,
  generateTableColumnsProps,
  cleanParameterDescription,
  generateAvueTableColumns,
};
