/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 11:51:08
 * @Description: 新增、编辑自定义方法抽屉
 */
import { Button, Drawer, DrawerProps, message, Form, Input, Select } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import state from '@/stores/index';
import { CustomMethodsItem } from '@/shared/ts/custom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { MethodTypes } from '@/shared/common';
const { Option } = Select;

const EditCustomMethodDrawer: React.FC<
  { data: CustomMethodsItem | undefined; onClose: (event?: boolean) => void } & DrawerProps
> = (props) => {
  const { data, onClose, ...drawerProps } = props;
  const [form] = Form.useForm();

  const { CustomMethods } = state.custom;

  const [currentState, setCurrentState] = useState({
    title: '自定义方法',
    type: '',
  });

  useEffect(() => {
    if (drawerProps.visible) {
      setCurrentState({
        title: `${data ? '编辑' : '新增'}自定义方法`,
        type: data ? 'EDIT' : 'ADD',
      });
      if (data) {
        form.setFieldsValue({ ...data });
      }
    }
    // console.log('drawerProps.visible', data, currentState, drawerProps.visible);
  }, [drawerProps.visible]);

  const editorHeight = useMemo(() => {
    const height = window.innerHeight - 400;
    return height < 300 ? 300 : height;
  }, [window.innerHeight]);

  const submit = useCallback(
    (values: any) => {
      const list = [...CustomMethods];
      let text = '';
      const index = list.findIndex((v: CustomMethodsItem) => {
        return values.key === v.key;
      });
      if (currentState.type === 'ADD') {
        if (index !== -1) {
          message.error('key值已被使用，请修改');
          return false;
        }
        text = '新增';
        list.push(values);
      } else if (currentState.type === 'EDIT') {
        text = '编辑';
        list[index] = values;
      }
      state.custom.setCustomMethods(list);
      clearFormData();
      onClose(true);
      message.success(`${text}成功！`);
    },
    [currentState, CustomMethods],
  );

  const clearFormData = () => {
    form.setFieldsValue({
      key: '',
      label: '',
      type: '',
      function: '',
      description: '',
    });
  };

  return (
    <Drawer
      width="80%"
      bodyStyle={{ padding: 16 }}
      title={currentState.title}
      {...drawerProps}
      zIndex={300}
      destroyOnClose={true}
      footer={false}
      onClose={() => {
        onClose(false);
        clearFormData();
      }}
    >
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
        initialValues={{ remember: true }}
        onFinish={submit}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Form.Item label="键值" name="key" rules={[{ required: true, message: '请输入键值，输入英文，不可重复使用' }]}>
          <Input disabled={currentState.type === 'EDIT'} max-length="20" />
        </Form.Item>

        <Form.Item label="名称" name="label" rules={[{ required: true, message: '请输入名称' }]}>
          <Input max-length="20" />
        </Form.Item>

        <Form.Item label="类型" name="type" rules={[{ required: true, message: '请选择类型' }]}>
          <Select>
            {MethodTypes.map((v: string) => {
              return (
                <Option value={v} key={v}>
                  {v}
                </Option>
              );
            })}
          </Select>
        </Form.Item>

        <Form.Item label="方法" name="function" rules={[{ required: true, message: '请编写方法' }]}>
          <CodeMirror theme="light" height={editorHeight + 'px'} extensions={[javascript({ typescript: true })]} />
        </Form.Item>

        <Form.Item label="描述" name="description">
          <Input max-length="200" />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
          <Button type="primary" htmlType="submit" title="添加自定义方法">
            保存
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default EditCustomMethodDrawer;
