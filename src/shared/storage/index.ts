/**
 * @author giscafer
 * @homepage http://giscafer.com
 * @created 2022-03-12 14:11:54
 * @description LocalStorage和SessionStorage的统一使用和管理、解决微前端下，同域缓存覆盖问题
 */

import { IStorage } from './interface';
import { StorageOptions, StoreDataType, StoreType, ValueType } from './types';

const serialize = (data: ValueType) => {
  try {
    return JSON.stringify(data);
  } catch (e) {
    throw new Error('data must object');
  }
};

const deserialize = (data: string | null) => {
  return data ? JSON.parse(data) : null;
};

export class RhStorage implements IStorage {
  prefix: string;
  private storage: StoreType;
  private expires: number | undefined;
  constructor(options?: StorageOptions) {
    // 默认localStorage
    this.storage = options?.store || window.localStorage;
    // 预留前缀，避免微前端同域情况覆盖
    this.prefix = options?.prefix || 'rh_';
    this.expires = options?.expires;
  }

  has(key: string) {
    let hasKey = false;
    for (const keyName in this.storage) {
      if (keyName === `${this.prefix}${key}`) {
        hasKey = true;
      }
    }
    return hasKey;
  }

  get(key: string) {
    const storeData = deserialize(this.storage.getItem(`${this.prefix}${key}`));
    if (storeData?.expires && storeData?.expires <= Date.now()) {
      this.remove(key);
      return null;
    }
    return storeData?.value;
  }

  set(key: string, value: ValueType) {
    if (!key) {
      throw new Error('必须指定key！');
    } else if (typeof key === 'object') {
      throw new Error('key不能是一个对象！');
    }
    const storeData: StoreDataType = { value };

    if (this.expires) {
      storeData.expires = Date.now() + this.expires * 1000;
    }
    this.storage.setItem(`${this.prefix}${key}`, serialize(storeData));
  }

  remove(key: string) {
    this.storage.removeItem(`${this.prefix}${key}`);
  }

  clear() {
    // 避免清除了别的
    for (const keyName in this.storage) {
      if (keyName.indexOf(this.prefix) === 0) {
        this.storage.removeItem(keyName);
      }
    }
  }
}

export default new RhStorage();
