import { noop } from 'lodash';

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
  console.log('post command: ', command, data);
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

export function setupBackgroundManagement() {
  window.addEventListener('message', (event) => {
    const { command, data } = event.data;
    try {
      if (CommandHandler[command]) {
        CommandHandler[command](data);
      }
    } catch (err) {
    } finally {
    }
  });
}
