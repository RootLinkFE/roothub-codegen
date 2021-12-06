import { Drawer, DrawerProps } from 'antd';
import React, { Suspense } from 'react';
import { useModel } from 'umi';
import generateModelClass from './code-generate/generate-model-class';
// import { monaco } from 'react-monaco-editor';

const MonacoEditor = React.lazy(() => import('react-monaco-editor'));

const ModelCodeDrawer: React.FC<DrawerProps> = (props) => {
  const { definitionCodeDrawerProps } = useModel('useApiSwitchModel');

  return (
    <Drawer
      // title={`${selectedDefinition?.title} 模型配置`}
      // onClose={() => setDefinitionCodeDrawerVisible(false)}
      width="60%"
      bodyStyle={{ padding: 0, display: 'flex' }}
      {...props}
      {...definitionCodeDrawerProps}
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
            <MonacoEditor
              value={definitionCodeDrawerProps.generateCode?.()}
              language={definitionCodeDrawerProps.language || 'javascript'}
              theme="vs-dark"
              width={'100%'}
            />
          </Suspense>
        )}
      </div>
    </Drawer>
  );
};

export default ModelCodeDrawer;
