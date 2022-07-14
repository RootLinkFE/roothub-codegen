/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-13 11:51:08
 * @Description: 自定义方法列表
 */
import { Button, Drawer, DrawerProps, Space, Table, TableColumnsType, Popconfirm, message } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import state from '@/stores/index';
import { CustomMethodsItem } from '@/shared/ts/custom';
import EditCustomMethodDrawer from './EditCustomMethodDrawer';
import { observer } from 'mobx-react-lite';

const CustomMethodsDrawer: React.FC<DrawerProps> = (props) => {
  const { ...drawerProps } = props;
  const [editCustomMethodsVisible, setEditCustomMethodsVisible] = useState<boolean | undefined>(false);
  const [row, setRow] = useState<CustomMethodsItem | undefined>(undefined);
  const dataSource = useMemo(() => {
    return state.custom.CustomMethods;
  }, [state.custom.CustomMethods]);

  const handleConfirmDelete = (r: CustomMethodsItem, index: number) => {
    let list = [...dataSource];
    list.splice(index, 1);
    state.custom.setCustomMethods(list);
    message.success(`删除(${r.key})成功！`);
  };

  const handleEdit = (r: CustomMethodsItem) => {
    setEditCustomMethodsVisible(true);
    setRow(r);
  };

  const columns: TableColumnsType<CustomMethodsItem> | undefined = [
    {
      dataIndex: 'key',
      key: 'key',
      title: '键值',
      width: 120,
    },
    {
      dataIndex: 'label',
      key: 'label',
      title: '名称',
      width: 120,
    },
    {
      dataIndex: 'type',
      key: 'type',
      title: '类型',
      width: 120,
    },
    {
      dataIndex: 'function',
      key: 'function',
      title: '方法',
      ellipsis: true,
    },
    {
      dataIndex: 'action',
      key: 'action',
      title: '操作',
      width: 220,
      render: (key, r, index) => {
        return (
          <>
            <Button
              type="link"
              onClick={() => {
                handleEdit(r);
              }}
            >
              编辑
            </Button>
            {/* <Button
              type="link"
              onClick={() => {
                handleEdit(r);
              }}
            >
              复制
            </Button> */}

            <Popconfirm
              title="确认是否删除该方法？"
              onConfirm={() => {
                handleConfirmDelete(r, index);
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

  const handleAdd = () => {
    setEditCustomMethodsVisible(true);
    setRow(undefined);
  };

  return (
    <>
      <Drawer
        width="90%"
        bodyStyle={{ padding: 16 }}
        title="自定义方法列表"
        {...drawerProps}
        zIndex={200}
        destroyOnClose={true}
        footer={
          <Space>
            <Button type="primary" title="添加自定义方法" onClick={handleAdd}>
              添加
            </Button>
          </Space>
        }
      >
        <Table bordered dataSource={dataSource} columns={columns} style={{ width: '100%' }} pagination={false} />
      </Drawer>
      <EditCustomMethodDrawer
        visible={editCustomMethodsVisible}
        data={row}
        onClose={() => {
          setEditCustomMethodsVisible(false);
        }}
      />
    </>
  );
};

export default observer(CustomMethodsDrawer);
