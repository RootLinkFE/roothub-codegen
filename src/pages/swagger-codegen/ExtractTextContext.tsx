/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-01 15:53:05
 * @Description: 提取文本配置组件
 */
import { Button, DrawerProps, message, Form, Input, Typography, Select, Row, Col, Upload, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { languageOptions, ImageTypes } from '@/shared/common';
import { UploadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import axios from 'axios';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import styles from './index.module.less';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import { useModel } from 'umi';
import { ocrApi } from '@/shared/config.json';
import { uniq } from 'lodash';
import storage from '@/shared/storage';
import { postVSCodeMessage } from '@/shared/vscode';
import state from '@/stores/index';
import HistoryTextDropdown from './components/HistoryTextDropdown';
import ModelCodeDrawer from './ModelCodeDrawer';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ExtractTextContext: React.FC<DrawerProps> = (props) => {
  const swaggerStore = state.swagger;
  const { transformSate, setTransformSate } = useModel('useApiSwitchModel');

  const curStorageHistoryTexts: any[] = storage.get('storageHistoryTexts');
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [textForm] = Form.useForm();
  const [splitTextData, setSplitTextData] = useState<string[]>([]);

  const setParsedText = (text: string) => {
    const originalText = JSON.stringify(text);
    const isT = /\t/g.test(text);
    const replaceEndReg = new RegExp(`${isT ? '\t' : ''}\r\n$`);
    const replaceReg = new RegExp(`${isT ? '\r' : ''}\n`, 'g');
    const splitReg = new RegExp(isT ? '\t' : '\r');
    const splitText: string[] = text.replace(replaceEndReg, '').replace(replaceReg, '').split(splitReg);
    // console.log('splitText', originalText, isT, splitReg, replaceEndReg, replaceReg, splitText);
    textForm.setFieldsValue({
      parsedText: text,
      originalText,
      splitText,
    });
    setSplitTextData(splitText);

    setTransformSate({
      ...transformSate,
      textArray: splitText,
    });
  };

  useEffect(() => {
    setParsedText(curStorageHistoryTexts?.length > 0 ? curStorageHistoryTexts[0] : '');
  }, []);

  const uploadProps: UploadProps = {
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file: RcFile) => {
      // const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      // if (!isJpgOrPng) {
      //   message.error('只可上传 JPG/PNG file!');
      //   form.setFieldValue('file', null);
      // }
      const isLt1M = file.size / 1024 / 1024 <= 1;
      if (!isLt1M) {
        message.error('图片大小不可大于 1MB!');
        form.setFieldValue('file', null);
      }
      return false;
    },
    onChange(info: any) {
      setFileList(info.fileList);
    },
  };

  const pasteChange = (value: any) => {
    const items = value.clipboardData.items[0];
    if (items.type.includes('image')) {
      const file = items.getAsFile();
      const fileItem: any = { file, name: file.name };
      form.setFieldValue('file', fileItem);
      setFileList([fileItem]);
    }
  };

  const { run: handleImageToText, loading: textLoading } = useRequest(
    async (values: any) => {
      const formData = new FormData();
      formData.append('file', values.file.file);
      formData.append('language', values.language);
      formData.append('filetype', values.filetype);
      formData.append('isOverlayRequired', 'false');
      formData.append('iscreatesearchablepdf', 'false');
      formData.append('issearchablepdfhidetextlayer', 'false');
      // formData.append('isTable', 'true');
      formData.append('scale', 'true');

      const res: any = await axios({
        method: 'POST',
        url: ocrApi.url,
        headers: {
          apikey: ocrApi.apikey,
        },
        data: formData,
      });
      const { data } = res;
      if (res.status === 200 && data.ParsedResults?.length > 0) {
        const text = data.ParsedResults[0].ParsedText;
        setParsedText(text);
        setText(text);
        message.success('提取文本成功!');
        return data;
      } else {
        message.error(data.ErrorMessage || '提取文本失败!');
      }
      return null;
    },
    {
      manual: true,
    },
  );

  const setText = (current: string | unknown) => {
    const storageHistoryTexts: any[] = storage.get('storageHistoryTexts');
    let newStorageHistoryTexts: any[] = [current];
    if (storageHistoryTexts) {
      const item = storageHistoryTexts.find((v: string) => v === current);
      newStorageHistoryTexts = (item
        ? uniq([current, ...storageHistoryTexts])
        : [current, ...storageHistoryTexts]
      ).slice(0, 15);
    }

    postVSCodeMessage('pushStorage', {
      key: 'storage',
      data: { ['storageHistoryTexts']: newStorageHistoryTexts },
    });

    swaggerStore.setHistoryTexts(newStorageHistoryTexts);
  };

  // 历史文本下拉选取设置
  const onHistoryTextChange = (text: string) => {
    setParsedText(text);
    setText(text);
  };

  const fileInputClick = (e: any) => {
    e.stopPropagation();
  };

  const onStatusChange = (checked: boolean) => {
    setTransformSate({
      ...transformSate,
      status: checked,
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
        initialValues={{ language: 'chs', filetype: 'JPEG' }}
        onFinish={handleImageToText}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Row>
          <Col span={12}>
            <Form.Item label="上传图片" name="file" {...itemCol} rules={[{ required: true, message: '请上传图片' }]}>
              <Upload {...uploadProps}>
                <Row wrap={false}>
                  <Col span={16.5}>
                    <Input placeholder="粘贴上传图片" allowClear onPaste={pasteChange} onClick={fileInputClick} />
                  </Col>
                  <Col span={7.5}>
                    <Button icon={<UploadOutlined />} style={{ width: '100%' }}>
                      上传
                    </Button>
                  </Col>
                </Row>
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
              <Select style={{ width: '150px' }}>
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
          <Col span={6}>
            <Form.Item
              label="识别语言"
              name="language"
              labelCol={{ span: 8 }}
              rules={[{ required: true, message: '请选择识别语言' }]}
            >
              <Select style={{ width: '150px' }} options={languageOptions}></Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item wrapperCol={{ offset: 2, span: 22 }}>
              <Button type="primary" title="ORCAPI" htmlType="submit" loading={textLoading}>
                提取文本
              </Button>
              <Text type="secondary" style={{ marginLeft: '24px' }}>
                提取方法来源
                <a href="https://ocr.space/OCRAPI#PostParameters" target="_blank">
                  ORCAPI
                </a>
              </Text>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <h2 className={styles.h2BorderTitle}>文本内容</h2>
      <div>
        <Text type="secondary">提取文本后得到文本内容</Text>
        <Form name="basic" form={textForm} {...itemCol} autoComplete="off">
          <Form.Item label="原始文本" labelCol={{ span: 2 }} name="originalText">
            <TextArea />
          </Form.Item>
          <Form.Item
            label={<span title="文本分割后为数组类型(string[])">分割文本</span>}
            labelCol={{ span: 2 }}
            name="splitText"
          >
            <TextArea />
          </Form.Item>
          <Form.Item wrapperCol={{ offset: 2, span: 12 }}>
            {/* <Button disabled={true}>历史文本</Button> */}
            <HistoryTextDropdown onChange={onHistoryTextChange} />
            <span style={{ marginLeft: '24px' }}>
              <ApiDefinitionDropdown api={splitTextData} methodType="text" />
            </span>
          </Form.Item>
          <Form.Item label="代码生成是否关联文本数组">
            <Switch defaultChecked={transformSate.status} onChange={onStatusChange} />
          </Form.Item>
        </Form>
      </div>

      <ModelCodeDrawer />
    </>
  );
};

export default ExtractTextContext;
