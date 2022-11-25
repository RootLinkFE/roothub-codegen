import { AxiosPromise, AxiosRequestConfig } from 'axios';
import { noop, uniqueId } from 'lodash';
import storage from '../storage';
import state from '@/stores/index';
import { message } from 'antd';

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

export function postVSCodeMessage(command: string, data: any = {}) {
  // console.log('post command: ', command, data);
  getVscode()?.postMessage({
    command,
    data,
  });
}

const CommandHandler: Record<string, (data: any) => any> = {
  fetchResponse(data) {
    const [resolve, reject] = fetchResponsePromiseMap[data.sessionId];
    console.log('====================================');
    console.log(data.success);
    console.log('====================================');
    if (data.success) {
      resolve(data.response);
    } else {
      message.error('获取失败！');
      reject(data.response);
    }
    delete fetchResponsePromiseMap[data.sessionId];
  },
  updateGlobalStorage(data) {
    const arr = data ? Object.keys(data) : [];
    if (arr.length > 0) {
      for (let key in data) {
        storage.set(key, data[key]);
        if (key === 'storageUrls' && data[key]) {
          state.swagger.setApiUrlsOrInitUrlValue(data[key]);
        }
      }
    }
  },
  updateCodeGenSettings(data) {
    state.settings.updateSettings(data || []);
  },
  updateCodeGenCustomMethods(data) {
    console.log('updateCodeGenCustomMethods: ', data);
    state.custom.updateCustomMethods(data || []);
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

export function fetch(option: AxiosRequestConfig & { sessionId?: string }, commandName = 'fetch'): AxiosPromise<any> {
  option.headers = option.headers || {};

  option.headers['User-Agent'] =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';
  option.headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en;q=0.8';

  const sessionId = uniqueId('rh_codegen_');
  option.sessionId = sessionId;
  const promise = new Promise((resolve, reject) => {
    fetchResponsePromiseMap[sessionId] = [resolve, reject];
  });
  postVSCodeMessage(commandName, option);
  return promise as AxiosPromise;
}

export function fetchInVSCode(option: AxiosRequestConfig, commandName = 'fetch') {
  option.headers = option.headers || {};
  return fetch(option, commandName);
}
