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
import state from '@/stores/index';

export default function generateExtractBaiduOcrapi(file: any, base64Image: any) {
  async function generateExtract(file: any, base64Image: any) {
    const utilsFn: any = (window as any).utilsFn ?? {};
    const getFiletoBase64 = (f: any) => {
      return utilsFn.filetoBase64(f).then((imageBase64: any) => {
        return imageBase64;
      });
    };
    const imageBase64 = base64Image || (await getFiletoBase64(file));
    const token = state.settings.Settings.baiduApiToken;
    const res = await utilsFn.requestToBody(
      `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`, // 通用文字识别（高精度版） - https://ai.baidu.com/ai-doc/OCR/1k3h7y3db
      'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      {},
      {
        image: imageBase64,
        language_type: 'CHN_ENG',
        detect_language: false, // 是否检测语言
        paragraph: false, // 是否输出段落信息
        probability: false, // 是否返回识别结果中每一行的置信度
        detect_direction: false, // 是否检测图像朝向
      },
    );
    if (res.status === 200 && res?.data.words_result?.length > 0) {
      return res.data;
    } else {
      return res;
    }
  }
  return generateExtract(file, base64Image);
}
