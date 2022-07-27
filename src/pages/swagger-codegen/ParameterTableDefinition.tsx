/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-06-14 17:11:40
 * @Description:
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

const ParameterTableDefinition: React.FC<{ definition: any; record: any; api: pathsItem }> = function (props) {
  const { definition, record, api } = props;

  const { setSelectedDefinition, setDefinitionCodeDrawerProps } = useModel('useApiSwitchModel');
  const modelGenerateMethods = codeGenerateMethods.filter((v) => v.type === 'model');

  const title = useMemo(() => {
    return definition.title || definition?.xml?.name || (record?.$ref && record?.$ref.replace('#/definitions/', ''));
  }, [definition, record]);

  const CustomMethods = useMemo(() => state.custom.CustomMethods, [state.custom.CustomMethods]);

  const items = useMemo(() => {
    return [
      {
        key: 'root',
        label: 'root',
        type: 'group',
        children: modelGenerateMethods.map((v) => {
          return {
            key: v.key,
            label: v.label,
          };
        }),
      },
      {
        key: 'custom',
        label: 'custom',
        type: 'group',
        children: state.custom.CustomMethods.filter((v: CustomMethodsItem) => v.type === 'model'),
      },
    ];
  }, [state.custom.CustomMethods]);

  const handleMenuItemClick = ({ key }: any) => {
    const params = {
      ...definition,
      title,
    };
    const generateMethod: any = modelGenerateMethods.find((v) => v.key === key);
    let drawerProps = {
      title: `${api.summary}(${title})`,
      visible: true,
      language: 'javascript',
      generateCode: () => {},
    };
    if (generateMethod) {
      drawerProps.generateCode = () => generateMethod.function(definition, record, api);
    } else {
      let item: any = CustomMethods.find((v) => v.key === key) ?? {};
      const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
      drawerProps.generateCode = () => cutomCodeFn({ definition, record }, api);
    }
    setSelectedDefinition(params);
    setDefinitionCodeDrawerProps(drawerProps);
  };

  return (
    <Dropdown overlay={<Menu items={items} onClick={handleMenuItemClick}></Menu>} trigger={['hover']}>
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        {title} <DownOutlined />
      </a>
    </Dropdown>
  );
};

export default ParameterTableDefinition;
