import React from 'react';
import { Card, Row, Col, Input, Button, Divider, Menu, MenuProps } from 'antd';
import useApiSwitchHeader from './useHeader';
import ApiTreeForm from './ApiTreeForm';
import { useModel } from 'umi';

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
  return (
    <Col style={ColMenuStyle} flex="20%">
      <Menu style={{ minHeight: '500px' }} onSelect={onSelect}>
        {data.map((item: any, index: number) => (
          <Menu.Item
            title={item[labelKey]}
            key={dataKey ? item[dataKey] : index}
          >
            {item[labelKey]}
          </Menu.Item>
        ))}
      </Menu>
    </Col>
  );
};

export default function ApiSwitch() {
  const { headerRender, resources, urlRef, type } = useApiSwitchHeader();

  const { setSelectedResourceIndex, resourceDetail } =
    useModel('useApiSwitchModel');

  console.log('resourceDetail: ', resourceDetail);

  return (
    <Card bodyStyle={{ padding: 0 }} title="接口代码生成器">
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
