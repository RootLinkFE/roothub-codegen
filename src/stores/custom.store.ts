/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 10:22:26
 * @Description: CustomStore
 */
import { makeAutoObservable } from 'mobx';
import { CustomMethodsItem, types } from '@/shared/ts/custom';
import storage from '../shared/storage';
import { isInVSCode } from '@/shared/vscode';
import { postVSCodeMessage } from '@/shared/vscode';
import { MethodTypes } from '@/shared/common';

// storage自定义方法获取
const rhCustomMethods: any[] = storage.get('customMethods') ?? [];

const baseTypeData: any = {};
MethodTypes.slice(-3).map((v: string) => {
  baseTypeData[v] = {
    key: v,
    label: v,
    type: 'group',
    description: '',
    children: [],
  };
});

const filterCustomMethods = (arr: CustomMethodsItem[]) => {
  let typeData: any = baseTypeData;
  arr.forEach((item: CustomMethodsItem, index) => {
    const current = typeData[item.type];
    if (current) {
      current.children.push(item);
    }
  });
  return Object.values(typeData);
};

class CustomStore {
  CustomMethods: CustomMethodsItem[] = !isInVSCode && rhCustomMethods.length > 0 ? rhCustomMethods : [];
  EnabledCustomMethods: CustomMethodsItem[] =
    !isInVSCode && rhCustomMethods.length > 0 ? rhCustomMethods.filter((v) => v.status) : [];
  // 将自定义方法分类，且dropdownMenu可直接使用
  CustomTypeMethods: any[] = !isInVSCode && rhCustomMethods.length > 0 ? filterCustomMethods(rhCustomMethods) : [];

  constructor() {
    makeAutoObservable(this);
  }

  setCustomMethods(arr: CustomMethodsItem[]) {
    this.CustomMethods = arr;
    this.EnabledCustomMethods = arr.filter((v) => v.status);
    this.setFilterCustomMethods(arr);
    if (!isInVSCode) {
      storage.set('customMethods', arr);
    } else {
      postVSCodeMessage('saveCodeGenCustomMethods', JSON.parse(JSON.stringify(arr)));
    }
  }

  updateCustomMethods(arr: CustomMethodsItem[]) {
    this.CustomMethods = arr;
    this.EnabledCustomMethods = arr.filter((v) => v.status);
    this.setFilterCustomMethods(arr);
    if (!isInVSCode) {
      storage.set('customMethods', arr);
    } else {
      postVSCodeMessage('updateCodeGenCustomMethods', JSON.parse(JSON.stringify(arr)));
    }
  }

  setFilterCustomMethods(arr: CustomMethodsItem[]) {
    this.CustomTypeMethods = filterCustomMethods(arr);
  }
}

export default new CustomStore();
