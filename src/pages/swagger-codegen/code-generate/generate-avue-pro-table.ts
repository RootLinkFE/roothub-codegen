/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-09 18:13:19
 * @Description: generate-avue-pro-table
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateAvueTableColumns from './generate-avue-table-columns';

export default function generateAvueProTablePageCode(
  selectedData: any,
  api: { api: string; description: string; summary: string },
) {
  let { responseSelectedData: body, transformTextArray } = selectedData;
  if (transformTextArray) {
    body = filterTransformArrayByRows(body, transformTextArray);
  }
  const columnCode = generateAvueTableColumns(body, {}, api);
  const componentName = getApiNameAsPageName(api.api);
  const matchApiName: any[] | null = api?.api.match(/^\/api\/[a-zA-Z]+/);
  const apiName = matchApiName && matchApiName?.length > 0 ? matchApiName[0].replace('/api/', '') : componentName;

  const fetchListName = `fetch${componentName}List`;
  return prettyCode(`
/**  * ${api?.description ?? api.summary} */
  <template>
    <ys-pro-table
      ref="tableRef"
      :request="{ method: ${fetchListName} }"
      :option="option"
    />
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { ${fetchListName} } from '@/api/${apiName}';
  
  const option = computed(() => ({
    selection: false,
    addBtn: false,
    editBtn: false,
    delBtn: false,
    searchMenuSpan: 24,
    searchLabelWidth: 120,
    minWidth: 150,
    header: true,
    menu: false,
    menuWidth: 150,
    column: ${columnCode},
  }));
  </script>
  <style></style>
  `);
}
