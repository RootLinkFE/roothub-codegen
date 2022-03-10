import { requestToBody } from '@/shared/fetch/requestToBody';
import { defaultSwaggerUrl } from '@/shared/swaggerUrl';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
  // 接口地址的ref
  const urlRef = useRef(defaultSwaggerUrl);
  const url = urlRef.current;

  // 通过当前资源地址获取资源
  const {
    run: fetchResources,
    data: resources,
    loading: resourcesLoading,
  } = useRequest(
    async () => {
      const swaggerUrl =
        urlRef.current.lastIndexOf('/') === urlRef.current.length - 1
          ? urlRef.current.slice(0, -1)
          : urlRef.current;

      const res = await requestToBody(swaggerUrl + '/swagger-resources');
      // console.log('res=', res);

      return res;
    },
    {
      manual: true,
    },
  );

  // 类型
  const [type, setType] = useState('api');

  // 当前选择的资源key
  const [selectedResourceIndex, setSelectedResourceIndex] =
    useState<string>('');
  const selectedResource = useMemo(
    () => resources?.[selectedResourceIndex],
    [selectedResourceIndex, resources],
  );

  // 如果当前url改变，重置选中的key
  useEffect(() => {
    setSelectedResourceIndex('');
  }, [url]);

  // 当前选中的资源 Key 获取详情
  const { data: resourceDetail } = useRequest(
    async () => {
      if (selectedResourceIndex) {
        const res = await requestToBody(url + selectedResource.url);
        classifyPathsToTags(res.tags, res.paths);
        return res;
      }
      return null;
    },
    {
      refreshDeps: [selectedResource, url],
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
    urlRef,
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
