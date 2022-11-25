/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 10:22:26
 * @Description: CustomStore
 */
import { makeAutoObservable } from 'mobx';
import { Settings, apiurlPrefixItem } from '@/shared/ts/settings';
import storage from '../shared/storage';
import { isInVSCode } from '@/shared/vscode';
import { postVSCodeMessage } from '@/shared/vscode';

// storage基础设置获取
const rhSettings: Settings = storage.get('settings');
const baseData = {
  language: 'zh-CN',
  theme: 'default',
  apiurlPrefixList: [],
};

class SettingsStore {
  Settings: Settings = rhSettings ? rhSettings : baseData;

  constructor() {
    makeAutoObservable(this);
  }

  setSettings(data: Settings) {
    this.Settings = data;
    if (!isInVSCode) {
      storage.set('settings', data);
    } else {
      postVSCodeMessage('saveCodeGenSettings', JSON.parse(JSON.stringify(data)));
    }
  }

  updateSettings(data: Settings) {
    this.Settings = data;
    if (!isInVSCode) {
      storage.set('settings', data);
    } else {
      postVSCodeMessage('updateCodeGenSettings', JSON.parse(JSON.stringify(data)));
    }
  }

  setSettingsApiurlPrefixList(list: apiurlPrefixItem[]) {
    const data = {
      ...this.Settings,
      apiurlPrefixList: list,
    };
    this.setSettings(data);
  }
}

export default new SettingsStore();
