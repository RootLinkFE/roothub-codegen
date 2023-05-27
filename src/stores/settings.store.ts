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
  baiduApiToken: '24.ba24da4592cdd39ac59057f1dc836656.2592000.1687513296.282335-31896638',
  baiduApiTokenExpires: 1684924027509, // 过期时间戳
  baiduOCRAppid: '',
  baiduOCRSecret: '',
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
