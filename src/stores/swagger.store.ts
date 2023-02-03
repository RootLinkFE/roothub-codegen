import { makeAutoObservable } from 'mobx';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import storage from '../shared/storage';

// url历史记录获取
const storageUrls: string[] = storage.get('storageUrls') ?? [];
// 历史文本转换记录
const storageHistoryTexts: string[] = storage.get('storageHistoryTexts') ?? [];

class SwaggerStore {
  urlValue: string = storageUrls?.length > 0 ? storageUrls[0] : defaultSwaggerUrl;
  apiUrls: string[] = storageUrls; // api历史列表
  historyTexts: string[] = storageHistoryTexts; // 历史文本转换记录

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

  setHistoryTexts(list: string[]) {
    this.historyTexts = list;
    storage.set('storageHistoryTexts', list);
  }
}

export default new SwaggerStore();
