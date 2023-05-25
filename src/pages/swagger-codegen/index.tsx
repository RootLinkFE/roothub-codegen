/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description: 主页
 */
import { SettingOutlined } from '@ant-design/icons';
import { Col, Button, Row, Tabs, Dropdown, Menu } from 'antd';
import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useModel } from 'umi';
import ApiDetail from './ApiDetail';
import ApiSwitchHeader from './useHeader';
import ResourcesTree from './ResourcesTree';
import { pathsItem, tagsItem } from '@/shared/ts/api-interface';
import CustomMethodsDrawer from './CustomMethodsDrawer';
import ApiurlPrefixDrawer from './ApiurlPrefixDrawer';
import DefaultDrawer from '@/components/DefaultDrawer';
import ExtractTextContext from './ExtractTextContext';
import ModelCodeDrawer from './ModelCodeDrawer';
import BaseConfigDrawer from './BaseConfigDrawer';
import getResponseParams from '@/shared/getResponseParams';
import state from '@/stores/index';
import useBus from '@/shared/useBus';
import { flatChildren } from '@/shared/utils';
import { trancodingOptions, CodeGenerateOption } from './code-generate/index';
import SearchFixedBox from './components/SearchFixedBox';

const { TabPane } = Tabs;

export default function ApiSwitch() {
  const {
    resources,
    selectedApi,
    setSelectedApi,
    setItemSelectedApi,
    selectedApiMaps,
    selectedApiRows,
    setSelectedApiRows,
    resourceDetail,
    searchTags,
    setDefinitionCodeDrawerProps,
    apiurlPrefix,
  } = useModel('useApiSwitchModel');
  const settings = state.settings;

  const handleActiveTextMatchCode = () => {
    const { baseCode, Settings } = settings;
    const { matchCodeStatus, matchCodeFnKey } = Settings;
    if (!selectedApi || !matchCodeStatus || !matchCodeFnKey) return;
    // 确保已选择api详情，开启方法触发，及已设置处理方法

    let transcodingOption: CodeGenerateOption | undefined = trancodingOptions.find(
      (v: CodeGenerateOption) => v.key === matchCodeFnKey,
    );
    if (transcodingOption) {
      const transcodingFn = transcodingOption.function;
      const responseParamsData = flatChildren(getResponseParams(selectedApi, resourceDetail)); // 扁平化ResponseParams
      setDefinitionCodeDrawerProps({
        title: transcodingOption.label || '匹配代码生成',
        visible: true,
        language: 'javascript',
        generateCode: () => transcodingFn({ responseParamsData, baseCode }),
      });
    }
  };

  // 事件汇总收集activeTextMatchCode触发
  useBus(
    'activeTextMatchCode',
    () => {
      handleActiveTextMatchCode();
    },
    [selectedApi],
  );

  const [customMethodsVisible, setCustomMethodsVisible] = useState<boolean | undefined>(false);
  const [apiurlPrefixVisible, setApiurlPrefixVisible] = useState<boolean | undefined>(false);
  const [extractTextVisible, setExtractTextVisible] = useState<boolean | undefined>(false);
  const [configVisible, setConfigVisible] = useState<boolean | undefined>(false);

  // ResourcesTree-当前显示tags
  const currentResourceTags: tagsItem[] = useMemo(() => {
    return searchTags ? searchTags : resourceDetail?.tags ?? [];
  }, [resourceDetail, searchTags]);

  // 即时搜索匹配url字符，触发自动查找api功能并选中
  const handleUrlTextChange = (urlText: string): boolean => {
    let reg = new RegExp(`^${apiurlPrefix}`);
    if (reg.test(urlText)) {
      // 去除api默认前缀
      urlText = urlText.replace(reg, '');
    }

    if (selectedApi?.api === urlText) {
      return true;
    } else {
      const item = selectedApiRows.find((v) => v.api === urlText);
      if (item) {
        tabChange(item.uuid);
        return true;
      } else {
        const paths = currentResourceTags.reduce((pre: any, cur: any) => {
          return [...pre, ...cur?.paths];
        }, []);
        const pathItem = paths.find((v) => v.api === urlText);
        if (pathItem) {
          setItemSelectedApi(pathItem);
        }
      }
    }

    return true;
  };

  const blockContent = useMemo(
    () => (
      <Row align="middle" style={{ marginLeft: '20px', minWidth: '260px', paddingTop: '10px' }}>
        <h2>OpenApi-CodeGen</h2>
      </Row>
    ),
    [],
  );

  const settingDropdownMenuClick = useCallback(({ key }) => {
    switch (key) {
      case 'customMethods':
        setCustomMethodsVisible(!customMethodsVisible);
        return;
      case 'apiurlPrefix':
        setApiurlPrefixVisible(!apiurlPrefixVisible);
        return;
      case 'config':
        setConfigVisible(!configVisible);
        return;
    }
  }, []);

  const settingDropdownMenu = useMemo(() => {
    return (
      <Menu
        onClick={settingDropdownMenuClick}
        items={[
          {
            label: '设置自定义方法',
            key: 'customMethods',
            children: undefined,
          },
          {
            label: 'apiurl默认前缀',
            key: 'apiurlPrefix',
            children: undefined,
          },
          {
            label: '基础设置',
            key: 'config',
            children: undefined,
          },
        ]}
      />
    );
  }, []);

  const tabActiveKey = useMemo(() => selectedApi?.uuid ?? '', [selectedApi]);
  const tabChange = (v: string) => {
    const item = selectedApiMaps.get(v);
    if (item) {
      setSelectedApi(item);
    }
  };
  const tabEdit = (
    key: string | React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>,
    action: string,
  ) => {
    if (action === 'remove') {
      let index = selectedApiRows.findIndex((v: pathsItem) => v.uuid === key);
      if (index !== -1) {
        selectedApiRows.splice(index, 1);
      }
      setSelectedApi(selectedApiRows.length > 0 ? selectedApiRows[selectedApiRows.length - 1] : null);
      setSelectedApiRows([...selectedApiRows]);
      selectedApiMaps.delete(key as string);
    }
  };

  return (
    <Row className="codegen-main defaultColor" wrap={false}>
      <div style={{ margin: 0 }}>
        <Row justify="space-between">
          {blockContent}
          {/* <Button
            type="link"
            onClick={() => {
              console.log('change');
              const finalColor = themeType === 'default' ? 'dark' : 'default';
              setThemeType(finalColor);
              setThemeColor(finalColor);
            }}
          >
            {themeType === 'default' ? '暗黑' : '默认'}
          </Button> */}
          <Col style={{ padding: '10px' }}>
            <Dropdown overlay={settingDropdownMenu} trigger={['hover']}>
              <Button type="text" icon={<SettingOutlined />} title="设置"></Button>
            </Dropdown>
            <Button
              type="text"
              title="上传图片提取文本，生成代码"
              onClick={() => {
                setExtractTextVisible(true);
              }}
            >
              提取
            </Button>
          </Col>
        </Row>
        <ApiSwitchHeader />
      </div>
      <Row wrap={false} style={{ paddingTop: '10px', flex: 1 }}>
        {/* 资源列表 */}
        {resources && <ResourcesTree labelKey="name" />}
        <Col flex="auto">
          <Tabs
            activeKey={tabActiveKey}
            type="editable-card"
            onChange={tabChange}
            onEdit={tabEdit}
            className="api-detail-tabs"
          >
            {selectedApiRows.map((item: pathsItem) => {
              return (
                <TabPane tab={item.summary} key={item.uuid}>
                  <ApiDetail api={item} />
                </TabPane>
              );
            })}
          </Tabs>
        </Col>
        <CustomMethodsDrawer
          visible={customMethodsVisible}
          onClose={() => {
            setCustomMethodsVisible(false);
          }}
        />
        <ApiurlPrefixDrawer
          visible={apiurlPrefixVisible}
          onClose={() => {
            setApiurlPrefixVisible(false);
          }}
        />
        <DefaultDrawer
          visible={extractTextVisible}
          title="提取转换"
          onClose={() => {
            setExtractTextVisible(false);
          }}
        >
          <ExtractTextContext></ExtractTextContext>
        </DefaultDrawer>
        <BaseConfigDrawer
          visible={configVisible}
          onClose={() => {
            setConfigVisible(false);
          }}
        />
      </Row>

      <ModelCodeDrawer />

      <SearchFixedBox onUrlTextChange={handleUrlTextChange} />
    </Row>
  );
}
