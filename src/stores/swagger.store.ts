import { makeAutoObservable } from 'mobx';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import storage from '../shared/storage';
import { HistoryItem } from '@/shared/common';
import { filterHasIdByHistoryTexts } from '@/shared/utils';

// url历史记录获取
const storageUrls: string[] = storage.get('storageUrls') ?? [];
// 默认提取方法
const storageExtractType: string = storage.get('storageExtractType') ?? 'ExtractBaiduOcrapi';
// 历史文本转换记录
const storageHistoryTexts: HistoryItem[] = storage.get('storageHistoryTexts') ?? [];

class SwaggerStore {
  urlValue: string = storageUrls?.length > 0 ? storageUrls[0] : defaultSwaggerUrl;
  apiUrls: string[] = storageUrls; // api历史列表
  extractType: string = storageExtractType; // 提取方法
  historyTexts: HistoryItem[] = filterHasIdByHistoryTexts(storageHistoryTexts); // 历史文本转换记录

  constructor() {
    makeAutoObservable(this);
  }

  setApiUrlsOrInitUrlValue(urls: string[]) {
    this.apiUrls = urls;
    this.urlValue = urls[0] || this.urlValue;
  }

  setApiUrls(urls: string[]) {
    this.apiUrls = urls;
    storage.set('storageUrls', urls);
  }

  setUrlValue(v: string) {
    this.urlValue = v;
  }

  setExtractType(type: string) {
    this.extractType = type;
    storage.set('storageExtractType', type);
  }

  setHistoryTexts(list: HistoryItem[]) {
    this.historyTexts = filterHasIdByHistoryTexts(list);
    storage.set('storageHistoryTexts', list);
  }
}

export default new SwaggerStore();
