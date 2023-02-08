/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-01 15:53:05
 * @Description: 提取文本配置组件
 */
import { Button, DrawerProps, message, Form, Input, Typography, Select, Row, Col, Upload, Switch } from 'antd';
import { useEffect, useState, useMemo } from 'react';
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
import { uniq, isEqual, uniqWith } from 'lodash';
import storage from '@/shared/storage';
import { postVSCodeMessage } from '@/shared/vscode';
import state from '@/stores/index';
import HistoryTextDropdown from './components/HistoryTextDropdown';
import ModelCodeDrawer from './ModelCodeDrawer';
import { getStringToFn } from '@/shared/utils';
import { codeGenerateMethods } from './code-generate/index';
import { CustomMethodsItem } from '@/shared/ts/custom';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const ExtractTextContext: React.FC<DrawerProps> = (props) => {
  const swaggerStore = state.swagger;
  const { historyTexts, extractType } = swaggerStore;
  const { transformSate, setTransformSate } = useModel('useApiSwitchModel');

  const [curState, setCurState] = useState<{
    storageHistoryTexts: string[];
    extractType: string;
  }>({
    storageHistoryTexts: historyTexts,
    extractType: extractType,
  });
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [textForm] = Form.useForm();
  const [splitTextData, setSplitTextData] = useState<string[]>([]);
  const extractTypeOptions = useMemo(() => {
    const extractGenerateMethods = [
      ...state.custom.EnabledCustomMethods.filter((v: CustomMethodsItem) => v.type === 'extract'),
      ...codeGenerateMethods.filter((v) => v.type === 'extract' && v.status),
    ];
    return [
      {
        label: '默认',
        value: 'ocrapi',
      },
      ...extractGenerateMethods.map((v: any) => {
        return {
          ...v,
          value: v.key,
        };
      }),
    ];
  }, []);

  useEffect(() => {
    setParsedText(historyTexts?.length > 0 ? historyTexts[0] : '');
    setCurState({
      storageHistoryTexts: historyTexts,
      extractType,
    });

    const current = 'Age\r\nAddress\r\nTags\r\nAction\r\n';
    // [{"words":"Name"},{"words":"Age"},{"words":"Address"},{"words":"Tags"},{"words":"Action"}]
    const item = historyTexts.findIndex((v: string) => isEqual(v, current));
    console.log(item, current, historyTexts);
  }, [swaggerStore]);

  const setParsedText = (value: any) => {
    const originalText = JSON.stringify(value);
    let splitText: string[] = [];
    if (Object.prototype.toString.call(value) === '[object Array]') {
      splitText = value.map((v: any) => {
        return v.words;
      });
    } else {
      const isT = /\t/g.test(value);
      const replaceEndReg = new RegExp(`${isT ? '\t' : ''}\r\n$`);
      const replaceReg = new RegExp(`${isT ? '\r' : ''}\n`, 'g');
      const splitReg = new RegExp(isT ? '\t' : '\r');
      splitText = value.replace(replaceEndReg, '').replace(replaceReg, '').split(splitReg);
      // console.log('splitText', originalText, isT, splitReg, replaceEndReg, replaceReg, splitText);
    }
    textForm.setFieldsValue({
      parsedText: value,
      originalText,
      splitText,
    });
    setSplitTextData(splitText);

    setTransformSate({
      ...transformSate,
      textArray: splitText,
    });
  };

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
      const { extractType } = values;
      if (extractType && extractType !== storage.get('storageExtractType')) {
        swaggerStore.setExtractType(extractType);
      }

      // default
      if (extractType === 'ocrapi' || !extractType) {
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
          const paresd = data.ParsedResults[0];
          if (paresd.FileParseExitCode === 1) {
            const text = paresd.ParsedText;
            setParsedText(text);
            setHistoryText(text);
            message.success('提取文本成功!');
          } else {
            message.error(paresd.ErrorMessage || '提取文本失败!');
          }
          return data;
        } else {
          message.error(data.ErrorMessage || '提取文本失败!');
        }
      } else {
        const item = extractTypeOptions.find((v: any) => {
          return v.key === extractType;
        });
        let cutomCodeFn: any = item?.function;
        if (item?.source === 'custom') {
          cutomCodeFn = item?.function
            ? typeof item.function === 'string'
              ? getStringToFn(item.function)
              : item.function
            : () => {};
        }
        const data = await cutomCodeFn(values.file.file, values);
        if (data.words_result?.length > 0) {
          const wordsResult = data.words_result;
          setParsedText(wordsResult);
          setHistoryText(wordsResult);
          message.success('提取文本成功!');
          return data;
        } else {
          message.error('提取文本失败!');
        }
      }
      return null;
    },
    {
      manual: true,
    },
  );

  /**设置历史文本
   * @description:
   * @param {string} current
   * @return {*}
   */
  const setHistoryText = (current: string | unknown) => {
    const storageHistoryTexts: any[] = storage.get('storageHistoryTexts');
    let newStorageHistoryTexts: any[] = [current];
    if (storageHistoryTexts) {
      const index = storageHistoryTexts.findIndex((v: string) => isEqual(v, current));
      if (index !== -1) {
        storageHistoryTexts.splice(index, 1);
      } else if (storageHistoryTexts.length === 15) {
        storageHistoryTexts.splice(14, 1);
      }
      newStorageHistoryTexts = [current, ...storageHistoryTexts];
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
    setHistoryText(text);
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
        initialValues={{ language: 'chs', filetype: 'JPEG', extractType: curState.extractType }}
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
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="操作提取" labelCol={{ span: 4 }}>
              <Row style={{ marginBottom: '16px' }}>
                <Button type="primary" title="ORCAPI" htmlType="submit" loading={textLoading}>
                  提取文本
                </Button>
              </Row>
              <Text type="secondary">
                default: 提取方法来源
                <a href="https://ocr.space/OCRAPI#PostParameters" target="_blank">
                  ORCAPI
                </a>
              </Text>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="提取方法" name="extractType" labelCol={{ span: 4 }}>
              <Select options={extractTypeOptions} style={{ width: '88%' }}></Select>
            </Form.Item>
            <Row>
              <Text type="secondary">
                设置不同的提取方法，调用对应自定义方法（首页-设置-设置自定义方法），默认方法除外
              </Text>
            </Row>
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
