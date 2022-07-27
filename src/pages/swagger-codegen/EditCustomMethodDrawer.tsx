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
import { getStringToFn } from '@/shared/utils';
import { codeGenerateMethods } from './code-generate/index';
import { CodeMirrorTypes } from '@/shared/common';
const { Option } = Select;

const EditCustomMethodDrawer: React.FC<
  { data: CustomMethodsItem | undefined; type: string; onClose: (event?: boolean) => void } & DrawerProps
> = (props) => {
  const { data, type, onClose, ...drawerProps } = props;
  const [form] = Form.useForm();
  const rootDataSource = codeGenerateMethods.map((v) => {
    return {
      ...v,
      function: v.function.toString(),
    };
  });
  const methodList = useMemo(() => {
    return [...state.custom.CustomMethods, ...rootDataSource];
  }, [state.custom.CustomMethods]);

  const [currentState, setCurrentState] = useState({
    title: '自定义方法',
    type: type,
  });

  useEffect(() => {
    if (drawerProps.visible) {
      setCurrentState({
        title: `${data ? '编辑' : '新增'}自定义方法`,
        type: type,
      });
      if (data) {
        form.setFieldsValue({ ...data });
      }
    }
  }, [drawerProps.visible, type]);

  const editorHeight = useMemo(() => {
    const height = window.innerHeight - 430;
    return height < 300 ? 300 : height;
  }, [window.innerHeight]);

  const validateKey = (rule: any, value: any, callback: any) => {
    if (value) {
      const index = methodList.findIndex((v: CustomMethodsItem) => {
        return value === v.key;
      });
      if (index !== -1) {
        callback(new Error('键值已被使用，请修改'));
      } else {
        callback();
      }
    }
  };

  const filterFunction = (fn: any) => {
    try {
      return Object.prototype.toString.call(getStringToFn(fn)) === '[object Function]';
    } catch (error) {
      return false;
    }
  };

  const submit = useCallback(
    (values: any) => {
      if (!filterFunction(values.function)) {
        message.error('方法-校验是否函数未通过！');
        return false;
      }
      const list = [...state.custom.CustomMethods];
      let text = '';
      const index = list.findIndex((v: CustomMethodsItem) => {
        return values.key === v.key;
      });
      if (currentState.type === 'ADD' || currentState.type === 'COPY') {
        text = '新增';
        list.push({ ...values, source: 'custom' });
      } else if (currentState.type === 'EDIT') {
        text = '编辑';
        list[index] = { ...values, source: 'custom' };
      }
      state.custom.setCustomMethods(list);
      clearFormData();
      onClose(true);
      message.success(`${text}成功！`);
    },
    [currentState],
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
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 20 }}
        initialValues={{ remember: true }}
        onFinish={submit}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Form.Item
          label="键值"
          name="key"
          rules={[{ required: true, message: '请输入键值，输入英文，不可重复使用' }, { validator: validateKey }]}
        >
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

        <Form.Item label="语言" name="language" rules={[{ required: true, message: '请选择语言' }]}>
          <Select defaultValue={'javascript'}>
            {CodeMirrorTypes.map((v: string) => {
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
