import { fetchInVSCode, isInVSCode } from '@/shared/vscode';
import axios from 'axios';

export async function requestToBody(
  endpoint = '',
): Promise<Record<string, any>> {
  const url = endpoint.toString();

  if (isInVSCode) {
    return fetchInVSCode({ url });
  }

  try {
    const res = await axios.get(url);
    if (res.status !== 200) {
      return [];
    } else {
      return res.data;
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}
