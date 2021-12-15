import React, { useContext, useState, useEffect, useRef } from 'react';
import {
  Form,
  Input,
  Row,
  Card,
  Button,
  InputNumber,
  Select,
  TreeSelect,
  message,
  Popconfirm,
  Table,
} from 'antd';
const { Option } = Select;

import { FormInstance } from 'antd/lib/form';
import { TableRowSelection } from '@ant-design/pro-table/lib/typing';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key: string;
  name: string;
  componentType: string;
  placeholder: string;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  type: string;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  type,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<Input>(null);
  const form = useContext(EditableContext)!;
  const componentList = [
    {
      value: 'Input',
      name: '输入框',
    },
    {
      value: 'Select',
      name: '下拉框',
    },
    {
      value: 'Switch',
      name: '开关',
    },
    {
      value: 'InputNumber',
      name: '数字输入框',
    },
  ];

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;
  let selectChildrenNode: any = [];
  if (type === 'componentSelect') {
    componentList.forEach((item: { value: string; name: string }) => {
      selectChildrenNode.push(
        <Option value={item.value} key={item.value}>
          {item.name}
        </Option>,
      );
    });
  }

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {type === 'componentSelect' ? (
          <Select
            ref={inputRef}
            value={record.componentType}
            onChange={save}
            onBlur={save}
            style={{
              width: '100%',
            }}
          >
            {selectChildrenNode}
          </Select>
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingRight: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0] & {
  definitions?: any;
  requestParameters?: [];
  responseParameters?: {};
};

interface DataType {
  key: React.Key;
  name: string;
  componentType: string;
  placeholder: string;
  type: string;
  format: string;
  description: string;
}

interface EditableTableState {
  dataSource: DataType[];
  selectedRows: DataType[];
  count: number;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

class EditableTable extends React.Component<
  EditableTableProps,
  EditableTableState
> {
  columns: (ColumnTypes[number] & {
    editable?: boolean;
    type: string;
    dataIndex: string;
  })[];

  constructor(props: EditableTableProps) {
    super(props);

    this.columns = [
      {
        title: '名称',
        dataIndex: 'name',
        width: '30%',
        editable: true,
        type: 'input',
      },
      {
        title: '组件类型',
        dataIndex: 'componentType',
        editable: true,
        type: 'componentSelect',
      },
      {
        title: '提示语',
        dataIndex: 'placeholder',
        editable: true,
        type: 'input',
      },
      // {
      //   title: 'operation',
      //   dataIndex: 'operation',
      //   render: (_, record: { key: React.Key }) =>
      //     this.state.dataSource.length >= 1 ? (
      //       <Popconfirm title="Sure to delete?" onConfirm={() => this.handleDelete(record.key)}>
      //         <a>Delete</a>
      //       </Popconfirm>
      //     ) : null,
      // },
    ];

    this.state = {
      dataSource: [],
      selectedRows: [],
      count: 2,
    };
  }

  componentWillReceiveProps() {
    this.handleData();
  }

  handleDelete = (key: React.Key) => {
    const dataSource = [...this.state.dataSource];
    this.setState({
      dataSource: dataSource.filter((item) => item.key !== key),
    });
  };

  handleData = () => {
    console.log(this.state, this.props);
    let requestParameters: any = this.props.requestParameters;
    this.setState({
      dataSource: requestParameters,
      selectedRows: requestParameters.filter((m: { require: boolean }) => {
        return m.require;
      }),
    });
  };

  handleSave = (row: DataType) => {
    const newData = [...this.state.dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ dataSource: newData });
  };

  render() {
    const { dataSource } = this.state;

    const components = {
      body: {
        row: EditableRow,
        cell: EditableCell,
      },
    };

    const columns = this.columns.map((col) => {
      if (!col.editable) {
        return col;
      }
      return {
        ...col,
        onCell: (record: DataType) => ({
          record,
          editable: col.editable,
          type: col.type,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    const rowSelection = {
      onChange: (selectedRowKeys: React.Key[], selectedRows = []) => {
        this.setState({ selectedRows });
      },
    };

    return (
      <div style={{ width: '100%' }}>
        {/* <Button onClick={this.handleData} type="primary" style={{ marginBottom: 16 }}>
          解析
        </Button> */}
        <Table
          components={components}
          rowClassName={() => 'editable-row'}
          bordered
          dataSource={dataSource}
          columns={columns as ColumnTypes}
          rowSelection={rowSelection as TableRowSelection}
          style={{ width: '100%' }}
          pagination={false}
        />
      </div>
    );
  }
}

export default EditableTable;
