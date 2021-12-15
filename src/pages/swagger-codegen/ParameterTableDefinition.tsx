import { Dropdown, Menu } from 'antd';
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';
import { useModel } from 'umi';
import { useCallback } from 'react';
import generateModelClass from './code-generate/generate-model-class';
import generateTypeScriptType from './code-generate/generate-typescript-type';

const ParameterTableDefinition: React.FC<{ definition: any }> = function (
  props,
) {
  const { definition } = props;

  const {
    resourceDetail,
    setSelectedDefinition,
    setDefinitionCodeDrawerProps,
  } = useModel('useApiSwitchModel');

  const showModelCode = useCallback(
    (definition) => {
      setSelectedDefinition(definition);
      setDefinitionCodeDrawerProps({
        title: `${definition.title} 模型配置`,
        visible: true,
        generateCode: () => generateModelClass(definition),
      });
    },
    [setSelectedDefinition, setDefinitionCodeDrawerProps],
  );

  const showTypeScriptDefinitionsCode = useCallback(
    (definition) => {
      setSelectedDefinition(definition);
      setDefinitionCodeDrawerProps({
        title: `${definition.title} TypeScript 定义`,
        visible: true,
        generateCode: () => generateTypeScriptType(definition),
        language: 'typescript',
      });
    },
    [setSelectedDefinition, setDefinitionCodeDrawerProps],
  );

  return (
    <Dropdown
      overlay={
        <Menu
          onClick={({ key }) => {
            switch (key) {
              case '0':
                showModelCode(definition);
                break;
              case '1':
                showTypeScriptDefinitionsCode(definition);
                break;
            }
          }}
        >
          <Menu.Item key="0">复制 Model 配置</Menu.Item>
          <Menu.Item key="1">复制 TypeScript 定义</Menu.Item>
        </Menu>
      }
      trigger={['click']}
    >
      <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
        {definition.title} <DownOutlined />
      </a>
    </Dropdown>
  );
};

export default ParameterTableDefinition;
