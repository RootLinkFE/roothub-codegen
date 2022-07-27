/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-12 15:05:23
 * @Description:
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode } from '@/shared/utils';
import generateTableColumnsProps from './generate-table-columns-props';
import { cleanParameterDescription } from '@/shared/utils';
import generateAvueTableColumns from './generate-avue-table-columns';

export default {
  getApiNameAsPageName,
  prettyCode,
  generateTableColumnsProps,
  cleanParameterDescription,
  generateAvueTableColumns,
};
