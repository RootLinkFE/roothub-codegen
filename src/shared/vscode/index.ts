import { AxiosPromise, AxiosRequestConfig } from 'axios';
import { noop, uniqueId } from 'lodash';

export const fetchResponsePromiseMap: Record<string, ((r: any) => void)[]> = {};

export let isInVSCode = false;

let vscode:
  | undefined
  | {
      postMessage(message: any): Thenable<boolean>;
      getState: () => void;
      setState: (newState: object) => void;
    };

function getVscode() {
  if (!vscode) {
    try {
      vscode = acquireVsCodeApi();
      isInVSCode = true;
    } catch (err) {
      console.warn('runningTime is not in vscode');
      vscode = {
        getState: noop,
        postMessage: (message) => Promise.resolve(true),
        setState: noop,
      };
    }
  }
  return vscode;
}
getVscode();

export function postMessage(command: string, data: any = {}) {
  // console.log('post command: ', command, data);
  getVscode()?.postMessage({
    command,
    data,
  });
}

const CommandHandler: Record<string, (data: any) => any> = {
  fetchResponse(data) {
    const [resolve, reject] = fetchResponsePromiseMap[data.sessionId];
    if (data.success) {
      resolve(data.response);
    } else {
      reject(data.response);
    }
    delete fetchResponsePromiseMap[data.sessionId];
  },
};

const messageListener = (event: any) => {
  const { command, data } = event.data;
  try {
    if (CommandHandler[command]) {
      CommandHandler[command](data);
    }
  } catch (err) {}
};

export function setupBackgroundManagement() {
  window.removeEventListener('message', messageListener);
  window.addEventListener('message', messageListener);
}

export function fetch(
  option: AxiosRequestConfig & { sessionId?: string },
): AxiosPromise<any> {
  option.headers = option.headers || {};

  option.headers['User-Agent'] =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';
  option.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';

  const sessionId = uniqueId('rh_codegen_');
  option.sessionId = sessionId;
  const promise = new Promise((resolve, reject) => {
    fetchResponsePromiseMap[sessionId] = [resolve, reject];
  });
  postMessage('fetch', option);
  return promise as AxiosPromise;
}

export function fetchInVSCode(option: AxiosRequestConfig) {
  option.headers = option.headers || {};
  return fetch(option);
}
