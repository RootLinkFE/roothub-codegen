/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-05 14:54:37
 * @Description: api-ts-接口声明
 */
export interface resourceItems {
  location: string;
  name: string;
  swaggerVersion: string;
  url: string;
  header?: string;
  paths: resourceItems[];
}

export interface basePathsItem {
  description: string;
  api: string;
  method: string;
  operationId: string;
  parameters: any[];
  produces: ['*/*'];
  responses: any[];
  summary: string;
  tags: string[];
}

export interface pathsItem extends basePathsItem {
  uuid: string;
  methodUpper: string;
}

export interface tagsItem {
  description: string;
  name: string;
  paths: pathsItem[];
}
