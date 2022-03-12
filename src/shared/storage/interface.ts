import { ValueType } from './types';

export interface IStorage {
  set: (key: string, value: ValueType) => void;
  get: <T = ValueType>(key: string) => T;
  has: (key: string) => boolean;
  remove: (key: string) => void;
}
