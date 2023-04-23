/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-26 16:00:23
 * @Description: generateAvueFormCode
 */
import getApiNameAsPageName from '@/shared/getApiNameAsPageName';
import { prettyCode, filterTransformArrayByRows } from '@/shared/utils';
import generateAvueFormColumns from './generate-avue-form-columns';

export default function generateAvueFormCode(
  selectedData: any,
  api: { api: string; description: string; summary: string },
) {
  let { requestSelectedData: body, transformTextArray } = selectedData;
  if (transformTextArray) {
    body = filterTransformArrayByRows(body, transformTextArray);
  }
  const columnCode = generateAvueFormColumns(body);
  const componentName = getApiNameAsPageName(api.api);
  const matchApiName: any[] | null = api?.api.match(/^\/api\/[a-zA-Z]+/);
  const apiName = matchApiName && matchApiName?.length > 0 ? matchApiName[0].replace('/api/', '') : '';

  return prettyCode(`
/**  * ${api?.description ?? api.summary} */
  <template>
  <avue-form ref="formRef" :option="option" v-model="formValues" @submit="handleSubmit">
    <template #footer>
      <span class="form-footer">
        <el-button @click="handleClose">取 消</el-button>
        <el-button type="primary" @click="handleButtonSubmit" :loading="loading">确 定</el-button>
      </span>
    </template>
  </avue-form>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import { fetch${componentName}Data } from '@/api/${apiName}';
  import { ElMessage } from 'element-plus';

  const formValues = ref({});
  const formRef = ref(null);
  const loading = ref(false);
  
  const option = computed(() => ({
    labelWidth: 130,
    span: 8,
    gutter: 20,
    submitBtn: false,
    emptyBtn: false,
    column: ${columnCode},
  }));

  const handleClose = () => {};

  const handleSubmit = (form, done) => {
    loading.value = true;
    fetch${componentName}Data({
      ...form
    }).then((res) => {
      const data = res.data;
      if (data.success) {
        ElMessage({
          type: 'success',
          message: data.msg,
        });
        formRef.value.resetForm();
      }
      done();
      loading.value = false;
    }).catch(() => {
      loading.value = false;
    });
  }
  </script>
  <style></style>
  `);
}
