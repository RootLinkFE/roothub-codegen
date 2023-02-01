/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-01 15:53:05
 * @Description: 提取文本配置组件
 */
import { Button, DrawerProps, message, Form, Input, InputNumber, Select, Row, Col, Upload } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import state from '@/stores/index';
import { CustomMethodsItem } from '@/shared/ts/custom';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { FileTypes, ImageTypes, ApiDataTypes, MethodTypes } from '@/shared/common';
import type { OptionItem } from '@/shared/common';
import { getStringToFn } from '@/shared/utils';
import { codeGenerateMethods } from './code-generate/index';
import { CodeMirrorTypes } from '@/shared/common';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import styles from './index.module.less';

const { Option } = Select;
const { TextArea } = Input;

const ExtractTextContext: React.FC<DrawerProps> = (props) => {
  const [form] = Form.useForm();
  form.setFieldsValue({
    language: 'chs',
    filetype: 'JPEG',
  });
  const [codeForm] = Form.useForm();
  const [parsedText, setParsedText] = useState('');
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

  useEffect(() => {}, []);

  const editorHeight = useMemo(() => {
    const height = window.innerHeight - 400;
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

  const uploadProps: UploadProps = {
    maxCount: 1,
    beforeUpload: (file: RcFile) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只可上传 JPG/PNG file!');
        form.setFieldValue('file', null);
      }
      const isLt1M = file.size / 1024 / 1024 <= 1;
      if (!isLt1M) {
        message.error('图片大小不可大于 1MB!');
        form.setFieldValue('file', null);
      }
      return false;
    },
    onChange(info) {
      console.log('upload', info);
    },
  };

  const handleImageToText = async (values: any) => {
    console.log('handleImageToText', form.getFieldsValue());
    // const values = form.getFieldsValue();
    const formData = new FormData();
    formData.append('file', values.file.file);
    formData.append('language', 'chs');
    formData.append('filetype', 'JPEG');
    formData.append('isOverlayRequired', 'false');
    formData.append('iscreatesearchablepdf', 'false');
    formData.append('issearchablepdfhidetextlayer', 'false');
    formData.append('isTable', 'true');
    formData.append('scale', 'true');

    const res: any = await axios({
      method: 'POST',
      url: 'https://api.ocr.space/parse/image',
      headers: {
        apikey: 'K84668927688957',
      },
      data: formData,
    });
    const { data } = res;
    if (res.status === 200 && data.ParsedResults) {
      data.ParsedResults.length > 0 && setParsedText(data.ParsedResults[0].ParsedText);
      message.success('提取文本成功!');
    } else {
      message.error(data.ErrorMessage || '提取文本失败!');
    }
  };

  const submit = useCallback((values: any) => {
    console.log('submit', values);
    // if (!filterFunction(values.function)) {
    //   message.error('方法-校验是否函数未通过！');
    //   return false;
    // }
    // const list = [...state.custom.EnabledCustomMethods];
    // let text = '';
    // const index = list.findIndex((v: CustomMethodsItem) => {
    //   return values.key === v.key;
    // });

    // state.custom.setCustomMethods(list.sort((a, b) => b.sort - a.sort));
    // clearFormData();
    // message.success(`${text}成功！`);
  }, []);

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
    <>
      <h2 className={styles.h2BorderTitle}>提取文本</h2>
      <Form
        name="basic"
        form={form}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ remember: true }}
        onFinish={handleImageToText}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item label="上传图片" name="file" {...itemCol} rules={[{ required: true, message: '请上传图片' }]}>
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>上传</Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="图片类型"
              name="filetype"
              labelCol={{ span: 8 }}
              rules={[{ required: true, message: '请选择图片类型' }]}
            >
              <Select style={{ width: '150px' }} defaultValue={'JPEG'}>
                {FileTypes.map((v: OptionItem) => {
                  return (
                    <Option value={v.value} key={v.key}>
                      {v.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="识别语言"
              name="language"
              labelCol={{ span: 8 }}
              rules={[{ required: true, message: '请选择识别语言' }]}
            >
              <Select style={{ width: '150px' }} defaultValue={'chs'}>
                {ImageTypes.map((v: string) => {
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
            <Form.Item wrapperCol={{ offset: 4, span: 12 }}>
              <Button type="primary" title="ORCAPI" htmlType="submit">
                获取文本
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <h2 className={styles.h2BorderTitle}>文本内容</h2>
      <div>
        <TextArea value={parsedText} max-length="200" />

        <div>{parsedText}</div>
      </div>

      <h2 className={styles.h2BorderTitle}>代码转换</h2>
      <Form
        name="code"
        form={codeForm}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ remember: true }}
        onFinish={submit}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item label="勾选api" name="api" {...itemCol}>
              <div>{}</div>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="参数类型" name="language" {...itemCol}>
              <Select defaultValue={'javascript'}>
                {ApiDataTypes.map((v: OptionItem) => {
                  return (
                    <Option value={v.value} key={v.key}>
                      {v.value}
                    </Option>
                  );
                })}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item wrapperCol={{ offset: 12, span: 12 }}>
          <Button type="primary" htmlType="submit" disabled={!parsedText} title="添加自定义方法">
            转换
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default ExtractTextContext;
