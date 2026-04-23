import React, { useState, useEffect } from 'react';
import { pathsItem } from '@/shared/ts/api-interface';
import { Button, Input, message, Tabs, Collapse, Space, Table, Row, Col, Spin, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import { getRequestParams, getHeaderParams, formatUrlChar } from '@/shared/utils';
import { requestToBody } from '@/shared/fetch/requestToBody';
import state from '@/stores/index';

const { TabPane } = Tabs;
const { Panel } = Collapse;

interface ApiDebuggerProps {
  api: pathsItem;
}

const ApiDebugger: React.FC<ApiDebuggerProps> = ({ api }) => {
  const { resourceDetail, selectedResource } = useModel('useApiSwitchModel');
  const [requestBody, setRequestBody] = useState<string>('');
  const [headers, setHeaders] = useState<any[]>([]);
  const [queryParams, setQueryParams] = useState<any[]>([]);
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiText = `${formatUrlChar(state.swagger.urlValue)}${resourceDetail?.basePath || ''}${api.api}`;

  const requestParamsData = getRequestParams(api, resourceDetail);
  const headerParamsData = getHeaderParams(api);

  useEffect(() => {
    // Initialize request body
    if (requestParamsData && requestParamsData.length > 0) {
      const exampleBody: { [key: string]: any } = {};
      requestParamsData.forEach((param: any) => {
        if (param.in === 'body' || param.in === 'formData') {
          if (param.children) {
            param.children.forEach((child: any) => {
              exampleBody[child.name] = child.example || child.default || '';
            });
          } else if (param.name && param.name !== 'body') {
            exampleBody[param.name] = param.example || param.default || '';
          }
        }
      });
      if (Object.keys(exampleBody).length > 0) {
        setRequestBody(JSON.stringify(exampleBody, null, 2));
      }
    }

    // Initialize headers
    const initialHeaders = headerParamsData.map((param: any) => ({
      name: param.name,
      value: param.example || param.default || '',
      required: param.required,
    }));

    // Add security definitions to headers
    if (resourceDetail?.securityDefinitions) {
      Object.values(resourceDetail.securityDefinitions).forEach((sec: any) => {
        if (sec.in === 'header' && sec.name) {
          const exists = initialHeaders.find((h) => h.name === sec.name);
          if (!exists) {
            initialHeaders.push({
              name: sec.name,
              value: '',
              required: false,
            });
          }
        }
      });
    }

    setHeaders(initialHeaders);

    // Initialize query params
    const initialQueryParams = requestParamsData
      .filter((p: any) => p.in === 'query')
      .map((param: any) => ({
        name: param.name,
        value: param.example || param.default || '',
        required: param.required,
      }));
    setQueryParams(initialQueryParams);
  }, [api, resourceDetail]);

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
      let data = {};
      if (requestBody && (api.method === 'post' || api.method === 'put' || api.method === 'patch')) {
        try {
          data = JSON.parse(requestBody);
        } catch (e) {
          message.error('请求体JSON格式错误');
          setLoading(false);
          return;
        }
      }

      const headerObj: { [key: string]: string } = {};
      headers.forEach((h) => {
        if (h.name) headerObj[h.name] = h.value;
      });

      const finalHeaders: any = {
        'Content-Type': 'application/json',
        ...headerObj,
      };

      if (selectedResource?.header) {
        if (typeof selectedResource.header === 'string') {
          finalHeaders['knfie4j-gateway-request'] = selectedResource.header;
          finalHeaders['knfie4j-gateway-code'] = 'ROOT';
        } else {
          Object.assign(finalHeaders, selectedResource.header);
        }
      }

      const queryObj: { [key: string]: string } = {};
      queryParams.forEach((q) => {
        if (q.name) queryObj[q.name] = q.value;
      });

      const res: any = await requestToBody(apiText, api.method.toUpperCase(), finalHeaders, data, queryObj);
      setResponse(res);
    } catch (error: any) {
      setResponse({ name: error.name, message: error.message, status: error.status });
      console.log('error', error);
      // message.error('请求失败: ' + (error.message || error.statusText || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleAddHeader = () => {
    setHeaders([...headers, { name: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const handleHeaderChange = (index: number, field: string, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index][field] = value;
    setHeaders(newHeaders);
  };

  const handleAddQueryParam = () => {
    setQueryParams([...queryParams, { name: '', value: '' }]);
  };

  const handleRemoveQueryParam = (index: number) => {
    const newQueryParams = [...queryParams];
    newQueryParams.splice(index, 1);
    setQueryParams(newQueryParams);
  };

  const handleQueryParamChange = (index: number, field: string, value: string) => {
    const newQueryParams = [...queryParams];
    newQueryParams[index][field] = value;
    setQueryParams(newQueryParams);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px 0' }}>
      {/* 请求区域 */}
      <div style={{ flex: 'none', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <Input value={apiText} readOnly addonBefore={api.method.toUpperCase()} />
          <Button type="primary" onClick={sendRequest} loading={loading}>
            发送
          </Button>
        </div>

        <Tabs defaultActiveKey="body" size="small" className="request-tabs">
          <TabPane tab="Body" key="body">
            <div style={{ padding: '8px 0' }}>
              <Input.TextArea
                rows={8}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                placeholder="请输入请求体 (JSON)"
                disabled={api.method === 'get'}
              />
              {api.method === 'get' && (
                <div style={{ color: '#faad14', fontSize: '12px', marginTop: '4px' }}>GET请求通常不需要Body</div>
              )}
            </div>
          </TabPane>
          <TabPane
            tab="Headers"
            key="headers"
            extra={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddHeader();
                }}
              >
                添加
              </Button>
            }
          >
            <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
              {headers.map((h, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={10}>
                    <Input
                      placeholder="Key"
                      value={h.name}
                      onChange={(e) => handleHeaderChange(index, 'name', e.target.value)}
                    />
                  </Col>
                  <Col span={11}>
                    <Input
                      placeholder="Value"
                      value={h.value}
                      onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                    />
                  </Col>
                  <Col span={3}>
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveHeader(index)} />
                  </Col>
                </Row>
              ))}
              {headers.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', padding: '10px' }}>点击上方“添加”按钮新增请求头</div>
              )}
            </div>
          </TabPane>
          <TabPane
            tab="Query"
            key="query"
            extra={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddQueryParam();
                }}
              >
                添加
              </Button>
            }
          >
            <div style={{ padding: '8px 0', maxHeight: '200px', overflowY: 'auto' }}>
              {queryParams.map((q, index) => (
                <Row key={index} gutter={8} style={{ marginBottom: 8 }}>
                  <Col span={10}>
                    <Input
                      placeholder="Key"
                      value={q.name}
                      onChange={(e) => handleQueryParamChange(index, 'name', e.target.value)}
                    />
                  </Col>
                  <Col span={11}>
                    <Input
                      placeholder="Value"
                      value={q.value}
                      onChange={(e) => handleQueryParamChange(index, 'value', e.target.value)}
                    />
                  </Col>
                  <Col span={3}>
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveQueryParam(index)}
                    />
                  </Col>
                </Row>
              ))}
              {queryParams.length === 0 && (
                <div style={{ color: '#999', textAlign: 'center', padding: '10px' }}>
                  点击上方“添加”按钮新增查询参数
                </div>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>

      {/* 响应区域 */}
      <div
        style={{
          flex: 1,
          borderTop: '2px solid #f0f0f0',
          paddingTop: '16px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>响应结果:</span>
          {response && (
            <Tag color={response.status < 300 || !response.status ? 'green' : 'red'} style={{ margin: 0 }}>
              {response.status} {response.statusText}
            </Tag>
          )}
        </div>
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#fafafa',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            position: 'relative',
          }}
        >
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <Spin tip="请求中..." />
            </div>
          ) : response ? (
            <pre style={{ margin: 0, padding: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
              {JSON.stringify(response.data || response, null, 2)}
            </pre>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#bfbfbf' }}>点击上方“发送”按钮查看响应</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDebugger;
