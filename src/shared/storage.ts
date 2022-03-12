interface StorageInterface {
  /**
   * 设置localStorage
   * @param expires 过期时间，单位：秒
   */
  set: (key: string, value: any, expires?: number) => void;
  // 获取localStorage,默认会自动转json
  get: <T = Record<any, any>>(key: string, isJson?: boolean) => T;
  // 是否含有key
  has: (key: string, isJson?: boolean) => boolean;
  // 移除
  remove: (key: string) => void;
}

interface SessionStorageInterface extends StorageInterface {
  session: StorageInterface;
}

type StoreDataType = { value: any; expires?: number };

const storage: SessionStorageInterface = {} as SessionStorageInterface;

const extend = (s: Storage): StorageInterface => {
  const serialize = (data: Record<string, any>) => {
    try {
      return JSON.stringify(data);
    } catch (e) {
      throw new Error('data must object');
    }
  };
  const deserialize = (data: string) => {
    // serialize 能进去，parse都不会出错，无需try catch
    return JSON.parse(data);
  };
  return {
    set(key, value: any, expires?: number) {
      if (value === undefined || value === null) {
        s.removeItem(key);
        return;
      }
      const storeData: StoreDataType = { value };
      if (expires) {
        storeData.expires = Date.now() + expires * 1000;
      }
      s.setItem(key, serialize(storeData));
    },
    get(key) {
      const storeData = deserialize(s.getItem(key) || '{}') as StoreDataType;
      if (storeData.expires && storeData.expires <= Date.now()) {
        this.remove(key);
        return null;
      }
      return storeData.value;
    },
    has(key) {
      return !!(this.get(key) as string | Record<any, any>);
    },
    remove: (key) => {
      s.removeItem(key);
    },
  };
};

Object.assign(storage, extend(window.localStorage));
Object.assign(storage, { session: extend(window.localStorage) });

export default storage;
