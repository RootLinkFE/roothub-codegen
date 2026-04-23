/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 13:50:44
 * @Description: api方法下拉代码生成
 */
import { Dropdown, Menu, Button } from 'antd';
import CodeOutlined from '@ant-design/icons/lib/icons/CodeOutlined';
import DownloadOutlined from '@ant-design/icons/lib/icons/DownloadOutlined';
import { useModel } from 'umi';
import { useMemo } from 'react';
import state from '@/stores/index';
import { getStringToFn, getRequestParams, filterTransResult, dataSaveToJSON } from '@/shared/utils';
import getResponseParams from '@/shared/getResponseParams';
import { CustomMethodsItem } from '@/shared/ts/custom';
import { codeGenerateMethods } from './code-generate/index';
import { observer } from 'mobx-react-lite';
import { translateZhToEn } from '@/shared/baidu-translate';
import { isInVSCode, saveFileInVSCode } from '@/shared/vscode';
import { cloneDeep } from 'lodash';

const ApiDefinitionDropdown: React.FC<{
  api: any;
  methodType?: string;
  dropdownTitle?: string;
  buttonType?: 'link' | 'text' | 'dashed' | 'default' | 'ghost' | 'primary' | undefined;
  onChange?: (key: string, item?: CustomMethodsItem | undefined) => void;
  isPaths?: boolean; // 是否Paths循环生成
}> = function (props) {
  const { api, dropdownTitle = '代码生成', methodType = 'api', buttonType = 'link', onChange, isPaths } = props;

  const generateMethods = codeGenerateMethods
    .filter((v) => v.type === methodType && v.status)
    .sort((a, b) => b.sort - a.sort);
  const { setDefinitionCodeDrawerProps, resourceDetail, apiurlPrefix } = useModel('useApiSwitchModel');

  const CustomMethods = useMemo(
    () => Array.from(state.custom.EnabledCustomMethods),
    [state.custom.EnabledCustomMethods],
  );

  const prefix = useMemo(() => {
    // 默认前缀 + basePath
    return `${apiurlPrefix}${resourceDetail?.basePath}`;
  }, [apiurlPrefix, resourceDetail]);

  const items = useMemo(() => {
    let currentCustomMethods = CustomMethods.filter((v: CustomMethodsItem) => v.type === methodType);
    return [
      {
        key: 'root',
        label: 'root',
        type: 'group',
        children: generateMethods.map((v) => {
          return {
            key: v.key,
            label: v.label,
          };
        }),
      },
      currentCustomMethods.length > 0
        ? {
            key: 'custom',
            label: 'custom',
            type: 'group',
            children: currentCustomMethods,
          }
        : null,
      isPaths
        ? {
            key: 'paths',
            label: 'paths',
            type: 'group',
            children: [
              {
                key: 'download-json',
                label: (
                  <span>
                    <DownloadOutlined /> {`下载${api.name || '模块'}.json`}
                  </span>
                ),
              },
            ],
          }
        : null,
    ];
  }, [CustomMethods, isPaths]);

  const requestParams = getRequestParams(api, resourceDetail);

  const handleMenuItemClick = async ({ key }: any) => {
    let drawerProps = {
      title: '',
      visible: true,
      language: 'javascript',
      generateCode: () => {},
    };
    const generateMethod: any = generateMethods.find((v) => v.key === key);
    if (isPaths) {
      if (key === 'download-json') {
        const { name, paths } = api;
        console.log('name', name, api);
        const filteredDetail = cloneDeep(resourceDetail);
        if (filteredDetail) {
          // Filter paths
          const filteredPaths: any = {};
          const usedDefinitionNames = new Set<string>();
          const collectDefinitionRefs = (obj: any) => {
            if (!obj) return;
            if (typeof obj !== 'object') return;
            if (Array.isArray(obj)) {
              obj.forEach((item) => collectDefinitionRefs(item));
              return;
            }
            for (const [key, value] of Object.entries(obj)) {
              if (key === '$ref' && typeof value === 'string') {
                const match = value.match(/^#\/definitions\/(.+)$/);
                if (match) {
                  usedDefinitionNames.add(match[1]);
                }
              } else if (typeof value === 'object') {
                collectDefinitionRefs(value);
              }
            }
          };
          paths.forEach((p: any) => {
            const { api: pathKey, method } = p;
            if (!filteredPaths[pathKey]) {
              filteredPaths[pathKey] = {};
            }
            if (resourceDetail.paths[pathKey] && resourceDetail.paths[pathKey][method]) {
              const methodObj = resourceDetail.paths[pathKey][method];
              filteredPaths[pathKey][method] = methodObj;
              collectDefinitionRefs(methodObj);
            }
          });
          filteredDetail.paths = filteredPaths;
          // Filter tags
          if (filteredDetail.tags) {
            filteredDetail.tags = filteredDetail.tags.filter((t: any) => t.name === name);
          }
          // Filter definitions
          if (filteredDetail.definitions) {
            const allRefs = Array.from(usedDefinitionNames);
            const filteredDefinitions: any = {};
            const visited = new Set<string>();
            const queue: string[] = [...allRefs];
            while (queue.length > 0) {
              const ref = queue.shift()!;
              if (visited.has(ref)) continue;
              visited.add(ref);
              if (filteredDetail.definitions[ref]) {
                filteredDefinitions[ref] = filteredDetail.definitions[ref];
                const def = filteredDetail.definitions[ref];
                if (def.properties) {
                  for (const prop of Object.values(def.properties)) {
                    collectDefinitionRefs(prop);
                    const propRef = (prop as any)?.$ref;
                    if (propRef && typeof propRef === 'string') {
                      const match = propRef.match(/^#\/definitions\/(.+)$/);
                      if (match && !visited.has(match[1])) {
                        queue.push(match[1]);
                      }
                    }
                  }
                }
                if (
                  def.additionalProperties &&
                  typeof def.additionalProperties === 'object' &&
                  (def.additionalProperties as any).$ref
                ) {
                  const additionalRef = (def.additionalProperties as any).$ref;
                  const match = additionalRef.match(/^#\/definitions\/(.+)$/);
                  if (match && !visited.has(match[1])) {
                    queue.push(match[1]);
                  }
                }
              }
            }
            filteredDetail.definitions = filteredDefinitions;
          }

          // Download logic
          const filename = `${name || 'module'}.json`;
          if (isInVSCode) {
            try {
              await saveFileInVSCode({ filename, content: JSON.stringify(filteredDetail, null, 2), subdir: 'openapi' });
              return;
            } catch (e) {
              console.log('saveFileInVSCode error', e);
            }
          }
          dataSaveToJSON(filteredDetail, name || 'module');
        }
        return;
      }

      if (methodType === 'api') {
        drawerProps.title = api?.summary || '';
        const { paths } = api;
        let apiFn: any = () => {};
        if (generateMethod) {
          apiFn = generateMethod.function;
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          apiFn = item?.function ? getStringToFn(item.function) : () => {};
        }
        drawerProps.generateCode = () => {
          let resultText = '';
          paths.forEach((m: any) => {
            const curRequestParams = m.requestParams || getRequestParams(m, resourceDetail);
            const curResponseParams = m.responseParams || getResponseParams(m, resourceDetail);
            resultText +=
              apiFn({ ...m, requestParams: curRequestParams, responseParams: curResponseParams }, prefix) +
              `
`;
          });
          return resultText;
        };

        setDefinitionCodeDrawerProps(drawerProps);
      }
    } else {
      if (methodType === 'api') {
        drawerProps.title = api?.summary || '';
        if (generateMethod) {
          drawerProps.generateCode = () => generateMethod.function({ ...api, requestParams }, prefix);
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
          drawerProps.generateCode = () => cutomCodeFn({ ...api, requestParams }, prefix);
        }
        setDefinitionCodeDrawerProps(drawerProps);
      } else if (methodType === 'text') {
        const value = api;
        drawerProps.title = JSON.stringify(value) || '';
        let translateReault = new Map<string, string>();
        const res = await translateZhToEn(value.join('\n'));
        if (res) {
          translateReault = filterTransResult(res?.trans_result || []);
        }
        if (generateMethod) {
          drawerProps.generateCode = () => generateMethod.function(value, translateReault);
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
          drawerProps.generateCode = () => cutomCodeFn(value, translateReault);
        }
        setDefinitionCodeDrawerProps(drawerProps);
      } else {
        if (onChange) {
          let item: any = generateMethods.find((v) => v.key === key);
          if (item) {
            onChange(key, { ...item });
          } else {
            item = CustomMethods.find((v) => v.key === key);
            onChange(key, { ...item });
          }
        }
      }
    }
  };

  const dropdownMenu = useMemo(() => {
    const validGroups = (items ?? []).filter(Boolean) as any[];
    return (
      <Menu onClick={handleMenuItemClick}>
        {validGroups.map((group: any) => {
          const children = group?.children ?? [];
          return (
            <Menu.ItemGroup key={group.key} title={group.label}>
              {children.map((child: any) => {
                return <Menu.Item key={child.key}>{child.label}</Menu.Item>;
              })}
            </Menu.ItemGroup>
          );
        })}
      </Menu>
    );
  }, [items]);

  return (
    <Dropdown overlay={dropdownMenu} trigger={['hover']}>
      {isPaths ? (
        <CodeOutlined title={dropdownTitle} />
      ) : (
        <Button type={buttonType}>
          <CodeOutlined /> {dropdownTitle}
        </Button>
      )}
    </Dropdown>
  );
};

export default observer(ApiDefinitionDropdown);
