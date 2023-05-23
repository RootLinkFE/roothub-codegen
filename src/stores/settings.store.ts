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
  baiduTransAppid: '',
  baiduTransSecret: '',
  baiduApiToken: '24.314fe09fa0ea4b5f105c276ea9d6e17f.2592000.1685860331.282335-31896638',
  matchCodeStatus: true,
  matchCodeFnKey: '',
};

class SettingsStore {
  Settings: Settings = rhSettings ? rhSettings : baseData;
  baseCode: string = '';
  searchFixedText: string = '';

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
    const params = { ...this.Settings, ...data };
    if (!isInVSCode) {
      storage.set('settings', params);
    } else {
      postVSCodeMessage('updateCodeGenSettings', JSON.parse(JSON.stringify(params)));
    }
    this.Settings = params;
  }

  setSettingsApiurlPrefixList(list: apiurlPrefixItem[]) {
    const data = {
      ...this.Settings,
      apiurlPrefixList: list,
    };
    this.setSettings(data);
  }

  // 更改baseCode
  setBaseCode(text: string) {
    this.baseCode = text;
  }

  setSearchFixedText(text: string) {
    this.searchFixedText = text;
  }
}

export default new SettingsStore();
