import React, { useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Input,
  Typography,
  Divider,
  Menu,
  MenuProps,
  Popover,
} from 'antd';
import useApiSwitchHeader from './useHeader';
import ApiTreeForm from './ApiTreeForm';
import { useModel } from 'umi';
import { InfoCircleOutlined } from '@ant-design/icons';

const ColMenuStyle = {
  height: '500px',
  overflow: 'auto',
};

const TDivider = () => (
  <Divider
    style={{
      marginTop: '10px',
      marginRight: '-12px',
      marginLeft: '-12px',
      marginBottom: '0',
    }}
  />
);

export const ResourcesTree: React.FC<
  { data: any[]; dataKey?: string; labelKey: string } & MenuProps
> = (props) => {
  const { data, dataKey, onSelect, labelKey } = props;
  if (!data) {
    return null;
  }

  const highlightMenuName: any = useCallback(
    (menuName = '', labelKey = 'summary') => {
      const flag = /列表|分页/.test(menuName);
      if (!flag) {
        return menuName;
      }
      if (labelKey === 'summary') {
        const matchResult = menuName.match(/列表|分页/);
        if (!matchResult) {
          return menuName;
        }
        const arr = [
          menuName.substring(0, matchResult.index),
          menuName.substring((matchResult.index as number) + 2),
        ];

        return (
          <>
            {arr[0]}
            <span style={{ color: 'rgb(255, 85, 0)' }}>{matchResult[0]}</span>
            {arr[1]}
          </>
        );
      }
      return menuName;
    },
    [],
  );

  return (
    <Col style={ColMenuStyle} flex="20%">
      <Menu style={{ minHeight: '500px' }} onSelect={onSelect}>
        {data.map((item: any, index: number) => {
          let menuName = item[labelKey];

          return (
            <Menu.Item
              title={item[labelKey]}
              key={dataKey ? item[dataKey] : index}
            >
              {highlightMenuName(menuName, labelKey)}
            </Menu.Item>
          );
        })}
      </Menu>
    </Col>
  );
};

export default function ApiSwitch() {
  const { headerRender, resources, urlRef, type } = useApiSwitchHeader();

  const { setSelectedResourceIndex, resourceDetail } =
    useModel('useApiSwitchModel');

  // console.log('resourceDetail: ', resourceDetail);

  const blockContent = useMemo(
    () => (
      <Popover
        title="使用说明"
        placement="topLeft"
        content={
          <Typography.Paragraph>
            <blockquote>
              通过Swagger文档地址获取api列表，只需要填写
              <Typography.Text keyboard>doc.html</Typography.Text>
              前一部分地址。 <br />
              比如
              <Typography.Text keyboard>
                http://model-server.qa.leekhuub.com/frame-pmt/doc.html
              </Typography.Text>
              地址，就输入
              <Typography.Text keyboard>
                http://model-server.qa.leekhub.com/frame-pmt
              </Typography.Text>
            </blockquote>
            1、注意https和http的情况，对应swagger
            api域名协议本工具的http协议保持一致！
            <br />
            2、一般都会有跨域问题，建议安装跨域插件，启用跨域再使用：
            <a
              href="https://chrome.google.com/webstore/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=zh"
              target="_blank"
            >
              Allow CORS: Access-Control-Allow-Origin
            </a>
          </Typography.Paragraph>
        }
      >
        <div style={{ marginLeft: '20px', width: '120px', marginTop: '10px' }}>
          使用说明
          <InfoCircleOutlined style={{ marginLeft: '8px' }} />
        </div>
      </Popover>
    ),
    [],
  );

  return (
    <Card bodyStyle={{ padding: 0 }} title="接口代码生成器">
      {blockContent}
      {headerRender}
      <TDivider />
      <div>
        <Row>
          {/* 资源列表 */}
          <ResourcesTree
            onSelect={({ key }) => setSelectedResourceIndex(key)}
            data={resources}
            labelKey="name"
          />
          {/* 资源分类列表或模型列表 */}
          {/* {resourceDetail && (
            <Col style={ColMenuStyle} flex="20%">
              {type === 'api' ? (
                <ResourcesTree data={resourceDetail.tags} labelKey="name" />
              ) : (
                <ResourcesTree
                  data={Object.values(resourceDetail.definitions)}
                  dataKey="title"
                  labelKey="title"
                />
              )}
            </Col>
          )} */}
          {type === 'api' && <ApiTreeForm resourceDetail={resourceDetail} />}
        </Row>
      </div>
    </Card>
  );
}