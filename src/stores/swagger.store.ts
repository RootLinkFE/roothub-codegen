import { makeAutoObservable } from 'mobx';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import storage from '../shared/storage';

// url历史记录获取
const storageUrls: any[] = storage.get('storageUrls') ?? [];

class SwaggerStore {
  urlValue: string =
    storageUrls?.length > 0 ? storageUrls[0] : defaultSwaggerUrl;
  apiUrls: any[] = storageUrls; // api历史列表

  constructor() {
    makeAutoObservable(this);
  }

  setApiUrlsOrInitUrlValue(urls: any) {
    console.log('setApiUrlsOrInitUrlValue: ', urls);
    this.apiUrls = urls;
    this.urlValue = urls[0] || this.urlValue;
  }

  setApiUrls(urls: any) {
    console.log('setApiUrls: ', urls);
    this.apiUrls = urls;
    storage.set('storageUrls', urls);
  }

  setUrlValue(v: string) {
    this.urlValue = v;
  }
}

export default new SwaggerStore();
