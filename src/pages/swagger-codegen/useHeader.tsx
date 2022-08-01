/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-27 17:16:27
 * @Description:
 */
import { CloseOutlined } from '@ant-design/icons';
import { Button, Col, Dropdown, Input, Menu, Row } from 'antd';
import { observer } from 'mobx-react';
import React from 'react';
import { useModel } from 'umi';
import state from '@/stores/index';
import storage from '@/shared/storage';

const ApiSwitchHeader: React.FC = () => {
  const { fetchResources, resourcesLoading } = useModel('useApiSwitchModel');

  const swaggerStore = state.swagger;
  const { urlValue, apiUrls } = state.swagger;

  const handleApiUrlDelete = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, i: number) => {
    e.stopPropagation();
    const urls = [...swaggerStore.apiUrls];
    urls.splice(i, 1);
    swaggerStore.setApiUrls(urls);
    storage.set('storageUrls', urls);
  };

  const inputKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      fetchResources();
    }
  };

  const menu = (
    <Menu
      items={apiUrls.map((apiUrl: string, i: number) => {
        return {
          label: (
            <Row justify="space-between" align="middle">
              <span>{apiUrl}</span>
              <CloseOutlined
                className="dropdown-menu-item-icon"
                title="删除"
                onClick={(e) => {
                  handleApiUrlDelete(e, i);
                }}
              />
            </Row>
          ),
          key: apiUrl,
        };
      })}
      onClick={(event) => {
        swaggerStore.setUrlValue(event.key);
      }}
    ></Menu>
  );

  return (
    <Row style={{ margin: '10px 10px 0' }} gutter={16}>
      <Col flex="none">
        <Button type="primary" loading={resourcesLoading} onClick={fetchResources}>
          获取
        </Button>
      </Col>
      <Col flex={1}>
        <Input
          onChange={(e) => {
            swaggerStore.setUrlValue((e.nativeEvent.target as any).value);
          }}
          onKeyDown={inputKeyDown}
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
