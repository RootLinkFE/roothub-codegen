import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Tag,
  Space,
  Drawer,
} from 'antd';
import { useEffect, useState } from 'react';
import { ResourcesTree } from '.';
import { useModel } from 'umi';
import ApiDetailDrawer from './ApiDetailDrawer';
import ModelCodeDrawer from './ModelCodeDrawer';

export const MethodColors: any = {
  post: '#f50',
  get: '#87d068',
};

const ApiDescription = (props: any) => {
  const { api } = props;
  const { urlRef, selectedResource, selectedTag } =
    useModel('useApiSwitchModel');

  const [iframeVisible, setIFrameVisible] = useState(false);

  if (!api) return null;
  return (
    <Col flex="40%">
      <Card bordered={false} style={{ height: '500px' }}>
        <p>
          <Tag color={MethodColors[api.method] || '#87d068'}>
            {api.method.toUpperCase()}
          </Tag>{' '}
          {api.api}
        </p>
        <Divider />
        <Space>
          <Button onClick={() => setIFrameVisible(true)} type="primary">
            查看接口文档
          </Button>
        </Space>
      </Card>
      <ApiDetailDrawer
        api={api}
        onClose={() => setIFrameVisible(false)}
        title={`${selectedTag.name} / ${api.summary}`}
        visible={iframeVisible}
      />
      <ModelCodeDrawer />
    </Col>
  );
};

const ApiTreeForm: React.FC<{
  resourceDetail: any;
}> = (props) => {
  const { resourceDetail } = props;

  /*   const [selectedTagIndex, setSelectedTagIndex] = useState<string>('')
  const [selectedApiIndex, setSelectedApiIndex] = useState<string>('') */
  const {
    selectedTagIndex,
    setSelectedTagIndex,
    selectedApiIndex,
    setSelectedApiIndex,
    selectedTag,
    selectedApi,
  } = useModel('useApiSwitchModel');

  useEffect(() => {
    setSelectedTagIndex('');
    setSelectedApiIndex('');
  }, [resourceDetail]);

  if (!resourceDetail) return null;

  return (
    <>
      <ResourcesTree
        data={resourceDetail.tags}
        onSelect={({ key }) => setSelectedTagIndex(key)}
        labelKey="name"
      />
      {selectedTagIndex && (
        <ResourcesTree
          key={selectedTag.name}
          onSelect={({ key }) => setSelectedApiIndex(key)}
          data={selectedTag?.paths}
          labelKey="summary"
        />
      )}
      {selectedApiIndex && (
        <ApiDescription
          resourceDetail={resourceDetail}
          tag={resourceDetail.tags[Number(selectedTagIndex)]}
          api={selectedApi}
        />
      )}
    </>
  );
};

export default ApiTreeForm;
