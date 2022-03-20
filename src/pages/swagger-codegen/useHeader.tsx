import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Dropdown, Input, Menu, Row } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { useModel } from 'umi';
import state from '@/stores/index';
import storage from '../../shared/storage';

const ApiSwitchHeader: React.FC = () => {
  const { fetchResources, resourcesLoading } = useModel('useApiSwitchModel');

  const swaggerStore = state.swagger;
  const { urlValue, apiUrls } = state.swagger;

  const menu = (
    <Menu>
      {apiUrls.map((apiUrl: string, i: number) => {
        return (
          <Menu.Item
            title={apiUrl}
            key={apiUrl}
            onClick={(event) => {
              swaggerStore.setUrlValue(event.key);
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
                  swaggerStore.setApiUrls(urls);
                  storage.set('storageUrls', urls);
                }}
              />
            </Row>
          </Menu.Item>
        );
      })}
    </Menu>
  );

  return (
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
            swaggerStore.setUrlValue((e.nativeEvent.target as any).value);
          }}
          placeholder="swagger 文档地址"
          defaultValue={urlValue}
          value={urlValue}
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
};
export default observer(ApiSwitchHeader);
