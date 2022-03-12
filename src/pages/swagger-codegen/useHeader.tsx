import { Button, Col, Input, Radio, Row, Menu, Dropdown } from 'antd';
import React from 'react';
import { useModel } from 'umi';
import { CloseOutlined } from '@ant-design/icons';
import storage from '../../shared/storage';

export default function useApiSwitchHeader() {
  const {
    urlValue,
    setUrlValue,
    type,
    setType,
    apiUrls,
    setapiUrls,
    fetchResources,
    resources,
    resourcesLoading,
  } = useModel('useApiSwitchModel');

  // const { run: fetchBlocks, data: resources, loading } = useRequest(
  //   async () => {
  //     const res = await requestToBody(urlValue + '/swagger-resources')
  //     return res
  //   },
  //   {
  //     manual: true,
  //   }
  // )

  const menu = (
    <Menu>
      {apiUrls.map((apiUrl: string, i: number) => {
        return (
          <Menu.Item
            title={apiUrl}
            key={apiUrl}
            onClick={(event) => {
              setUrlValue(event.key);
            }}
          >
            <Row justify="space-between" align="middle">
              <span>{apiUrl}</span>
              <CloseOutlined
                className="dropdown-menu-item-icon"
                title="删除"
                onClick={(e) => {
                  e.stopPropagation();
                  const urls = [...apiUrls];
                  urls.splice(i, 1);
                  setapiUrls(urls);
                  storage.set('storageUrls', urls);
                }}
              />
            </Row>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  const headerRender = (
    <Row style={{ margin: '10px 10px 0' }} gutter={16}>
      <Col flex="none">
        <Button
          type="primary"
          loading={resourcesLoading}
          onClick={fetchResources}
        >
          获取
        </Button>
      </Col>
      <Col flex={1}>
        <Input
          onChange={(e) => {
            setUrlValue((e.nativeEvent.target as any).value);
          }}
          placeholder="swagger 文档地址"
          defaultValue={urlValue}
          value={urlValue}
          key={urlValue}
        />
      </Col>
      <Col flex="none">
        <Dropdown.Button overlay={menu} disabled={apiUrls.length <= 0}>
          历史接口
        </Dropdown.Button>
        {/* <Radio.Group
          disabled
          onChange={(e) => setType(e.target.value)}
          options={[{ label: '接口', value: 'api' }]}
          optionType="button"
          buttonStyle="solid"
          value={type}
        /> */}
      </Col>
    </Row>
  );

  return { headerRender, resources, urlValue, type };
}
