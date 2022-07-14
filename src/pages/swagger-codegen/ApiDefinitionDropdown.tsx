/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 13:50:44
 * @Description: api下拉生成
 */
import { Dropdown, Menu } from 'antd';
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';
import { useModel } from 'umi';
import { useCallback, useMemo } from 'react';
import state from '@/stores/index';
import { getStringToFn } from '@/shared/utils';
import { CustomMethodsItem } from '@/shared/ts/custom';
import { pathsItem } from '@/shared/ts/api-interface';
import { codeGenerateMethods } from './code-generate/index';

const ApiDefinitionDropdown: React.FC<{ api: pathsItem }> = function (props) {
  const { api } = props;

  const apiGenerateMethods = codeGenerateMethods.filter((v) => v.type === 'api');

  const { setDefinitionCodeDrawerProps } = useModel('useApiSwitchModel');

  const CustomMethods = useMemo(() => state.custom.CustomMethods, [state.custom.CustomMethods]);

  const items = useMemo(() => {
    let apiCustomMethods = state.custom.CustomMethods.filter((v: CustomMethodsItem) => v.type === 'api');
    return [
      {
        key: 'root',
        label: 'root',
        type: 'group',
        children: apiGenerateMethods.map((v) => {
          return {
            key: v.key,
            label: v.label,
          };
        }),
      },
      apiCustomMethods.length > 0
        ? {
            key: 'custom',
            label: 'custom',
            type: 'group',
            children: apiCustomMethods,
          }
        : null,
    ];
  }, [state.custom.CustomMethods]);

  const handleMenuItemClick = ({ key }: any) => {
    const generateMethod: any = apiGenerateMethods.find((v) => v.key === key);
    let drawerProps = {
      title: api.summary,
      visible: true,
      language: 'javascript',
      generateCode: () => {},
    };
    if (generateMethod) {
      drawerProps.generateCode = () => generateMethod.function(api);
    } else {
      let item: any = CustomMethods.find((v) => v.key === key) ?? {};
      const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
      drawerProps.generateCode = () => cutomCodeFn(api);
    }
    setDefinitionCodeDrawerProps(drawerProps);
  };

  return (
    <Dropdown overlay={<Menu onClick={handleMenuItemClick} items={items} />} trigger={['hover']}>
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        复制api <DownOutlined />
      </a>
    </Dropdown>
  );
};

export default ApiDefinitionDropdown;
