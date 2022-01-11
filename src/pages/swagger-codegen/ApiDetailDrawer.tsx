import getParameterObject from '@/shared/getParameterObject';
import getResponseParams from '@/shared/getResponseParams';
import {
  Button,
  Drawer,
  DrawerProps,
  message,
  Space,
  Table,
  TableProps,
  Tag,
} from 'antd';
import { unionBy } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useModel } from 'umi';
import { MethodColors } from './ApiTreeForm';
import generateModelFormItemsCode from './code-generate/generate-model-form-items-code';
import generateEnumCode from './code-generate/generate-enum-code';
import generateTableColumnsProps from './code-generate/generate-table-columns-props';
import styles from './index.module.less';
import ParameterTableDefinition from './ParameterTableDefinition';

function getHeaderParams(api: any) {
  return api.parameters.filter((parameter: any) => {
    return parameter.in === 'header';
  });
}

function getRequestParams(api: any, resourceDetail: any) {
  return api.parameters
    .filter((parameter: any) => {
      return parameter.in !== 'header';
    })
    .map((parameter: any) => {
      return getParameterObject(resourceDetail, parameter);
    });
}

const ApiDetailDrawer: React.FC<{ api: any } & DrawerProps> = (props) => {
  const { api, ...drawerProps } = props;
  const [requestParamsData, setRequestParamsData] = useState<any>([]);
  const {
    resourceDetail,
    setSelectedDefinition,
    setDefinitionCodeDrawerProps,
  } = useModel('useApiSwitchModel');

  const selectedRequestRowRef = useRef<any[]>([]);
  const selectedResponseRowRef = useRef<any[]>([]);
  useEffect(() => {
    selectedRequestRowRef.current = [];
    selectedResponseRowRef.current = [];
  }, [api]);

  const showTableColumnsProps = useCallback(() => {
    if (selectedResponseRowRef.current.length < 1) {
      return message.error('请先【响应参数】选择需要生成的字段');
    }
    setDefinitionCodeDrawerProps({
      title: `表单列表配置`,
      visible: true,
      language: 'json',
      generateCode: () =>
        generateTableColumnsProps(selectedResponseRowRef.current),
    });
  }, [setDefinitionCodeDrawerProps, selectedResponseRowRef]);

  const showModelFormItemsCode = useCallback(() => {
    /* if (selectedRequestRowRef.current.length < 1) {
      return message.error('请先【请求参数】选择需要生成的字段');
    } */
    const rows =
      selectedRequestRowRef.current.length < 1
        ? requestParamsData[0]?.children
        : selectedRequestRowRef.current;

    setDefinitionCodeDrawerProps({
      title: `Form Items（${api.description}）`,
      visible: true,
      language: 'typescript',
      generateCode: () => generateModelFormItemsCode(rows || [], api),
    });
  }, [setDefinitionCodeDrawerProps, selectedRequestRowRef, requestParamsData]);

  const showModelEnumCode = useCallback(
    (record) => {
      let rows: any;
      if (record && record.description) {
        rows = [record];
      } else {
        const resList = getResponseParams(api, resourceDetail);
        let resData;
        if (resList && resList.length) {
          resData = resList.find(
            (item: { name: string }) => item.name === 'data',
          ).children;
        }
        const data =
          selectedRequestRowRef.current.length < 1
            ? requestParamsData[0]?.children
            : selectedRequestRowRef.current;
        rows = [...data, ...resData].filter(
          (item: { description: string | string[] }) => {
            if (item && item.description && item.description.indexOf) {
              return item.description.indexOf('#ENUM#') !== -1;
            }
            return false;
          },
        );
        // 去掉重复的枚举
        rows = unionBy(rows, 'name');
      }

      setDefinitionCodeDrawerProps({
        title: `枚举（${api.description}）`,
        visible: true,
        language: 'typescript',
        generateCode: () => generateEnumCode(rows || [], api),
      });
    },
    [setDefinitionCodeDrawerProps, requestParamsData],
  );

  useEffect(() => {
    const data = getRequestParams(api, resourceDetail);
    setRequestParamsData(data);
  }, [getRequestParams, api, resourceDetail]);

  const HeaderParamsColumns: TableProps<any>['columns'] = useMemo(
    () => [
      { title: '参数名称', dataIndex: 'name' },
      { title: '参数说明', dataIndex: 'description' },
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

  const RequestParamsColumns = useMemo(() => {
    const list = HeaderParamsColumns.slice(0);
    list.push({
      title: '模型',
      dataIndex: 'schema',
      render: (definition: any, record) => {
        if (definition) {
          return <ParameterTableDefinition definition={definition} />;
        }
        if (record.description && record.description.indexOf('#ENUM#') !== -1) {
          return <a onClick={() => showModelEnumCode(record)}>生成枚举</a>;
        }
        return null;
      },
    });
    list.splice(1, 0, {
      title: '请求类型',
      dataIndex: 'in',
      width: '80px',
    });
    return list;
  }, []);

  const ResponseParamsColumns = useMemo(() => {
    const list = HeaderParamsColumns.slice(0);
    list.slice(2, 1);
    list.push({
      title: '模型',
      dataIndex: 'schema',
      render: (definition: any, record) => {
        if (definition) {
          return <ParameterTableDefinition definition={definition} />;
        }
        if (record.description && record.description.indexOf('#ENUM#') !== -1) {
          return <a onClick={() => showModelEnumCode(record)}>生成枚举</a>;
        }
        return null;
      },
    });
    return list;
  }, []);

  return (
    <Drawer
      width="90%"
      bodyStyle={{ padding: 0 }}
      {...drawerProps}
      zIndex={200}
      destroyOnClose={true}
      footer={
        <Space>
          <Button onClick={showTableColumnsProps}>生成 Table 列配置</Button>
          <Button onClick={showModelFormItemsCode}>生成 Form 表单元素</Button>
          <Button onClick={showModelEnumCode}>生成 枚举</Button>
        </Space>
      }
    >
      <div style={{ padding: '16px' }}>
        <p>
          <Tag color={MethodColors[api.method] || '#87d068'}>
            {api.method.toUpperCase()}
          </Tag>{' '}
          {api.api}
        </p>
        <p>接口描述：{api.description}</p>
        <h2 className={styles.h2Title}>请求头参数</h2>
        <Table
          size="small"
          bordered
          pagination={false}
          columns={HeaderParamsColumns}
          rowKey="name"
          dataSource={getHeaderParams(api)}
        />
        <h2 className={styles.h2Title}>请求参数</h2>
        <Table
          bordered
          sticky
          rowSelection={{
            onChange: (_, rows) => {
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
        <h2 className={styles.h2Title}>200 响应参数</h2>
        <Table
          rowSelection={{
            onChange: (_, rows) => {
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
          dataSource={getResponseParams(api, resourceDetail)}
        />
      </div>
    </Drawer>
  );
};

export default ApiDetailDrawer;
