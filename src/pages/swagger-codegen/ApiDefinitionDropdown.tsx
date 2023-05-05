/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-07-14 13:50:44
 * @Description: api方法下拉代码生成
 */
import { Dropdown, Menu, Button } from 'antd';
import CodeOutlined from '@ant-design/icons/lib/icons/CodeOutlined';
import { useModel } from 'umi';
import { useMemo } from 'react';
import state from '@/stores/index';
import { getStringToFn, getRequestParams, filterTransResult } from '@/shared/utils';
import { CustomMethodsItem } from '@/shared/ts/custom';
import { codeGenerateMethods } from './code-generate/index';
import { observer } from 'mobx-react-lite';
import { translateZhToEn } from '@/shared/baidu-translate';

const ApiDefinitionDropdown: React.FC<{
  api: any;
  methodType?: string;
  dropdownTitle?: string;
  buttonType?: 'link' | 'text' | 'dashed' | 'default' | 'ghost' | 'primary' | undefined;
  onChange?: (key: string, item?: CustomMethodsItem | undefined) => void;
  isPaths?: boolean; // 是否Paths循环生成
}> = function (props) {
  const { api, dropdownTitle = '代码生成', methodType = 'api', buttonType = 'link', onChange, isPaths } = props;

  const generateMethods = codeGenerateMethods.filter((v) => v.type === methodType && v.status);
  const { setDefinitionCodeDrawerProps, resourceDetail, apiurlPrefix } = useModel('useApiSwitchModel');

  const CustomMethods = useMemo(() => Array.from(state.custom.EnabledCustomMethods), [
    state.custom.EnabledCustomMethods,
  ]);

  const prefix = useMemo(() => {
    // 默认前缀 + basePath
    return `${apiurlPrefix}${resourceDetail?.basePath}`;
  }, [apiurlPrefix, resourceDetail]);

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

  const requestParams = getRequestParams(api, resourceDetail);

  const handleMenuItemClick = async ({ key }: any) => {
    let drawerProps = {
      title: '',
      visible: true,
      language: 'javascript',
      generateCode: () => {},
    };
    const generateMethod: any = generateMethods.find((v) => v.key === key);
    if (isPaths) {
      if (methodType === 'api') {
        drawerProps.title = api?.summary || '';
        const { paths } = api;
        let apiFn: any = () => {};
        if (generateMethod) {
          apiFn = generateMethod.function;
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          apiFn = item?.function ? getStringToFn(item.function) : () => {};
        }
        drawerProps.generateCode = () => {
          let resultText = '';
          paths.forEach((m: any) => {
            const curRequestParams = m.requestParams || getRequestParams(m, resourceDetail);
            resultText +=
              apiFn({ ...m, requestParams: curRequestParams }, prefix) +
              `
`;
          });
          return resultText;
        };

        setDefinitionCodeDrawerProps(drawerProps);
      }
    } else {
      if (methodType === 'api') {
        drawerProps.title = api?.summary || '';
        if (generateMethod) {
          drawerProps.generateCode = () => generateMethod.function({ ...api, requestParams }, prefix);
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
          drawerProps.generateCode = () => cutomCodeFn({ ...api, requestParams }, prefix);
        }
        setDefinitionCodeDrawerProps(drawerProps);
      } else if (methodType === 'text') {
        const value = api;
        drawerProps.title = JSON.stringify(value) || '';
        let translateReault = new Map<string, string>();
        const res = await translateZhToEn(value.join('\n'));
        if (res) {
          translateReault = filterTransResult(res?.trans_result || []);
        }
        if (generateMethod) {
          drawerProps.generateCode = () => generateMethod.function(value, translateReault);
        } else {
          let item: any = CustomMethods.find((v) => v.key === key) ?? {};
          const cutomCodeFn = item?.function ? getStringToFn(item.function) : () => {};
          drawerProps.generateCode = () => cutomCodeFn(value, translateReault);
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
    }
  };

  return (
    <Dropdown overlay={<Menu onClick={handleMenuItemClick} items={items} />} trigger={['hover']}>
      {isPaths ? (
        <CodeOutlined title={dropdownTitle} />
      ) : (
        <Button type={buttonType}>
          <CodeOutlined /> {dropdownTitle}
        </Button>
      )}
    </Dropdown>
  );
};

export default observer(ApiDefinitionDropdown);
