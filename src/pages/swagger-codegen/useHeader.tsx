import React, { useCallback, useRef, useState } from 'react';
import { Card, Row, Col, Input, Button, Radio } from 'antd';
import { useRequest } from 'ahooks';
import { useModel } from 'umi';

const requestToBody = require('../../../scripts/tool/generate-api/requestToBody.js');

export default function useApiSwitchHeader() {
  const { urlRef, type, setType, fetchResources, resources, resourcesLoading } =
    useModel('useApiSwitchModel');

  // const { run: fetchBlocks, data: resources, loading } = useRequest(
  //   async () => {
  //     const res = await requestToBody(urlRef.current + '/swagger-resources')
  //     return res
  //   },
  //   {
  //     manual: true,
  //   }
  // )

  const headerRender = (
    <Row style={{ margin: '10px 10px 0' }} gutter={16}>
      <Col flex="none">
        <Button
          type="primary"
          loading={resourcesLoading}
          onClick={fetchResources}
        >
          获取
        </Button>
      </Col>
      <Col flex={1}>
        <Input
          onChange={(e) => {
            urlRef.current = (e.nativeEvent.target as any).value;
          }}
          placeholder="swagger 文档地址"
          defaultValue={urlRef.current}
        />
      </Col>
      <Col flex="none">
        <Radio.Group
          disabled
          onChange={(e) => setType(e.target.value)}
          options={[{ label: '接口', value: 'api' }]}
          optionType="button"
          buttonStyle="solid"
          value={type}
        />
      </Col>
    </Row>
  );

  return { headerRender, resources, urlRef, type };
}
