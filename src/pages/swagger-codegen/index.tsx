/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description: 主页
 */
import { isInVSCode } from '@/shared/vscode';
import { InfoCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Col, Button, Popover, Row, Typography, Tabs, Dropdown, Menu } from 'antd';
import React, { useCallback, useState, useMemo } from 'react';
import { useModel } from 'umi';
import ApiDetail from './ApiDetail';
import ApiSwitchHeader from './useHeader';
import ResourcesTree from './ResourcesTree';
import { pathsItem } from '@/shared/ts/api-interface';
import CustomMethodsDrawer from './CustomMethodsDrawer';

const { TabPane } = Tabs;

export default function ApiSwitch() {
  const { resources, selectedApi, setSelectedApi, selectedApiMaps, selectedApiRows, setSelectedApiRows } =
    useModel('useApiSwitchModel');

  const [customMethodsVisible, setCustomMethodsVisible] = useState<boolean | undefined>(false);

  const blockContent = useMemo(
    () => (
      <Popover
        title="CodeGen使用说明"
        placement="topLeft"
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
        <Row align="middle" style={{ marginLeft: '20px', width: '460px', paddingTop: '10px' }}>
          <h2>CodeGen</h2>
          <InfoCircleOutlined style={{ marginLeft: '8px' }} />
        </Row>
      </Popover>
    ),
    [],
  );

  const settingDropdownMenuClick = useCallback(
    ({ key }) => {
      switch (key) {
        case 'customMethods':
          setCustomMethodsVisible(!customMethodsVisible);
      }
    },
    [customMethodsVisible],
  );

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
          </Col>
        </Row>
        <ApiSwitchHeader />
      </div>
      <Row wrap={false} style={{ paddingTop: '10px', flex: 1 }}>
        {/* 资源列表 */}
        {resources && <ResourcesTree labelKey="name" />}
        <Col flex="80%">
          <Tabs activeKey={tabActiveKey} type="editable-card" onChange={tabChange} onEdit={tabEdit}>
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
      </Row>
    </Row>
  );
}
