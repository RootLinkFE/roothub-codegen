/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-07 13:41:23
 * @Description:
 */
/**
 * @description: generate-extract-baidu-ocrapi

 * window.utilsFn: {
    generateApiNotes,
    getApiNameAsPageName,
    prettyCode,
    filterTransformArrayByRows,
    generateTableColumnsProps,
    cleanParameterDescription,
    filetoBase64,
    generateAvueTableColumns,
  },
 * @return {string}
 */

export default function generateExtractBaiduOcrapi(file: any, values: any) {
  async function generateExtract(file: any, values: any) {
    const utilsFn: any = (window as any).utilsFn ?? {};
    const getFiletoBase64 = (f: any) => {
      return utilsFn.filetoBase64(f).then((imageBase64: any) => {
        return imageBase64;
      });
    };
    const imageBase64 = await getFiletoBase64(file);
    const formData = new FormData();
    formData.append('image', imageBase64);
    formData.append('language_type', 'CHN_ENG');
    formData.append('detect_language', 'false'); // 是否检测语言
    formData.append('paragraph', 'false'); // 是否输出段落信息
    formData.append('probability', 'false'); // 是否返回识别结果中每一行的置信度
    formData.append('detect_direction', 'false'); // 是否检测图像朝向

    const res = await utilsFn.axios({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      params: {
        access_token: '24.4b2db3703b47bfaf8d3ea9bd1d57efa0.2592000.1682243581.282335-30204631',
      },
      data: formData,
    });
    const { data } = res;
    if (res.status === 200 && data.words_result?.length > 0) {
      return data;
    } else {
      return res;
    }
  }
  return generateExtract(file, values);
}
