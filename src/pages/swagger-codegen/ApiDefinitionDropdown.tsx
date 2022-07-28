/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 13:50:44
 * @Description: 方法下拉生成
 */
import { Dropdown, Menu, Button } from 'antd';
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';
import { useModel } from 'umi';
import { useCallback, useMemo } from 'react';
import state from '@/stores/index';
import { getStringToFn } from '@/shared/utils';
import { CustomMethodsItem } from '@/shared/ts/custom';
import { pathsItem } from '@/shared/ts/api-interface';
import { codeGenerateMethods } from './code-generate/index';

const ApiDefinitionDropdown: React.FC<{
  api: pathsItem;
  methodType?: string;
  dropdownTitle?: string;
  buttonType?: 'link' | 'text' | 'dashed' | 'default' | 'ghost' | 'primary' | undefined;
  onChange?: (key: string, item?: CustomMethodsItem | undefined) => void;
}> = function (props) {
  const { api, dropdownTitle = '复制api', methodType = 'api', buttonType = 'link', onChange } = props;

  const generateMethods = codeGenerateMethods.filter((v) => v.type === methodType && v.status);
  const { setDefinitionCodeDrawerProps } = useModel('useApiSwitchModel');

  const CustomMethods = useMemo(() => Array.from(state.custom.EnabledCustomMethods), [
    state.custom.EnabledCustomMethods,
  ]);

  const items = useMemo(() => {
    let currentCustomMethods = CustomMethods.filter((v: CustomMethodsItem) => v.type === methodType);
    return [
      {
        key: 'root',
        label: 'root',
        type: 'group',
        children: generateMethods.map((v) => {
          return {
            key: v.key,
            label: v.label,
          };
        }),
      },
      currentCustomMethods.length > 0
        ? {
            key: 'custom',
            label: 'custom',
            type: 'group',
            children: currentCustomMethods,
          }
        : null,
    ];
  }, [CustomMethods]);

  const handleMenuItemClick = ({ key }: any) => {
    if (methodType === 'api') {
      const generateMethod: any = generateMethods.find((v) => v.key === key);
      let drawerProps = {
        title: '',
        visible: true,
        language: 'javascript',
        generateCode: () => {},
      };
      drawerProps.title = api.summary;
      if (generateMethod) {
        drawerProps.generateCode = () => generateMethod.function(api);
      } else {
        let item: any = CustomMethods.find((v) => v.key === key) ?? {};
        const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
        drawerProps.generateCode = () => cutomCodeFn(api);
      }
      setDefinitionCodeDrawerProps(drawerProps);
    } else {
      if (onChange) {
        let item: any = generateMethods.find((v) => v.key === key);
        if (item) {
          onChange(key, { ...item });
        } else {
          item = CustomMethods.find((v) => v.key === key);
          onChange(key, { ...item });
        }
      }
    }
  };

  return (
    <Dropdown overlay={<Menu onClick={handleMenuItemClick} items={items} />} trigger={['hover']}>
      <Button type={buttonType}>
        {dropdownTitle} <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ApiDefinitionDropdown;
