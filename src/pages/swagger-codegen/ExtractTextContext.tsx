/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-01 15:53:05
 * @Description: 提取文本配置组件
 */
import {
  Button,
  DrawerProps,
  message,
  Form,
  Input,
  Typography,
  Select,
  Row,
  Col,
  Upload,
  TreeSelect,
  Switch,
} from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { languageOptions, ImageTypes, ApiDataTypes, MethodTypes } from '@/shared/common';
import { UploadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import axios from 'axios';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import styles from './index.module.less';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import { useModel } from 'umi';
import { pathsItem, tagsItem } from '@/shared/ts/api-interface';
import { ocrApi } from '@/shared/config.json';
import { uniq } from 'lodash';
import storage from '@/shared/storage';
import { postVSCodeMessage } from '@/shared/vscode';
import state from '@/stores/index';
import HistoryTextDropdown from './components/HistoryTextDropdown';

const { Option } = Select;
const { TextArea } = Input;
const { Text, Link } = Typography;

type CodeFormData = {
  api: string | undefined;
  methodType: string;
};

const ExtractTextContext: React.FC<DrawerProps> = (props) => {
  const swaggerStore = state.swagger;
  const { selectedApi, resourceDetail, transformSate, setTransformSate } = useModel('useApiSwitchModel');

  const curStorageHistoryTexts: any[] = storage.get('storageHistoryTexts');
  const [form] = Form.useForm();
  const [textForm] = Form.useForm();
  const [codeForm] = Form.useForm();
  const [codeFormData, setCodeFormData] = useState<CodeFormData>({
    api: selectedApi?.uuid,
    methodType: 'response',
  });

  const setParsedText = (text: string) => {
    let language = form.getFieldValue('language') ?? 'eng';
    const isChinese = language === 'chs' || language === 'cht' ? true : false;
    const originalText = JSON.stringify(text);
    const replaceEndReg = new RegExp(`${isChinese ? '\t' : ''}\r\n$`);
    const replaceReg = new RegExp(`${isChinese ? '\r' : ''}\n`, 'g');
    const splitReg = new RegExp(isChinese ? '\t' : '\r');
    const splitText = text.replace(replaceEndReg, '').replace(replaceReg, '').split(splitReg);
    // console.log('splitText', language, splitReg, replaceEndReg, replaceReg, splitText)
    textForm.setFieldsValue({
      parsedText: text,
      originalText,
      splitText,
    });

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
      formData.append('scale', 'false');

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

  const handleSplitTextToArray = () => {
    const dom: any = document.querySelector('.original-text');
    const parsedText = textForm.getFieldValue('parsedText');
    if (dom) {
      console.log('dom', dom);
      dom.innerText = JSON.stringify(parsedText, null, 4);
    }
    const str = parsedText;
    const reg = new RegExp(/[\t|(\t\r\n)]/);
    // 名称\t类型\t方法\t状态\t\r\n
    const text = str.replace(/[\t\r\n]+[\r\n]+/g, '').split(reg);
    console.log('Split text', text);
  };

  const handleTranslate = useCallback((values: any) => {
    console.log('handleTranslate', values);
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

  const treeData = useMemo(() => {
    const arr = resourceDetail?.tags ?? [];
    return arr.map((item: tagsItem) => {
      return {
        value: item.name,
        title: item.name,
        children: (item?.paths || []).map((m: pathsItem) => {
          return {
            ...m,
            value: m.uuid ?? m.api,
            title: m.summary || m.description,
          };
        }),
      };
    });
  }, [resourceDetail]);
  const onTreeSelectChange = (val: string) => {
    setCodeFormData({
      ...codeFormData,
      api: val,
    });
  };
  const onDataTypeChange = (val: string) => {
    setCodeFormData({
      ...codeFormData,
      methodType: val,
    });
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
                获取文本
              </Button>
              <Text type="secondary" style={{ marginLeft: '24px' }}>
                提取方法来源<a href="https://ocr.space/OCRAPI#PostParameters">ORCAPI</a>
              </Text>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <h2 className={styles.h2BorderTitle}>文本内容</h2>
      <div>
        <Text type="secondary">提取文本后得到内容文本</Text>
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
          </Form.Item>
          <Form.Item label="代码生成是否关联文本数组">
            <Switch defaultChecked={transformSate.status} onChange={onStatusChange} />
          </Form.Item>
        </Form>

        {/* <Row>
          <Col span={20}>
            <TextArea value={originalText} />
          </Col>
          <Col span={4} style={{ textAlign: 'center' }}>
            <Button>历史文本</Button>
            <Button title="查看内容文本分割后的数组格式" onClick={handleSplitTextToArray}>
              数组格式
            </Button>
            <Dropdown.Button overlay={menu}>
              历史文本
            </Dropdown.Button>
            <ApiDefinitionDropdown api={selectedApi} />
          </Col>
        </Row> */}
      </div>

      {/* <h2 className={styles.h2BorderTitle}>代码转换</h2>
      <Form
        name="code"
        form={codeForm}
        labelCol={{ span: 2 }}
        wrapperCol={{ span: 22 }}
        initialValues={{ dataType: 'response' }}
        onFinish={handleTranslate}
        onFinishFailed={() => {}}
        autoComplete="off"
      >
        <Text type="secondary">存在文本内容，并选取api后方可转换代码</Text>
        <Row>
          <Col span={12}>
            <Form.Item label="勾选api" name="api" {...itemCol} rules={[{ required: true, message: '请勾选api' }]}>
              <div>{}</div>
              <TreeSelect
                showSearch
                style={{ width: '100%' }}
                value={codeFormData.api}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="Please select"
                allowClear
                treeDefaultExpandAll
                onChange={onTreeSelectChange}
                treeData={treeData}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="参数类型" name="dataType" {...itemCol}>
              <Select defaultValue={'response'} options={ApiDataTypes} onChange={onDataTypeChange}></Select>
            </Form.Item>
          </Col>
        </Row>
        <Col span={12}>
          <Form.Item wrapperCol={{ offset: 4, span: 12 }}>
            <Button type="primary" htmlType="submit" disabled={!parsedText || !selectedApi} title="代码转换">
              转换
            </Button>
            <ApiDefinitionDropdown dropdownTitle={'转换'} buttonType="primary" api={selectedApi} methodType={codeFormData.methodType} onChange={handleTranslate} />
          </Form.Item>
        </Col>
      </Form> */}
    </>
  );
};

export default ExtractTextContext;
