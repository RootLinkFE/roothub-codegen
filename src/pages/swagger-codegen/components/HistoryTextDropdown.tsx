/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-03 10:23:22
 * @Description: HistoryTextDropdown
 */
import { Row, Dropdown, Menu, Popover, Button, Table } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import state from '@/stores/index';
import { observer } from 'mobx-react-lite';
import { useMemo, useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { filterSplitTextTowords } from '@/shared/utils';
import { uniqueId } from 'lodash';
import { HistoryItem } from '@/shared/common';

const HistoryTextDropdown: React.FC<{ onChange: (type: string, key: any) => void }> = (props) => {
  const { onChange } = props;
  const swaggerStore = state.swagger;
  const { historyTexts } = state.swagger;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const columns: ColumnsType<any> = [
    {
      title: '文本',
      key: 'content',
      dataIndex: 'content',
      render: (value) => {
        return JSON.stringify(value);
      },
      width: 650,
    },
    {
      title: '操作',
      key: 'operation',
      fixed: 'right',
      width: 220,
      render: (value, row, index) => (
        <>
          <Button
            type="link"
            size="small"
            onClick={() => {
              handleClick('select', row, index);
            }}
          >
            选择
          </Button>
          <Button
            type="link"
            size="small"
            title="文本拼接"
            onClick={() => {
              handleClick('join', row, index);
            }}
          >
            拼接
          </Button>
          <Button
            type="link"
            size="small"
            title="设置搜索项"
            onClick={() => {
              handleClick('setting', row, index);
            }}
          >
            设置
          </Button>
          <Button
            type="link"
            size="small"
            danger
            onClick={() => {
              handleClick('delete', row, index);
            }}
          >
            删除
          </Button>
        </>
      ),
    },
  ];

  const handleClick = (t: string, row: any, index: number) => {
    if (t === 'select') {
      onChange('text', row.content);
    } else if (t === 'join') {
      // 拼接文本
      const orderRows = concatOrderRows(row.id);
      const record: HistoryItem = {
        id: uniqueId('history_text_'),
        content: [...row.content, ...orderRows],
      };
      swaggerStore.setHistoryTexts([record, ...historyTexts]);
    } else if (t === 'setting') {
      onChange(
        'searchColumn',
        JSON.stringify({
          search: row.content.map((v: any) => v.words),
          column: concatOrderRows(row.id).map((v: any) => v.words),
        }),
      );
    } else if (t === 'delete') {
      handleDelete(row, index);
    }
    setSelectedRowKeys([]);
  };

  const concatOrderRows = (currentId: string) => {
    let orderRows: any = [];
    selectedRowKeys.forEach((v) => {
      const item = historyTexts.find((o) => v === o.id && v !== currentId);
      if (item) {
        orderRows = [...orderRows, ...filterSplitTextTowords(item.content)];
      }
    });
    return orderRows;
  };

  const handleDelete = (row: HistoryItem, i: number) => {
    const list = [...historyTexts];
    list.splice(i, 1);
    swaggerStore.setHistoryTexts(list);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const content = useMemo(() => {
    return (
      <Table rowSelection={rowSelection} pagination={false} rowKey="id" columns={columns} dataSource={historyTexts} />
    );
  }, [historyTexts, selectedRowKeys]);

  return (
    <Popover content={content} title="">
      <Button>历史文本</Button>
    </Popover>
  );
};

export default observer(HistoryTextDropdown);
