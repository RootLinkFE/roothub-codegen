import { Drawer, DrawerProps, Space, Button, message } from 'antd';
import { CodeSandboxOutlined, CopyOutlined } from '@ant-design/icons';
import React, { Suspense, useMemo } from 'react';
import { useModel } from 'umi';
import { omit } from 'lodash';
import openOnCodeSandbox from '@/shared/codesandbox';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { CopyToClipboard } from 'react-copy-to-clipboard';

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
      {...omit(definitionCodeDrawerProps, ['generateCode', 'showCodeSandbox'])}
      zIndex={999}
      extra={
        <Space>
          {definitionCodeDrawerProps.showCodeSandbox && (
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
          )}
          <CopyToClipboard
            text={code}
            onCopy={() => {
              message.success('代码已复制到剪贴板！');
            }}
          >
            <Button ghost type="primary" icon={<CopyOutlined />}>
              Copy
            </Button>
          </CopyToClipboard>
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
