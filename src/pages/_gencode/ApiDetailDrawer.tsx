import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';

import {
  Drawer,
  DrawerProps,
  Tag,
  Table,
  TableProps,
  Space,
  Button,
  Dropdown,
  Menu,
  message,
} from 'antd';
import { noop } from 'lodash';
import { useCallback, useEffect, useRef } from 'react';
import { useModel } from 'umi';
import { MethodColors } from './ApiTreeForm';
import generateModelClass from './code-generate/generate-model-class';
import generateModelFormItemsCode from './code-generate/generate-model-form-items-code';
import generateTableColumnsProps from './code-generate/generate-table-columns-props';
import generateTypeScriptType from './code-generate/generate-typescript-type';
import styles from './index.module.less';
import ParameterTableDefinition from './ParameterTableDefinition';

const HeaderParamsColumns: TableProps<any>['columns'] = [
  { title: '参数名称', dataIndex: 'name' },
  { title: '参数说明', dataIndex: 'description' },
  {
    title: '必须',
    dataIndex: 'required',
    width: '60px',
    render: (v) => (v ? <span style={{ color: '#f50' }}>是</span> : '否'),
  },
  { title: '数据类型', dataIndex: 'type' },
];

const RequestParamsColumns = HeaderParamsColumns.slice(0);
RequestParamsColumns.push({
  title: '模型',
  dataIndex: 'schema',
  render: (definition: any) =>
    definition ? <ParameterTableDefinition definition={definition} /> : null,
});
RequestParamsColumns.splice(1, 0, {
  title: '请求类型',
  dataIndex: 'in',
  width: '80px',
});

const ResponseParamsColumns = HeaderParamsColumns.slice(0);
ResponseParamsColumns.slice(2, 1);
ResponseParamsColumns.push({
  title: '模型',
  dataIndex: 'schema',
  render: (definition: any) =>
    definition ? <ParameterTableDefinition definition={definition} /> : null,
});

function getHeaderParams(api: any) {
  return api.parameters.filter((parameter: any) => {
    return parameter.in === 'header';
  });
}

function getSwaggerRef(obj: any) {
  return obj.schema?.$ref || obj.$ref || obj.items?.$ref;
}

function getParameterObject(
  resourceDetail: any,
  parameter: any,
  parent: string = '',
): any {
  const $ref = getSwaggerRef(parameter);
  let definition: any;
  let children;
  if ($ref && /#\/definitions\//.test($ref)) {
    const refKey = $ref.replace('#/definitions/', '');
    definition = resourceDetail.definitions?.[refKey];
    if (definition) {
      const { properties, required } = definition;
      children = Object.entries(properties).map(
        ([propertyKey, property]: [string, any]) => {
          let result;
          const hasRef = getSwaggerRef(property);
          if (hasRef) {
            if (hasRef !== $ref) {
              result = {
                name: propertyKey,
                ...getParameterObject(
                  resourceDetail,
                  property,
                  `${parent}${propertyKey}#`,
                ),
              };
            } else {
              result = {
                name: propertyKey,
                type: refKey,
                description: definition.title,
              };
            }

            if (hasRef && property.type === 'array') {
              result.type = result.type + '[]';
            }
          } else {
            result = {
              name: propertyKey,
              ...property,
            };
          }
          result.key = parent + propertyKey;
          result.required = required?.includes(propertyKey) ?? false;
          return result;
        },
      );
    }
  }
  const result = { ...parameter, children, key: parent + parameter.name };
  if (definition) {
    result.description = definition.title;
    result.type = definition.title;
    result.schema = {
      ...definition,
    };
  }
  return result;
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

function getResponseParams(api: any, resourceDetail: any) {
  if (!api.responses['200']) {
    return [];
  }
  return (
    getParameterObject(resourceDetail, api.responses['200']).children || []
  );
}

const ApiDetailDrawer: React.FC<{ api: any } & DrawerProps> = (props) => {
  const { api, ...drawerProps } = props;
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
  console.log('api: ', api);

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
    if (selectedRequestRowRef.current.length < 1) {
      return message.error('请先【请求参数】选择需要生成的字段');
    }
    setDefinitionCodeDrawerProps({
      title: `Model Form Items`,
      visible: true,
      language: 'javascript',
      generateCode: () =>
        generateModelFormItemsCode(selectedRequestRowRef.current),
    });
  }, [setDefinitionCodeDrawerProps, selectedRequestRowRef]);

  return (
    <Drawer
      width="90%"
      bodyStyle={{ padding: 0 }}
      {...drawerProps}
      footer={
        <Space>
          <Button onClick={showTableColumnsProps}>生成 Table 列配置</Button>
          <Button onClick={showModelFormItemsCode}>生成 Form 表单元素</Button>
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
          dataSource={getRequestParams(api, resourceDetail)}
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
