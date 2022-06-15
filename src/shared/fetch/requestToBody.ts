import { fetchInVSCode, isInVSCode } from '@/shared/vscode';
import axios from 'axios';

export async function requestToBody(
  endpoint = '',
  header?: string,
): Promise<any> {
  const url = endpoint.toString();
  let headers: any = {};
  if (header) {
    // knfie4j工具类增强
    headers['knfie4j-gateway-request'] = header;
    headers['knfie4j-gateway-code'] = 'ROOT';
  }

  if (isInVSCode) {
    return fetchInVSCode({ url, headers });
  }

  try {
    const res = await axios({
      url,
      headers,
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
