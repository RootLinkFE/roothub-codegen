/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-11-25 11:27:44
 * @Description: ApiurlPrefixEditTable
 */
import { Form, Input, Switch, Popconfirm, Table, Typography, Space, Button } from 'antd';
import React, { useState, useMemo } from 'react';
import { apiurlPrefixItem } from '@/shared/ts/settings';
import state from '@/stores/index';
import { uniqueId } from 'lodash';
import { storeTips } from '@/shared/vscode';

interface Item extends apiurlPrefixItem {}

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'switch' | 'text';
  record: Item;
  index: number;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'switch' ? <Switch checked={record.status} /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `请输入 ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const ApiurlPrefixEditTable: React.FC = () => {
  const apiurlPrefixList = useMemo(() => {
    return state.settings.Settings?.apiurlPrefixList ?? [];
  }, [state.settings.Settings]);
  const [form] = Form.useForm();
  const [data, setData] = useState(apiurlPrefixList);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record: Item) => record.key === editingKey;

  const handleAdd = () => {
    const item: apiurlPrefixItem = {
      key: uniqueId(Date.now().toString()),
      url: '',
      prefix: '',
      status: true,
    };
    const list = [item, ...data];
    setData(list);
    form.setFieldsValue(item);
    setEditingKey(item.key);
  };

  const edit = (record: Partial<Item> & { key: React.Key }) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const handleDelete = (record: Partial<Item> & { key: React.Key }, index: number) => {
    const list = [...data];
    list.splice(index, 1);
    setEditingKey('');
    setData(list);
    state.settings.setSettingsApiurlPrefixList(list);
  };

  const cancel = () => {
    if (!apiurlPrefixList.find((v) => v.key === editingKey)) {
      const list = [...data];
      list.shift();
      setData(list);
    }
    setEditingKey('');
  };

  const save = async (key: React.Key) => {
    try {
      const row = (await form.validateFields()) as Item;

      const newData: apiurlPrefixItem[] = [...data];
      const index = newData.findIndex((item) => key === item.key);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setData(newData);
        setEditingKey('');
      } else {
        newData.push(row);
        setData(newData);
        setEditingKey('');
      }
      state.settings.setSettingsApiurlPrefixList(newData);
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: '接口文档地址',
      dataIndex: 'url',
      editable: true,
    },
    {
      title: '前缀',
      dataIndex: 'prefix',
      editable: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (value: any) => <span>{value ? '启用' : '停用'}</span>,
      editable: true,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_: any, record: Item, index: number) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link onClick={() => save(record.key)} style={{ marginRight: 8 }}>
              保存
            </Typography.Link>
            <Popconfirm title="确定取消?" onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <>
            <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
              编辑
            </Typography.Link>
            <Popconfirm
              title="确认是否删除该前缀配置？"
              onConfirm={() => {
                handleDelete(record, index);
              }}
              onCancel={() => {}}
              okText="是"
              cancelText="否"
            >
              <Button danger type="text">
                删除
              </Button>
            </Popconfirm>
          </>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: Item) => ({
        record,
        inputType: col.dataIndex === 'status' ? 'switch' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <Form form={form} component={false}>
      <Space>
        <Button
          type="primary"
          title="添加"
          disabled={editingKey !== ''}
          onClick={handleAdd}
          style={{ margin: '0 16px 16px 0' }}
        >
          添加
        </Button>
        <Typography.Text type="secondary">{storeTips}</Typography.Text>
      </Space>
      <Table
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        bordered
        dataSource={data}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={{
          onChange: cancel,
        }}
      />
    </Form>
  );
};

export default ApiurlPrefixEditTable;
