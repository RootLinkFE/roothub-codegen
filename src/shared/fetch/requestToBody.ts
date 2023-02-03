import { fetchInVSCode, isInVSCode } from '@/shared/vscode';
import axios from 'axios';

export async function requestToBody(endpoint = '', method: any = 'GET', header?: any, data?: any): Promise<any> {
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
    return fetchInVSCode({ url, headers, data });
  }

  try {
    const res = await axios({
      url,
      method,
      headers,
      data,
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
