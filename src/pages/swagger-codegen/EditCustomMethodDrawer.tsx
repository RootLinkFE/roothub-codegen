/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 11:51:08
 * @Description: 新增、编辑自定义方法抽屉
 */
import { Button, Drawer, DrawerProps, message, Form, Input, InputNumber, Select, Row, Col } from 'antd';
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
  const rootDataSource = codeGenerateMethods
    .filter((v) => v.status)
    .map((v) => {
      return {
        ...v,
        function: v.function.toString(),
      };
    });
  const methodList = useMemo(() => {
    return [...state.custom.EnabledCustomMethods, ...rootDataSource];
  }, [state.custom.EnabledCustomMethods]);

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
    const height = window.innerHeight - 400;
    return height < 300 ? 300 : height;
  }, [window.innerHeight]);

  const validateKey = (rule: any, value: any, callback: any) => {
    if (value && type !== 'EDIT') {
      const index = methodList.findIndex((v: CustomMethodsItem) => {
        return value === v.key;
      });
      if (index !== -1) {
        callback(new Error('键值已被使用，请修改'));
      } else {
        callback();
      }
    } else {
      callback();
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
      const list = [...state.custom.EnabledCustomMethods];
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
      state.custom.setCustomMethods(list.sort((a, b) => b.sort - a.sort));
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

  const itemCol = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
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
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ remember: true, language: 'javascript', status: 1 }}
        onFinish={submit}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item
              label="键值"
              name="key"
              {...itemCol}
              rules={[{ required: true, message: '请输入键值，输入英文，不可重复使用' }, { validator: validateKey }]}
            >
              <Input disabled={currentState.type === 'EDIT'} max-length="20" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="名称" name="label" {...itemCol} rules={[{ required: true, message: '请输入名称' }]}>
              <Input max-length="20" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="类型" name="type" {...itemCol} rules={[{ required: true, message: '请选择类型' }]}>
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
          </Col>
          <Col span={12}>
            <Form.Item label="语言" name="language" {...itemCol} rules={[{ required: true, message: '请选择语言' }]}>
              <Select>
                {CodeMirrorTypes.map((v: string) => {
                  return (
                    <Option value={v} key={v}>
                      {v}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="排序" name="sort" {...itemCol} rules={[{ required: true, message: '请输入排序' }]}>
              <InputNumber max-length="20" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="状态" name="status" {...itemCol} rules={[{ required: true, message: '请选择状态' }]}>
              <Select>
                <Option value={0} key={0}>
                  禁用
                </Option>
                <Option value={1} key={1}>
                  启用
                </Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

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
