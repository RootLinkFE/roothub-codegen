import { Drawer, DrawerProps, Space, Button, message } from 'antd';
import { CodeSandboxOutlined, CopyOutlined } from '@ant-design/icons';
import React, { Suspense, useMemo } from 'react';
import { useModel } from 'umi';
import { omit } from 'lodash';
import openOnCodeSandbox from '@/shared/codesandbox';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';

const ModelCodeDrawer: React.FC<DrawerProps> = (props) => {
  const { definitionCodeDrawerProps } = useModel('useApiSwitchModel');

  const code = definitionCodeDrawerProps.generateCode?.();

  const editorHeight = useMemo(() => {
    return window.innerHeight - 70;
  }, [window.innerHeight]);

  return (
    <Drawer
      // title={`${selectedDefinition?.title} 模型配置`}
      // onClose={() => setDefinitionCodeDrawerVisible(false)}
      width="60%"
      bodyStyle={{ padding: 0, display: 'flex' }}
      {...props}
      {...omit(definitionCodeDrawerProps, 'generateCode')}
      zIndex={999}
      extra={
        <Space>
          <Button
            type="primary"
            onClick={() => {
              openOnCodeSandbox({
                componentCode: code,
              });
            }}
            icon={<CodeSandboxOutlined />}
          >
            CodeSandbox
          </Button>
          <Button
            ghost
            type="primary"
            onClick={() => {
              message.info('todo');
            }}
            icon={<CopyOutlined />}
          >
            Copy
          </Button>
        </Space>
      }
    >
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        {definitionCodeDrawerProps.visible && (
          <Suspense fallback={<div style={{ margin: 'auto' }}>Loading...</div>}>
            <CodeMirror
              value={code}
              theme="light"
              height={editorHeight + 'px'}
              extensions={[javascript({ typescript: true })]}
              onChange={(value, viewUpdate) => {
                console.log('value:', value);
              }}
            />
          </Suspense>
        )}
      </div>
    </Drawer>
  );
};

export default ModelCodeDrawer;
