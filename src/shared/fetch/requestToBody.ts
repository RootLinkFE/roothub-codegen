import { fetchInVSCode, isInVSCode } from '@/shared/vscode';
import axios, { AxiosRequestTransformer } from 'axios';

export async function requestToBody(
  endpoint = '',
  method: any = 'GET',
  header?: any,
  data?: any,
  params?: any,
): Promise<any> {
  const url = endpoint.toString();
  let headers: any = {};
  if (header) {
    if (typeof header === 'string') {
      // knfie4j工具类增强
      headers['knfie4j-gateway-request'] = header;
      headers['knfie4j-gateway-code'] = 'ROOT';
    } else {
      headers = header;
    }
  }

  if (isInVSCode) {
    return fetchInVSCode({
      url,
      method,
      headers,
      data,
      params,
    });
  }

  let requestUrl = url;
  if (!isInVSCode && url.startsWith('http://xxx.xx.xx.xx:xxxx')) {
    // 浏览器环境下，将该地址转发给 .umirc.ts 配置的代理解决跨域
    requestUrl = url.replace('http://xxx.xx.xx.xx:xxxx', '/swagger-proxy');
  }

  try {
    const res = await axios({
      url: requestUrl,
      method,
      headers,
      data,
      params,
    });
    if (res.status !== 200) {
      return null;
    } else {
      return res.data;
    }
  } catch (err) {
    console.error('axios-err', err);
    return null;
  }
}
