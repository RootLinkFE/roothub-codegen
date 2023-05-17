/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-04 15:39:44
 * @Description: 侧边菜单
 */
import { Col, Select, Menu, MenuProps, Input, Row, Spin, Button, Badge } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import React, { useCallback, useState } from 'react';
import { useMemo } from 'react';
import { useModel } from 'umi';
import { pathsItem, tagsItem } from '@/shared/ts/api-interface';
import { MethodColors } from '@/shared/common';
import { dataSaveToJSON } from '@/shared/utils';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import state from '@/stores/index';

const { Search } = Input;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  children?: MenuItem[],
  icon?: React.ReactNode,
  type?: 'group',
): MenuItem {
  return {
    key,
    label,
    children,
    icon,
    type,
  } as MenuItem;
}

const ResourcesTree: React.FC<{ labelKey: string } & MenuProps> = ({ labelKey }) => {
  const {
    selectedResourceIndex,
    setSelectedResourceIndex,
    selectedResource,
    fetchSelectedResource,
    resources,
    resourceDetail,
    resourceDetailLoading,
    type,
    selectedApi,
    setItemSelectedApi,
  } = useModel('useApiSwitchModel');

  const { urlValue } = state.swagger;

  // 搜索显示tags
  const [searchTags, setSearchTags] = useState<tagsItem[] | null>(null);

  // 当前显示tags
  const currentResourceTags: tagsItem[] = useMemo(() => {
    return searchTags ? searchTags : resourceDetail?.tags ?? [];
  }, [resourceDetail, searchTags]);

  // resourceDetail对应tag[paths] Map
  const resourceTagsMap: Map<string, pathsItem> = useMemo(() => {
    let hasMap = new Map();
    (resourceDetail?.tags ?? []).forEach((tag: tagsItem) => {
      tag.paths.forEach((v: pathsItem) => {
        hasMap.set(v.uuid, v);
      });
    });
    return hasMap;
  }, [resourceDetail]);

  /**
   * @description: 接口搜索
   * @param {string} val
   * @return {*}
   */
  const onSearch = (val: string) => {
    if (val === '') {
      setSearchTags(null);
    } else {
      const list: tagsItem[] = [];
      (resourceDetail?.tags ?? []).forEach((tag: tagsItem) => {
        const pathList = tag.paths.filter((v: pathsItem) => v.api.includes(val) || v.summary.includes(val));
        if (pathList.length > 0) {
          list.push({
            ...tag,
            paths: pathList,
          });
        }
      });
      setSearchTags(list);
    }
  };

  /**
   * @description: 列表、分页 显示过滤
   * @param {string} menuName
   * @return {HTMLElement}
   */
  const highlightMenuName: any = useCallback((menuName = '', labelKey = 'summary') => {
    const flag = /列表|分页/.test(menuName);
    if (!flag) {
      return menuName;
    }
    if (labelKey === 'summary') {
      const matchResult = menuName.match(/列表|分页/);
      if (!matchResult) {
        return menuName;
      }
      const arr = [menuName.substring(0, matchResult.index), menuName.substring((matchResult.index as number) + 2)];

      return (
        <>
          {arr[0]}
          <span style={{ color: 'rgb(255, 85, 0)' }}>{matchResult[0]}</span>
          {arr[1]}
        </>
      );
    }
    return menuName;
  }, []);

  /**
   * @description: menuItem点击回调
   * @param {item, key, keyPath, domEvent}
   */
  const onItemSelect = ({ key }: any) => {
    const current = resourceTagsMap.get(key);
    current && setItemSelectedApi(current);
  };

  // Menu Items
  const menuItems: MenuItem[] = useMemo(() => {
    return currentResourceTags.map((item: tagsItem, idx: number) => {
      let { name, paths = [] } = item;
      const nameLabel = (
        <Row justify="space-between" align="middle" wrap={false}>
          <div className="menu-item-title-content" title={name}>
            {name}
          </div>
          <ApiDefinitionDropdown api={item} isPaths />
          {paths && paths.length ? <Badge count={paths.length} style={{ backgroundColor: '#1890ff' }} /> : null}
        </Row>
      );
      return getItem(
        nameLabel,
        name,
        paths.map((row: pathsItem) => {
          return getItem(
            <span title={row.summary}>
              <span style={{ paddingRight: '10px', color: MethodColors[row.methodUpper] }}>{row.methodUpper}</span>
              {highlightMenuName(row.summary, labelKey)}
            </span>,
            row.uuid,
          );
        }),
      );
    });
  }, [currentResourceTags]);

  const defaultSelectedKeys = useMemo(() => {
    return selectedApi?.uuid ? [selectedApi?.uuid] : [];
  }, [selectedApi]);

  if (!resources || (type === 'api' && !resources.length)) {
    return null;
  } else {
    return (
      <Col flex="20%" className="resources-tree">
        <div>
          <Row align="middle" justify="center">
            <div style={{ flex: 1 }}>
              <Search placeholder="搜索接口（名称、api）" allowClear enterButton onSearch={onSearch} />
            </div>
            <Button
              type="text"
              size="small"
              title="下载openapi.json"
              disabled={resourceDetailLoading}
              onClick={() => {
                dataSaveToJSON(resourceDetail, selectedResource?.name || urlValue);
              }}
            >
              <DownloadOutlined />
            </Button>
          </Row>
          {type === 'api' && (
            <Row align="middle" style={{ flexWrap: 'nowrap' }}>
              <Select
                value={selectedResourceIndex}
                onSelect={setSelectedResourceIndex}
                className="docs-select"
                options={resources}
                fieldNames={{ label: 'name', value: 'location' }}
              ></Select>
              <Button
                type="text"
                size="small"
                title="刷新"
                disabled={resourceDetailLoading}
                onClick={() => {
                  fetchSelectedResource();
                }}
              >
                <ReloadOutlined />
              </Button>
            </Row>
          )}
        </div>
        {resourceDetailLoading ? (
          <Row align="middle" justify="center" style={{ width: '100%', height: '100px' }}>
            <Spin />
          </Row>
        ) : (
          <Menu mode="inline" items={menuItems} defaultSelectedKeys={defaultSelectedKeys} onClick={onItemSelect}></Menu>
        )}
      </Col>
    );
  }
};

export default ResourcesTree;
