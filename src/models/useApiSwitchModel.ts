/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
 */
import { requestToBody } from '@/shared/fetch/requestToBody';
import { formatUrlChar } from '@/shared/utils';
import { useRequest } from 'ahooks';
import { isArray, uniq } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import storage from '@/shared/storage';
import { postVSCodeMessage } from '@/shared/vscode';
import state from '@/stores/index';
import { message } from 'antd';
import { resourceItems, pathsItem, tagsItem } from '@/shared/ts/api-interface';
import { TransformSate } from '@/shared/ts/settings';
import { classifyPathsToTags } from '@/shared/utils';
const yaml = require('js-yaml');

export default function useApiSwitchModel() {
  const [collapsed, setCollapsed] = useState<boolean | undefined>(false); // 左侧菜单选项收起
  const [searchTextFixed, setSearchTextFixed] = useState<boolean | undefined>(false); // 搜索text框显示
  const [apiSearchText, setapiSearchText] = useState<string>(''); // api详情搜索文本
  // 搜索显示tags
  const [searchTags, setSearchTags] = useState<tagsItem[] | null>(null);

  // 类型 api | json
  const [type, setType] = useState('api');

  // 通过当前资源地址获取资源
  const { run: fetchResources, data: resources, loading: resourcesLoading } = useRequest(
    async () => {
      // 重置选择
      setSelectedApiRows([]);
      selectedApiMaps.clear();
      setSelectedApi(null);
      setSelectedResourceIndex('');

      let swaggerUrl = state.swagger.urlValue;
      let urlType = type;
      if (/.json$/.test(swaggerUrl)) {
        // https://petstore.swagger.io/v2/swagger.json
        urlType = 'json';
      } else if (/.yaml$/.test(swaggerUrl)) {
        urlType = 'yaml';
      } else {
        urlType = 'api';
        swaggerUrl = formatUrlChar(state.swagger.urlValue) + '/swagger-resources';
      }

      let res = await requestToBody(swaggerUrl);
      if (typeof res === 'string') {
        console.log('res', res);
        return [];
      }
      if (res) {
        handleStorageUrl();
        if (['json', 'yaml'].includes(urlType)) {
          if (urlType === 'yaml') {
            res = yaml.load(res); // yaml文件格式解析成json形式
          }
          classifyPathsToTags(res.tags, res.paths);
        } else if (urlType === 'api') {
          // url成功，重置选中的key，兼容处理刷新
          if (isArray(res) && res.length > 0) {
            setSelectedResourceIndex(res[0].location || res[0].url);
          }
        }
      } else {
        message.error('获取swagger-resources失败！');
      }
      setType(urlType);
      return type === 'api' ? res || [] : res;
    },
    {
      manual: true,
    },
  );

  /**
   * 处理url结合历史url存储到storage
   */
  const handleStorageUrl = () => {
    const current = formatUrlChar(state.swagger.urlValue);
    const storageUrls: any[] = storage.get('storageUrls');
    let newStorageUrls: any[] = [current];
    if (storageUrls) {
      const item = storageUrls.find((v: string) => v === current);
      newStorageUrls = (item ? uniq([current, ...storageUrls]) : [current, ...storageUrls]).slice(0, 10);
    }

    postVSCodeMessage('pushStorage', {
      key: 'storage',
      data: { ['storageUrls']: newStorageUrls },
    });
    state.swagger.setApiUrls(newStorageUrls);
  };

  // 当前选择的资源key
  const [selectedResourceIndex, setSelectedResourceIndex] = useState<string>('');
  const resourcesMap: Map<string, resourceItems> = useMemo(() => {
    return Array.isArray(resources) && resources?.length
      ? resources?.reduce((p: Map<string, resourceItems>, item: resourceItems) => {
          p.set(item.location || item.url, item);
          return p;
        }, new Map())
      : new Map();
  }, [resources]);
  const selectedResource: resourceItems = useMemo(() => {
    return resourcesMap.get(selectedResourceIndex) as resourceItems;
  }, [selectedResourceIndex, resourcesMap]);

  // 当前选中的资源 Key 获取详情
  const { data: requestResourceDetail, loading: resourceDetailLoading, run: fetchSelectedResource } = useRequest(
    async () => {
      if (selectedResourceIndex) {
        const formatUrl = formatUrlChar(state.swagger.urlValue);
        const res = await requestToBody(
          formatUrl + (selectedResource.location || selectedResource.url),
          'GET',
          selectedResource.header,
        );
        classifyPathsToTags(res.tags ?? [], res.paths ?? []);
        return res;
      }
      return null;
    },
    {
      refreshDeps: [selectedResource, state.swagger.urlValue],
    },
  );

  const resourceDetail = useMemo(() => {
    if (['json', 'yaml'].includes(type)) {
      return resources;
    } else {
      return selectedResourceIndex ? requestResourceDetail : null;
    }
  }, [requestResourceDetail, type, resources]);

  // 已选中接口的列表
  const [selectedApiRows, setSelectedApiRows] = useState<pathsItem[]>([]);
  const [selectedApiMaps] = useState<Map<string, pathsItem>>(new Map());

  // 选中的接口
  const [selectedApi, setSelectedApi] = useState<pathsItem | null>(null);
  const setItemSelectedApi = useCallback(
    (row: pathsItem) => {
      const list: pathsItem[] = selectedApiRows;
      if (!selectedApiMaps.get(row.uuid)) {
        if (list.length >= 15) {
          const firstItem: pathsItem = list[0];
          list.splice(0, 1);
          selectedApiMaps.delete(firstItem.uuid);
        }
        list.push(row);
        setSelectedApiRows(list);
      }
      selectedApiMaps.set(row.uuid, row);
      setSelectedApi(row);
    },
    [selectedApiMaps, selectedApiRows],
  );

  // 选择的模型
  const [selectedDefinition, setSelectedDefinition] = useState<any>();
  // 模型编码设置
  const [definitionCodeDrawerProps, originSetDefinitionCodeDrawerProps] = useState<any>({});
  const setDefinitionCodeDrawerProps = useCallback(
    (props) => {
      originSetDefinitionCodeDrawerProps({
        ...props,
        onClose: () => {
          originSetDefinitionCodeDrawerProps((prev: any) => ({
            ...prev,
            visible: false,
          }));
        },
      });
    },
    [originSetDefinitionCodeDrawerProps],
  );

  // apiurl默认前缀
  const apiurlPrefix = useMemo(() => {
    const urlValue = state.swagger.urlValue;
    const { apiurlPrefixList } = state.settings.Settings;
    return apiurlPrefixList.find((v) => v.status && v.url === urlValue)?.prefix || '';
  }, [state.swagger.urlValue, state.settings.Settings, resources]);

  // 文本转换配置
  const [transformSate, setTransformSate] = useState<TransformSate>({
    status: true, // 代码转换关联转换文本
    textRecord: [], // 最后文本记录
    historyArray: [], // 历史文本转换记录
    baseCode: null,
    isTranslate: true,
  });

  return {
    collapsed,
    setCollapsed,
    searchTextFixed,
    setSearchTextFixed,
    apiSearchText,
    setapiSearchText,
    searchTags,
    setSearchTags,
    type,
    setType,
    selectedResourceIndex,
    setSelectedResourceIndex,
    selectedResource,
    fetchSelectedResource,
    fetchResources,
    resources,
    resourcesLoading,
    resourceDetail,
    resourceDetailLoading,
    selectedApi,
    setSelectedApi,
    selectedApiRows,
    setSelectedApiRows,
    selectedApiMaps,
    setItemSelectedApi,
    selectedDefinition,
    setSelectedDefinition,
    definitionCodeDrawerProps,
    setDefinitionCodeDrawerProps,
    apiurlPrefix,
    transformSate,
    setTransformSate,
  };
}
