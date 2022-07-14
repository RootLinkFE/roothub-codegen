/**
 * @description: generateAvueTablePageCode
 * utilsFn: {
    getApiNameAsPageName: any;
    prettyCode: any;
    generateTableColumnsProps: any;
    cleanParameterDescription: any;
  },
 * @return {string}
 */
function generateAvueTablePageCode(body, api, utilsFn) {
  const columnCode = utilsFn.generateTableColumnsProps(body, true, (row, index) => {
    return {
      prop: row.name,
      label: utilsFn.cleanParameterDescription(row.description),
      minWidth: 150,
      overHidden: true,
      search: index === 0 || row.name === 'name' ? false : true, // 临时只显示第一个字段作为查询
    };
  });

  const componentName = utilsFn.getApiNameAsPageName(api.api);
  const matchApiName = api?.api.match(/^\/api\/[a-zA-Z]+/);
  const apiName = matchApiName && matchApiName?.length > 0 ? matchApiName[0].replace('/api/', '') : '';

  return utilsFn.prettyCode(`
/**  * ${api.description} */
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

export default generateAvueTablePageCode;
