/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-12 11:31:18
 * @Description:
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode } from '@/shared/utils';
import generateAvueTableColumns from './generate-avue-table-columns';

export default function generateAvueTablePageCode(body: any, api: { api: string; description: string }) {
  const columnCode = generateAvueTableColumns(body);

  const componentName = getApiNameAsPageName(api.api);
  const matchApiName: any[] | null = api?.api.match(/^\/api\/[a-zA-Z]+/);
  const apiName = matchApiName && matchApiName?.length > 0 ? matchApiName[0].replace('/api/', '') : '';

  return prettyCode(`
/**  * ${api?.description} */
  <template>
  <avue-crud
    :data="records"
    :page="pagination"
    :table-loading="loading"
    v-model:search="searchParams"
    :option="option"
    v-enter="handleSearch"
    @on-load="handleSearch"
    @search-reset="handleReset"
    @refresh-change="handleSearch"
    @search-change="handleSearch"
    @size-change="handleSearch"
    @current-change="handleSearch"
  >
  </avue-crud>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { crudOptions } from '@/core/crud';
  import {
    packTableQueryParams,
    usePageRequest,
  } from '@/util/businessUtil';
  import { fetch${componentName}List } from '@/api/${apiName}';

  const searchParams = ref({});
  
  const option = computed(() => ({
    ...crudOptions(),
    addBtn: false,
    editBtn: false,
    delBtn: false,
    searchMenuSpan: 24,
    searchLabelWidth: 120,
    minWidth: 150,
    header: true,
    menu: false,
    column: ${columnCode},
  }));

  const {
    records,
    pagination,
    loading,
    run: fetchTableData,
  } = usePageRequest(fetch${componentName}List, {
    manual: true,
  });

  const handleSearch = (params, done) => {
    const tmp = packTableQueryParams(
      ...searchParams.value,
      pagination
    );
    fetchTableData(tmp)
      .then((res) => {
        return res;
      })
      .finally(done);
  };
  </script>
  <style></style>
  `);
}
