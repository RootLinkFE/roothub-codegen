/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 13:50:44
 * @Description: 文本过滤方法下拉
 */
import { Dropdown, Menu, Button } from 'antd';
import { useMemo } from 'react';
import state from '@/stores/index';
import { orderCodeGenerateMethods } from '../code-generate/index';

const TextTransformDropdown: React.FC<{
  value: any;
  methodType?: string;
  dropdownTitle?: string;
  buttonType?: 'link' | 'text' | 'dashed' | 'default' | 'ghost' | 'primary' | undefined;
  onChange: (value: any) => void;
}> = function (props) {
  const { value, dropdownTitle = '过滤', methodType = 'transform', buttonType = 'link', onChange } = props;
  const generateMethods = orderCodeGenerateMethods.filter((v) => v.type === methodType && v.status);
  const CustomMethods = useMemo(
    () => Array.from(state.custom.EnabledCustomMethods),
    [state.custom.EnabledCustomMethods],
  );

  const handleMenuItemClick = ({ key }: any) => {
    let item: any = generateMethods.find((v) => v.key === key);
    let textRecord: any = item.function(value);
    onChange(textRecord);
  };

  return (
    <Dropdown
      overlay={
        <Menu onClick={handleMenuItemClick}>
          {generateMethods.map((v) => {
            return <Menu.Item key={v.key}>{v.label}</Menu.Item>;
          })}
        </Menu>
      }
      trigger={['hover']}
    >
      <Button type={buttonType}>{dropdownTitle}</Button>
    </Dropdown>
  );
};

export default TextTransformDropdown;
