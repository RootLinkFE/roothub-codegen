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

/**
 * @description: 获取baiduOCR-token
 * @return {string}
 */
const getBaiDuApiToken = async () => {
  const Settings = state.settings.Settings;
  const { baiduApiToken, baiduApiTokenExpires, baiduOCRAppid, baiduOCRSecret } = Settings;
  const nowTime = Date.now();
  if (baiduApiToken && baiduApiTokenExpires > nowTime) {
    // 判断token是否过期，有效期30天
    return baiduApiToken;
  } else {
    if (!baiduOCRAppid || !baiduOCRSecret) {
      console.error('baiduOCRAppid or baiduOCRSecret is empty');
      return baiduApiToken;
    }
    const utilsFn: any = (window as any).utilsFn ?? {};
    const res = await utilsFn.requestToBody(
      `https://aip.baidubce.com/oauth/2.0/token?client_id=${baiduOCRAppid}&client_secret=${baiduOCRSecret}&grant_type=client_credentials`, // 获取AccessToken
      'POST',
      { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    );
    if (res.access_token) {
      state.settings.updateSettings({
        ...Settings,
        baiduApiToken: res.access_token,
        baiduApiTokenExpires: nowTime + res.expires_in,
      });
      return res.access_token;
    } else {
      console.log('baiduOCR-token-error', res);
      return baiduApiToken;
    }
  }
};

export default function generateExtractBaiduOcrapi(file: any, base64Image: any) {
  async function generateExtract(file: any, base64Image: any) {
    const utilsFn: any = (window as any).utilsFn ?? {};
    const getFiletoBase64 = (f: any) => {
      return utilsFn.filetoBase64(f).then((imageBase64: any) => {
        return imageBase64;
      });
    };
    const imageBase64 = base64Image || (await getFiletoBase64(file));
    const token = await getBaiDuApiToken();
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
    console.log('baiduOCR-res', res);
    if (res.status === 200 && res?.data.words_result?.length > 0) {
      return res.data;
    } else {
      return res;
    }
  }
  return generateExtract(file, base64Image);
}
