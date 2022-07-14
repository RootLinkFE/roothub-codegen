/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-11 17:26:45
 * @Description: 下拉caodegen-menu
 */
import { Button, Dropdown, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { useMemo } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import { CustomMethodsItem } from '@/shared/ts/custom';
import state from '@/stores/index';

const CodeGenDropdown: React.FC<{ onChange: (key: string, item?: CustomMethodsItem | undefined) => void }> = (
  props,
) => {
  const { onChange } = props;

  const CustomTypeMethods = useMemo(() => state.custom.CustomTypeMethods, [state.custom.CustomTypeMethods]);
  const CustomMethods = useMemo(() => state.custom.CustomMethods, [state.custom.CustomMethods]);

  const dropdownMenuClick: MenuProps['onClick'] = ({ key }) => {
    onChange(
      key,
      CustomMethods.find((v) => v.key === key),
    );
  };

  const dropdownMenu = useMemo(() => {
    return <Menu onClick={dropdownMenuClick} items={CustomTypeMethods} />;
  }, []);

  return (
    <Dropdown overlay={dropdownMenu} trigger={['hover']}>
      <Button type="primary">
        CodeGen
        <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default CodeGenDropdown;
