/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-05 14:37:46
 * @Description: api详情组件
 */
import getParameterObject from '@/shared/getParameterObject';
import getResponseParams from '@/shared/getResponseParams';
import { Button, Col, message, Space, Table, TableProps, Tag, Row } from 'antd';
import { unionBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import generateModelFormItemsCode from './code-generate/generate-model-form-items-code';
import generateEnumCode from './code-generate/generate-enum-code';
import generateTableColumnsProps from './code-generate/generate-table-columns-props';
import styles from './index.module.less';
import ParameterTableDefinition from './ParameterTableDefinition';
import ModelCodeDrawer from './ModelCodeDrawer';
import { pathsItem } from '@/shared/ts/api-interface';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import copy from 'copy-to-clipboard';
import { MethodColors } from '@/shared/common';
import { getStringToFn } from '@/shared/utils';
import ApiDefinitionDropdown from './ApiDefinitionDropdown';
import { CustomMethodsItem } from '@/shared/ts/custom';

function getHeaderParams(api: any) {
  if (api.parameters?.length > 0) {
    return api.parameters?.filter((parameter: any) => {
      return parameter.in === 'header';
    });
  }
  return [];
}

function getRequestParams(api: any, resourceDetail: any) {
  if (api.parameters?.length > 0) {
    return api.parameters
      .filter((parameter: any) => {
        return parameter.in !== 'header';
      })
      .map((parameter: any) => {
        return getParameterObject(resourceDetail, parameter);
      });
  }
  return [];
}

const ApiDetail: React.FC<{ api: pathsItem }> = (props) => {
  const { api: selectedApi } = props;
  const [requestParamsData, setRequestParamsData] = useState<any>([]);
  const { resourceDetail, setDefinitionCodeDrawerProps } = useModel('useApiSwitchModel');

  const selectedRequestRowRef = useRef<any[]>([]);
  const selectedResponseRowRef = useRef<any[]>([]);
  useEffect(() => {
    selectedRequestRowRef.current = [];
    selectedResponseRowRef.current = [];
  }, [selectedApi]);

  const showTableColumnsProps = useCallback(() => {
    if (selectedResponseRowRef.current.length < 1) {
      return message.error('请先【响应参数】选择需要生成的字段');
    }
    setDefinitionCodeDrawerProps({
      title: `表格列表配置`,
      visible: true,
      language: 'json',
      generateCode: () => generateTableColumnsProps(selectedResponseRowRef.current),
    });
  }, [setDefinitionCodeDrawerProps, selectedResponseRowRef]);

  const showModelFormItemsCode = useCallback(() => {
    /* if (selectedRequestRowRef.current.length < 1) {
      return message.error('请先【请求参数】选择需要生成的字段');
    } */
    const rows =
      selectedRequestRowRef.current.length < 1 ? requestParamsData[0]?.children : selectedRequestRowRef.current;

    setDefinitionCodeDrawerProps({
      title: `Form Items（${selectedApi.description}）`,
      visible: true,
      language: 'typescript',
      generateCode: () => generateModelFormItemsCode(rows || [], selectedApi),
    });
  }, [setDefinitionCodeDrawerProps, selectedRequestRowRef, requestParamsData]);

  const showModelEnumCode = useCallback(
    (record) => {
      let rows: any;
      if (record && record.description) {
        rows = [record];
      } else {
        const resList = getResponseParams(selectedApi, resourceDetail);
        // const reqList = getRequestParams(selectedApi, resourceDetail);

        let resData;
        let resDataAll: any[] = [];
        if (resList && resList.length) {
          resData = resList.find((item: { name: string }) => item.name === 'data').children;
        }

        function recursionReduce(list: any[]) {
          list.forEach((item: { children: Record<string, any>[] }) => {
            if (item && item.children && item.children.length) {
              recursionReduce(item.children);
            } else {
              resDataAll.push(item);
            }
          });
        }
        recursionReduce(resData || []);
        const data = requestParamsData[0]?.children || [];
        rows = [...data, ...resDataAll].filter((item: { description: string | string[] }) => {
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

  useEffect(() => {
    const data = getRequestParams(selectedApi, resourceDetail);
    setRequestParamsData(data);
  }, [getRequestParams, selectedApi, resourceDetail]);

  // 基础表格列表columns
  const HeaderParamsColumns: TableProps<any>['columns'] = useMemo(
    () => [
      {
        title: '参数名称',
        dataIndex: 'name',
        render: (v) => {
          return (
            <span
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
        // TODO record?.enum
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
      if (item?.type === 'response') {
        if (selectedResponseRowRef.current.length < 1) {
          return message.error('请先【响应参数】选择需要生成的字段');
        }
      } else if (item?.type === 'request') {
        if (selectedRequestRowRef.current.length < 1) {
          return message.error('请先【请求参数】选择需要生成的字段');
        }
      }
      console.log(key, item);
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
              requestSelectedData: selectedRequestRowRef.current,
              responseSelectedData: selectedResponseRowRef.current,
              resourceDetail,
            },
            selectedApi,
          ),
      });
    },
    [selectedResponseRowRef, selectedApi],
  );

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
            {selectedApi.api}
            <CopyToClipboard
              text={selectedApi.api}
              onCopy={() => {
                message.success('api已复制到剪贴板！');
              }}
            >
              <Button type="link" size="small" style={{ marginLeft: '16px' }}>
                复制
              </Button>
            </CopyToClipboard>
            <ApiDefinitionDropdown api={selectedApi} />
          </p>
          <p>接口描述：{selectedApi.description}</p>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <h2 className={styles.h2BorderTitle}>请求头参数</h2>
          <Table
            size="small"
            bordered
            pagination={false}
            columns={HeaderParamsColumns}
            rowKey="name"
            dataSource={getHeaderParams(selectedApi)}
          />
          <Row align="middle" justify="space-between">
            <h2 className={styles.h2BorderTitle}>请求参数</h2>
            <ApiDefinitionDropdown
              api={selectedApi}
              methodType="request"
              dropdownTitle="request"
              onChange={handleDropdownChange}
            />
          </Row>
          <Table
            bordered
            sticky
            rowSelection={{
              onChange: (keys, rows) => {
                selectedRequestRowRef.current = rows;
              },
            }}
            expandable={{ defaultExpandAllRows: true }}
            size="small"
            pagination={false}
            columns={RequestParamsColumns}
            rowKey="key"
            dataSource={requestParamsData}
          />
          <Row align="middle" justify="space-between">
            <h2 className={styles.h2BorderTitle}>响应参数</h2>
            <ApiDefinitionDropdown
              api={selectedApi}
              methodType="response"
              dropdownTitle="response"
              onChange={handleDropdownChange}
            />
          </Row>
          <Table
            rowSelection={{
              onChange: (keys, rows) => {
                selectedResponseRowRef.current = rows;
              },
            }}
            bordered
            sticky
            expandable={{ defaultExpandAllRows: true }}
            size="small"
            pagination={false}
            columns={ResponseParamsColumns}
            rowKey="key"
            dataSource={getResponseParams(selectedApi, resourceDetail)}
          />
        </div>
        <Space style={{ background: '#fff', padding: '10px' }}>
          <Button type="primary" onClick={showTableColumnsProps}>
            生成 Table 列配置
          </Button>
          <Button type="primary" onClick={showModelFormItemsCode}>
            生成 Form 表单元素
          </Button>
          <Button type="primary" onClick={showModelEnumCode}>
            生成全部枚举
          </Button>
          <ModelCodeDrawer />
        </Space>
      </Col>
    );
  }
};

export default ApiDetail;
