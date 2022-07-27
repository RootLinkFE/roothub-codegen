/**
 * @description: generateAvueTablePageCode
 * selectedData
 * selectedData.requestSelectedData 请求参数-勾选
 * selectedData.responseSelectedData 响应参数-勾选
 * selectedData.modelData 模型参数-勾选
 * selectedData.resourceDetail 当前api菜单完整数据
 * window.utilsFn: {
    getApiNameAsPageName: any;
    prettyCode: any;
    generateTableColumnsProps: any;
    cleanParameterDescription: any;
  },
 * @return {string}
 */

function generateAvueTablePageCode(selectedData, api) {
  const utilsFn = window.utilsFn ?? {};
  const { responseSelectedData: body } = selectedData;

  const parametersSet = new Set();
  (api?.parameters ?? []).forEach((param) => {
    parametersSet.add(param.name);
  });
  const columnCode = utilsFn.generateTableColumnsProps(body, true, (row, index) => {
    let result = {
      prop: row.name,
      label: utilsFn.cleanParameterDescription(row.description),
      minWidth: 150,
      overHidden: true,
    };
    const item = parametersSet.has(row.name);
    if (item) {
      result.search = true;

      if (
        row.name.indexOf('状态') !== -1 ||
        (row.description && row.description.indexOf('ENUM#') !== -1) ||
        (row.enum && row.enum.length > 0)
      ) {
        result.searchType = 'select';
      }
      if (['date', 'time'].includes(row.name)) {
        result.searchType = 'datetime';
        result.format = 'YYYY-MM-DD HH:mm:ss';
        result.valueFormat = 'YYYY-MM-DD HH:mm:ss';
      }
    }
    return result;
  });

  const componentName = utilsFn.getApiNameAsPageName(api.api);
  const matchApiName = api?.api.match(/^\/api\/[a-zA-Z]+/);
  const apiName = matchApiName && matchApiName?.length > 0 ? matchApiName[0].replace('/api/', '') : '';

  return `
  /**  * ${api.description ?? api.summary} */
    <template>
    <avue-crud
      :data="records"
      :page="pagination"
      :table-loading="loading"
      v-model:search="searchParams"
      :option="option"
      v-enter="handleSearch"
      @on-load="handleSearch"
      @search-reset="handleSearch"
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
    `;
}
