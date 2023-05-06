/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-04 15:45:10
 * @Description: 基础设置抽屉弹窗
 */
import { observer } from 'mobx-react-lite';
import { Drawer, DrawerProps, Form, Input, Button } from 'antd';
import state from '@/stores/index';
import { Settings } from '@/shared/ts/settings';

const ApiurlPrefixDrawer: React.FC<DrawerProps> = (props) => {
  const { Settings } = state.settings;

  const { ...drawerProps } = props;
  const [form] = Form.useForm();
  // const themOptions: any = [];

  const handleSubmit = (values: Settings) => {
    state.settings.setSettings({ ...Settings, ...values });
  };

  const itemCol = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
  };

  return (
    <Drawer
      width="70%"
      bodyStyle={{ padding: 16 }}
      title="基础设置"
      {...drawerProps}
      zIndex={200}
      destroyOnClose={true}
    >
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ ...Settings }}
        onFinish={handleSubmit}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Form.Item label="百度翻译appid" name="baiduTransAppid" {...itemCol}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="百度翻译secrect" name="baiduTransSecret" {...itemCol}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="百度API-token" name="baiduApiToken" {...itemCol}>
          <Input></Input>
        </Form.Item>
        {/* <Form.Item label="主题" name="them">
          <Select style={{ width: '150px' }} options={themOptions}></Select>
        </Form.Item>
        <Form.Item label="识别语言" name="language" labelCol={{ span: 8 }}>
          <Input></Input>
        </Form.Item> */}
        <Form.Item wrapperCol={{ offset: 4, span: 16 }}>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default observer(ApiurlPrefixDrawer);
