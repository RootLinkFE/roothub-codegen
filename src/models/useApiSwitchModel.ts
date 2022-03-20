import { requestToBody } from '@/shared/fetch/requestToBody';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import { formatUrlChar } from '@/shared/utils';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import storage from '../shared/storage';
import { uniq } from 'lodash';
import { postVSCodeMessage } from '../shared/vscode';
import state from '@/stores/index';
import { message } from 'antd';

function classifyPathsToTags(tags: any[], pathObj: object) {
  const tagMap = new Map();
  tags.forEach((tag) => {
    tagMap.set(tag.name, tag);
  });
  Object.entries(pathObj).forEach(([api, apiDetail]) => {
    Object.entries(apiDetail).forEach(
      ([method, methodDetail]: [string, any]) => {
        methodDetail.tags.forEach((tagKey: string) => {
          const tag = tagMap.get(tagKey);
          tag.paths = tag.paths || [];
          methodDetail.api = api;
          methodDetail.method = method;
          tag.paths.push(methodDetail);
        });
      },
    );
  });
}

export default function useApiSwitchModel() {
  // 类型
  const [type, setType] = useState('api');

  // 通过当前资源地址获取资源
  const {
    run: fetchResources,
    data: resources,
    loading: resourcesLoading,
  } = useRequest(
    async () => {
      const swaggerUrl = formatUrlChar(state.swagger.urlValue);

      const res = await requestToBody(swaggerUrl + '/swagger-resources');
      console.log('res=', res, !!res);

      if (res) {
        handleStorageUrl();
        // url成功，重置选中的key，兼容处理刷新
        setSelectedResourceIndex('');
      } else {
        message.error('获取swagger-resources失败！');
      }
      return res || [];
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
      newStorageUrls = (
        item ? uniq([current, ...storageUrls]) : [current, ...storageUrls]
      ).slice(0, 10);
    }

    postVSCodeMessage('pushStorage', {
      key: 'storage',
      data: { ['storageUrls']: newStorageUrls },
    });
    state.swagger.setApiUrls(newStorageUrls);
  };

  // 当前选择的资源key
  const [selectedResourceIndex, setSelectedResourceIndex] =
    useState<string>('');
  const selectedResource = useMemo(
    () => resources?.[selectedResourceIndex],
    [selectedResourceIndex, resources],
  );

  // 当前选中的资源 Key 获取详情
  const { data: resourceDetail } = useRequest(
    async () => {
      if (selectedResourceIndex) {
        const formatUrl = formatUrlChar(state.swagger.urlValue);
        const res = await requestToBody(formatUrl + selectedResource.url);
        classifyPathsToTags(res.tags, res.paths);
        return res;
      }
      return null;
    },
    {
      refreshDeps: [selectedResource, state.swagger.urlValue],
    },
  );

  // 选中的标签
  const [selectedTagIndex, setSelectedTagIndex] = useState<string>('');
  const selectedTag = useMemo(
    () => resourceDetail?.tags?.[Number(selectedTagIndex)] ?? null,
    [resourceDetail, selectedTagIndex],
  );
  // 选中的接口
  const [selectedApiIndex, setSelectedApiIndex] = useState<string>('');
  const selectedApi = useMemo(
    () =>
      resourceDetail?.tags?.[Number(selectedTagIndex)]?.paths?.[
        selectedApiIndex
      ] ?? null,
    [resourceDetail, selectedTagIndex, selectedApiIndex],
  );

  // 选择的模型
  const [selectedDefinition, setSelectedDefinition] = useState<any>();
  // 模型编码设置
  const [definitionCodeDrawerProps, originSetDefinitionCodeDrawerProps] =
    useState<any>({});
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

  useEffect(() => {
    setSelectedTagIndex('');
  }, [selectedResourceIndex]);

  useEffect(() => {
    setSelectedApiIndex('');
  }, [selectedTagIndex]);

  return {
    type,
    setType,
    selectedResourceIndex,
    setSelectedResourceIndex,
    selectedResource,
    fetchResources,
    resources,
    resourcesLoading,
    resourceDetail,
    selectedTagIndex,
    setSelectedTagIndex,
    selectedTag,
    selectedApiIndex,
    setSelectedApiIndex,
    selectedApi,
    selectedDefinition,
    setSelectedDefinition,
    definitionCodeDrawerProps,
    setDefinitionCodeDrawerProps,
  };
}
