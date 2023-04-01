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

export default function generateExtractBaiduOcrapi(file: any, base64Image: any) {
  async function generateExtract(file: any, base64Image: any) {
    const utilsFn: any = (window as any).utilsFn ?? {};
    const getFiletoBase64 = (f: any) => {
      return utilsFn.filetoBase64(f).then((imageBase64: any) => {
        return imageBase64;
      });
    };
    const imageBase64 = base64Image || (await getFiletoBase64(file));
    const formData = new FormData();
    formData.append('image', imageBase64);
    formData.append('language_type', 'CHN_ENG');
    formData.append('detect_language', 'false'); // 是否检测语言
    formData.append('paragraph', 'false'); // 是否输出段落信息
    formData.append('probability', 'false'); // 是否返回识别结果中每一行的置信度
    formData.append('detect_direction', 'false'); // 是否检测图像朝向

    const res = await utilsFn.axios({
      method: 'POST',
      url: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic',
      // 通用文字识别（高精度版） - https://ai.baidu.com/ai-doc/OCR/1k3h7y3db
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      params: {
        access_token: '24.38fa33748c5dd7740905f992d8c8541e.2592000.1682945835.282335-31896638',
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
  return generateExtract(file, base64Image);
}
