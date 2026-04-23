/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-05 14:37:46
 * @Description: api详情组件
 */
import getResponseParams from '@/shared/getResponseParams';
import { Button, Col, message, Space, Table, TableProps, Tag, Row, Collapse, Switch, Popover } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { unionBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import { checkIsEnum, generateEnumCode } from './code-generate/generate-enum-code';
import styles from './index.module.less';
import ParameterTableDefinition from './ParameterTableDefinition';
import { pathsItem } from '@/shared/ts/api-interface';
import copy from 'copy-to-clipboard';
import { MethodColors } from '@/shared/common';
import { getStringToFn, flatChildren, getHeaderParams, getRequestParams, dataSaveToJSON } from '@/shared/utils';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import ApiDebugger from './ApiDebugger';
import { CustomMethodsItem } from '@/shared/ts/custom';
import state from '@/stores/index';

const { Panel } = Collapse;

const ApiDetail: React.FC<{ api: pathsItem }> = (props) => {
  const { api: selectedApi } = props;
  const { resourceDetail, setDefinitionCodeDrawerProps, apiurlPrefix, transformSate, type } =
    useModel('useApiSwitchModel');
  const [debugMode, setDebugMode] = useState(false);
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

  const responseExample = useMemo(() => {
    const lines: { text: string; description: string }[] = [];

    const parseParams = (params: any[], depth = 0) => {
      const indent = '  '.repeat(depth);
      params.forEach((item, index) => {
        const isLast = index === params.length - 1;
        const comma = isLast ? '' : ',';
        const desc = item.description || '';

        if (item.children && item.children.length > 0) {
          if (item.type && item.type.indexOf('[]') !== -1) {
            lines.push({ text: `${indent}"${item.name}": [`, description: desc });
            lines.push({ text: `${indent}  {`, description: '' });
            parseParams(item.children, depth + 2);
            lines.push({ text: `${indent}  }`, description: '' });
            lines.push({ text: `${indent}]${comma}`, description: '' });
          } else {
            lines.push({ text: `${indent}"${item.name}": {`, description: desc });
            parseParams(item.children, depth + 1);
            lines.push({ text: `${indent}}${comma}`, description: '' });
          }
        } else {
          let value = '""';
          if (item.type === 'integer' || item.type === 'number') value = '0';
          if (item.type === 'boolean') value = 'true';
          lines.push({ text: `${indent}"${item.name}": ${value}${comma}`, description: desc });
        }
      });
    };

    lines.push({ text: '{', description: '' });
    parseParams(responseParamsData, 1);
    lines.push({ text: '}', description: '' });

    return lines;
  }, [responseParamsData]);

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
    (record, type) => {
      let rows: any;
      if (record && record.description) {
        rows = [record];
      } else {
        let paramsData: any = [];
        if (type === 'requestParamsData') {
          paramsData = [...requestParamsData];
        } else if (type === 'responseParamsData') {
          paramsData = [...responseParamsData];
        } else {
          paramsData = [...requestParamsData, ...responseParamsData];
        }
        rows = paramsData.filter((item: { description: string | string[] }) => {
          return checkIsEnum(item);
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
        generateCode: () => generateEnumCode(rows || []),
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
  const schemaNode = (type: string) => {
    return {
      title: '模型',
      dataIndex: 'schema',
      render: (definition: any, record: any) => {
        if (definition) {
          return <ParameterTableDefinition definition={definition} record={record} api={selectedApi} />;
        }
        if (checkIsEnum(record)) {
          return <a onClick={() => showModelEnumCode(record, type)}>生成枚举</a>;
        }
        return null;
      },
    };
  };

  const RequestParamsColumns = useMemo(() => {
    const list = HeaderParamsColumns.slice(0);
    list.push(schemaNode('requestParamsData'));
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
    list.push(schemaNode('responseParamsData'));
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
              ...selectedApi,
              requestSelectedData:
                selectedRequestRowRef.current.length === 0
                  ? flatChildren(requestParamsData)
                  : selectedRequestRowRef.current,
              responseSelectedData:
                selectedResponseRowRef.current.length === 0
                  ? flatChildren(responseParamsData)
                  : selectedResponseRowRef.current,
              apiurlPrefix,
              resourceDetail,
              transformTextRecord:
                transformSate.status && transformSate.textRecord?.length > 0 ? transformSate.textRecord : null,
              baseCode: state.settings.baseCode,
            },
            selectedApi,
          ),
      });
    },
    [selectedRequestRowRef, selectedResponseRowRef, selectedApi, transformSate],
  );

  const handleCopy = () => {
    copy(apiText);
    message.success({ key: 'copy-key', content: 'url已复制到剪贴板！' });
  };

  const handleCopySelectedApi = () => {
    const data = {
      api: apiurlPrefix + selectedApi.api,
      method: selectedApi.method,
      requestParams: getRequestParams(selectedApi, resourceDetail),
      responseParams: getResponseParams(selectedApi, resourceDetail),
    };
    copy(JSON.stringify(data));
    message.success({ key: 'copy-selected-api', content: 'selectedApi已复制到剪贴板！' });
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
        flex="auto"
        style={{
          padding: '0 16px',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 145px)',
          overflow: 'hidden',
          border: '1px solid #e9e9eb',
        }}
      >
        <div style={{ position: 'relative' }}>
          <h2 className={styles.h2BorderTitle}>{selectedApi.summary}</h2>
          <div>
            <Tag color={MethodColors[selectedApi.method] || '#87d068'}>{selectedApi.method.toUpperCase()}</Tag>{' '}
            <span className="copy-link" onClick={handleCopy}>
              {apiText}
            </span>
            <Button type="link" size="small" style={{ marginLeft: '16px' }} onClick={handleCopy}>
              复制URL
            </Button>
            <Button type="link" size="small" onClick={handleCopySelectedApi}>
              复制API_JSON
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
          </div>
          {type === 'api' && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '10px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10,
                gap: '8px',
              }}
            >
              <Button
                type={!debugMode ? 'primary' : 'default'}
                size="small"
                onClick={() => setDebugMode(false)}
                style={{ borderRadius: '4px 0 0 4px' }}
              >
                文档
              </Button>
              <Button
                type={debugMode ? 'primary' : 'default'}
                size="small"
                onClick={() => setDebugMode(true)}
                style={{ borderRadius: '4px 0 0 4px' }}
              >
                调试
              </Button>
            </div>
          )}
        </div>
        {debugMode ? (
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <ApiDebugger api={selectedApi} />
          </div>
        ) : (
          <>
            <p>接口描述：{selectedApi.description}</p>
            <div style={{ flex: 1, overflow: 'auto' }} className="api-detail-content">
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

              <Collapse expandIconPosition={'end'} style={{ marginTop: '10px' }} ghost defaultActiveKey={['1']}>
                <Panel
                  header={
                    <h2 className={styles.h2BorderTitle} style={{ margin: 0 }}>
                      响应示例
                    </h2>
                  }
                  key="1"
                  extra={
                    <Button
                      type="link"
                      size="small"
                      icon={<CopyOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        const code = responseExample.map((l) => l.text).join('\n');
                        copy(code);
                        message.success('已复制到剪贴板');
                      }}
                    >
                      复制
                    </Button>
                  }
                >
                  <div
                    style={{
                      backgroundColor: '#fafafa',
                      padding: '16px 24px',
                      borderRadius: '4px',
                      border: '1px solid #f0f0f0',
                      maxHeight: '500px',
                      overflow: 'auto',
                    }}
                  >
                    {responseExample.map((line, index) => (
                      <Row
                        key={index}
                        wrap={false}
                        style={{ fontFamily: 'monospace', fontSize: '13px', lineHeight: '22px' }}
                      >
                        <Col flex="30px" style={{ color: '#bfbfbf', userSelect: 'none' }}>
                          {index + 1}
                        </Col>
                        <Col flex="auto" style={{ whiteSpace: 'pre', color: '#c41d7f' }}>
                          {line.text}
                        </Col>
                        <Col style={{ color: '#8c8c8c', paddingLeft: '40px', minWidth: '150px' }}>
                          {line.description}
                        </Col>
                      </Row>
                    ))}
                  </div>
                </Panel>
              </Collapse>
            </div>
          </>
        )}
      </Col>
    );
  }
};

export default ApiDetail;
