/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-27 17:16:27
 * @Description:
 */
import { CloseOutlined } from '@ant-design/icons';
import { isInVSCode } from '@/shared/vscode';
import { Button, Col, Dropdown, Input, Menu, Row, Popover, Typography } from 'antd';
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
        <Popover
          placement="topLeft"
          trigger="click"
          content={
            <Typography.Paragraph>
              通过Swagger文档地址获取api列表，只需要填写
              <Typography.Text keyboard>doc.html</Typography.Text>
              前一部分地址。 <br />
              比如
              <Typography.Text keyboard>http://xxx-dev.leekhub.com/order-server/doc.html</Typography.Text>
              地址，就输入
              <Typography.Text keyboard>http://xxx-dev.leekhub.com/order-server</Typography.Text>
              <br />
              也支持openApi内容格式的
              <Typography.Text keyboard>json、yaml文件</Typography.Text>
              {!isInVSCode && (
                <div style={{ marginTop: '20px' }}>
                  Web网页存在跨域问题，推荐使用VSCode插件：
                  <a
                    href="https://marketplace.visualstudio.com/items?itemName=giscafer.roothub"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    点击安装
                  </a>
                </div>
              )}
            </Typography.Paragraph>
          }
        >
          <Input
            onChange={(e) => {
              swaggerStore.setUrlValue((e.nativeEvent.target as any).value);
            }}
            onKeyDown={inputKeyDown}
            placeholder="输入接口文档url，如swagger"
            defaultValue={urlValue}
            value={urlValue}
          />
        </Popover>
      </Col>
      <Col flex="none">
        <Dropdown.Button overlay={menu} disabled={apiUrls.length <= 0}>
          历史接口
        </Dropdown.Button>
      </Col>
    </Row>
  );
};
export default observer(ApiSwitchHeader);
