export type StoreType = typeof window.localStorage &
  typeof window.sessionStorage;

export type ValueType =
  | Record<string, any>
  | number
  | string
  | undefined
  | null;

export type StorageOptions = {
  /**
   * 前缀
   */
  prefix?: string;
  /**
   * storage 类型
   */
  store?: StoreType;
  /**
   * 过期时间， 秒（s)
   */
  expires?: number;
};

export type StoreDataType = { value: ValueType; expires?: number };
