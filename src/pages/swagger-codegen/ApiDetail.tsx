/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-05 14:37:46
 * @Description: api详情组件
 */
import getResponseParams from '@/shared/getResponseParams';
import { Button, Col, message, Space, Table, TableProps, Tag, Row, Collapse, Switch, Popover } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { unionBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import generateEnumCode from './code-generate/generate-enum-code';
import styles from './index.module.less';
import ParameterTableDefinition from './ParameterTableDefinition';
import ModelCodeDrawer from './ModelCodeDrawer';
import { pathsItem } from '@/shared/ts/api-interface';
import copy from 'copy-to-clipboard';
import { MethodColors } from '@/shared/common';
import { getStringToFn, flatChildren, getHeaderParams, getRequestParams, dataSaveToJSON } from '@/shared/utils';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import { CustomMethodsItem } from '@/shared/ts/custom';
const { Panel } = Collapse;

const ApiDetail: React.FC<{ api: pathsItem }> = (props) => {
  const { api: selectedApi } = props;
  const { resourceDetail, setDefinitionCodeDrawerProps, apiurlPrefix } = useModel('useApiSwitchModel');
  const [tableCheck, setTableCheck] = useState({
    requestCheckStrictly: true,
    responseCheckStrictly: true,
  });

  const requestParamsData = useMemo(() => {
    return getRequestParams(selectedApi, resourceDetail) ?? [];
  }, [selectedApi, resourceDetail]);
  const responseParamsData = useMemo(() => {
    return getResponseParams(selectedApi, resourceDetail) ?? [];
  }, [selectedApi, resourceDetail]);

  const apiText = useMemo(() => {
    // 默认前缀 + basePath + api
    return `${apiurlPrefix}${resourceDetail?.basePath}${selectedApi.api}`;
  }, [apiurlPrefix, resourceDetail, selectedApi]);

  const selectedRequestRowRef = useRef<any[]>([]);
  const selectedResponseRowRef = useRef<any[]>([]);
  useEffect(() => {
    selectedRequestRowRef.current = [];
    selectedResponseRowRef.current = [];
  }, [selectedApi]);

  const showModelEnumCode = useCallback(
    (record) => {
      let rows: any;
      if (record && record.description) {
        rows = [record];
      } else {
        rows = [...requestParamsData, ...responseParamsData].filter((item: { description: string | string[] }) => {
          if (item && item.description && item.description.indexOf) {
            return item.description.indexOf('ENUM#') !== -1;
          }
          return false;
        });

        // 去掉重复的枚举
        rows = unionBy(rows, 'name');
      }
      if (rows.length === 0) {
        message.warn('没有找到枚举');
        return;
      }
      setDefinitionCodeDrawerProps({
        title: `枚举（${selectedApi.description}）`,
        visible: true,
        language: 'typescript',
        generateCode: () => generateEnumCode(rows || [], selectedApi),
      });
    },
    [setDefinitionCodeDrawerProps, requestParamsData],
  );

  // 基础表格列表columns
  const HeaderParamsColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '参数名称',
        dataIndex: 'name',
        render: (v) => {
          return (
            <span
              className="copy-link"
              onClick={() => {
                copy(v);
                message.info({ content: '已复制', duration: 1, key: 'copy-value' });
              }}
            >
              {v}
            </span>
          );
        },
      },
      {
        title: '参数说明',
        dataIndex: 'description',
        render: (v) => {
          return (
            <span
              className="copy-link"
              onClick={() => {
                copy(v.replace(/#/g, ''));
                message.info({ content: '已复制', duration: 1, key: 'copy-value' });
              }}
            >
              {v}
            </span>
          );
        },
      },
      {
        title: '必须',
        dataIndex: 'required',
        width: '60px',
        render: (v) => (v ? <span style={{ color: '#f50' }}>是</span> : '否'),
      },
      { title: '数据类型', dataIndex: 'type' },
    ],
    [],
  );

  // 模型 ReactNode
  const schemaNode = {
    title: '模型',
    dataIndex: 'schema',
    render: (definition: any, record: any) => {
      if (definition) {
        return <ParameterTableDefinition definition={definition} record={record} api={selectedApi} />;
      }
      if (
        (record.description && record.description.indexOf('ENUM#') !== -1) ||
        (record.enum && record.enum.length > 0)
      ) {
        return <a onClick={() => showModelEnumCode(record)}>生成枚举</a>;
      }
      return null;
    },
  };

  const RequestParamsColumns = useMemo(() => {
    const list = HeaderParamsColumns.slice(0);
    list.push(schemaNode);
    list.splice(1, 0, {
      title: '请求类型',
      dataIndex: 'in',
      width: '80px',
    });
    return list;
  }, [selectedApi]);

  const ResponseParamsColumns = useMemo(() => {
    const list = HeaderParamsColumns.slice(0);
    list.slice(2, 1);
    list.push(schemaNode);
    return list;
  }, [selectedApi]);

  const handleDropdownChange = useCallback(
    (key: string, item: CustomMethodsItem | undefined) => {
      let cutomCodeFn: any = item?.function;
      if (item?.source === 'custom') {
        cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
      }
      setDefinitionCodeDrawerProps({
        title: item?.label || `代码生成方法-${item?.type}`,
        visible: true,
        language: item?.language || 'javascript',
        generateCode: () =>
          cutomCodeFn(
            {
              requestSelectedData:
                selectedRequestRowRef.current.length === 0
                  ? flatChildren(requestParamsData)
                  : selectedRequestRowRef.current,
              responseSelectedData:
                selectedResponseRowRef.current.length === 0
                  ? flatChildren(responseParamsData)
                  : selectedResponseRowRef.current,
              resourceDetail,
            },
            selectedApi,
          ),
      });
    },
    [selectedRequestRowRef, selectedResponseRowRef, selectedApi],
  );

  const handleCopy = () => {
    copy(apiText);
    message.success('api已复制到剪贴板！');
  };

  const handleDownload = () => {
    dataSaveToJSON(
      { ...selectedApi, requestParams: getRequestParams(selectedApi, resourceDetail), responseParamsData },
      selectedApi.summary,
    );
  };

  if (!resourceDetail) {
    return null;
  } else {
    return (
      <Col
        flex="80%"
        style={{
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 145px)',
          overflow: 'hidden',
          border: '1px solid #e9e9eb',
        }}
      >
        <div>
          <h2 className={styles.h2BorderTitle}>{selectedApi.summary}</h2>
          <p>
            <Tag color={MethodColors[selectedApi.method] || '#87d068'}>{selectedApi.method.toUpperCase()}</Tag>{' '}
            {apiText}
            <Button type="link" size="small" style={{ marginLeft: '16px' }} onClick={handleCopy}>
              复制
            </Button>
            <ApiDefinitionDropdown api={selectedApi} />
            <Button
              type="link"
              size="small"
              title="openapi.json"
              onClick={() => {
                handleDownload();
              }}
            >
              <DownloadOutlined />
              下载
            </Button>
          </p>
          <p>接口描述：{selectedApi.description}</p>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <Row align="middle" justify="space-between">
            <h2 className={styles.h2BorderTitle}>
              请求参数
              <Space align="center" style={{ marginLeft: 16 }}>
                <Popover placement="topLeft" content="CheckStrictly">
                  <Switch
                    checked={tableCheck.requestCheckStrictly}
                    onChange={(v) => {
                      setTableCheck({
                        ...tableCheck,
                        requestCheckStrictly: v,
                      });
                    }}
                    size="small"
                  />
                </Popover>
              </Space>
            </h2>
            <ApiDefinitionDropdown api={selectedApi} methodType="request" onChange={handleDropdownChange} />
            {/* <div>{tableCheck}</div> */}
          </Row>
          <Table
            bordered
            sticky
            rowSelection={{
              onChange: (keys, rows) => {
                selectedRequestRowRef.current = rows;
              },
              checkStrictly: tableCheck.requestCheckStrictly,
            }}
            expandable={{ defaultExpandAllRows: true }}
            size="small"
            pagination={false}
            columns={RequestParamsColumns}
            rowKey="key"
            dataSource={getRequestParams(selectedApi, resourceDetail)}
          />

          <Row align="middle" justify="space-between">
            <h2 className={styles.h2BorderTitle}>
              响应参数
              <Space align="center" style={{ marginLeft: 16 }}>
                <Popover placement="topLeft" content="CheckStrictly">
                  <Switch
                    checked={tableCheck.responseCheckStrictly}
                    onChange={(v) => {
                      setTableCheck({
                        ...tableCheck,
                        responseCheckStrictly: v,
                      });
                    }}
                    size="small"
                  />
                </Popover>
              </Space>
            </h2>
            <ApiDefinitionDropdown api={selectedApi} methodType="response" onChange={handleDropdownChange} />
          </Row>
          <Table
            rowSelection={{
              onChange: (keys, rows) => {
                selectedResponseRowRef.current = rows;
              },
              checkStrictly: tableCheck.responseCheckStrictly,
            }}
            bordered
            sticky
            expandable={{ defaultExpandAllRows: true }}
            size="small"
            pagination={false}
            columns={ResponseParamsColumns}
            rowKey="key"
            dataSource={responseParamsData}
          />

          <Collapse expandIconPosition={'end'} style={{ marginTop: '10px' }} ghost>
            <Panel
              header={
                <h2 className={styles.h2BorderTitle} style={{ margin: 0 }}>
                  请求头参数
                </h2>
              }
              key="1"
            >
              {/* <h2 className={styles.h2BorderTitle}>请求头参数</h2> */}
              <Table
                size="small"
                bordered
                pagination={false}
                columns={HeaderParamsColumns}
                rowKey="name"
                dataSource={getHeaderParams(selectedApi)}
              />
            </Panel>
          </Collapse>
        </div>
        {/* <Space style={{ background: '#fff', padding: '10px' }}>
          <Button type="primary" onClick={showModelEnumCode}>
            生成全部枚举
          </Button>
        </Space> */}
        <ModelCodeDrawer />
      </Col>
    );
  }
};

export default ApiDetail;
