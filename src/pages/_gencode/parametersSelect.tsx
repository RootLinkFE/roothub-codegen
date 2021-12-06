import React from 'react';
import { Form, Input, Row, Card, Button } from 'antd';

import { RefObject } from '@umijs/renderer-react/node_modules/@types/react';
import EditableTable from './EditableTable';

class ParametersSelect extends React.Component<
  {
    value: string;
    parameters: {
      requestParameters: { properties: {} };
      responseParameters: {};
    };
    definitions: {};
  },
  {
    value: string;
    requestParameters: any;
    responseParameters: {};
  }
> {
  EditableTableRef: RefObject<any>;
  constructor(props: {
    value: string;
    parameters: {
      requestParameters: { properties: {} };
      responseParameters: {};
    };
    definitions: {};
  }) {
    super(props);
    this.state = {
      value: props.value,
      requestParameters: [
        {
          type: 'integer',
          format: 'int64',
          description: '#城市id#',
          key: 'cityId',
          name: '城市id',
          componentType: 'InputNumber',
        },
        {
          type: 'string',
          description: '#城市名称（冗余）#',
          key: 'cityName',
          name: '城市名称（冗余）',
          componentType: 'Input',
        },
        {
          type: 'integer',
          format: 'int64',
          description: '#区域id#',
          key: 'districtId',
          name: '区域id',
          componentType: 'InputNumber',
        },
        {
          type: 'string',
          description: '#区域名称（冗余）#',
          key: 'districtName',
          name: '区域名称（冗余）',
          componentType: 'Input',
        },
        {
          type: 'string',
          description: '#详细地址#',
          key: 'parkplaceholder',
          name: '详细地址',
          componentType: 'Input',
        },
        {
          type: 'string',
          description: '#描述#',
          key: 'parkDesc',
          name: '描述',
          componentType: 'Input',
        },
        {
          type: 'string',
          description: '园区名称',
          key: 'parkName',
          name: '园区名称',
          componentType: 'Input',
        },
        {
          type: 'boolean',
          description: '#是否显示#',
          key: 'parkShow',
          name: '是否显示',
          componentType: 'Input',
        },
        {
          type: 'integer',
          format: 'int64',
          description: '#省份id#',
          key: 'provinceId',
          name: '省份id',
          componentType: 'InputNumber',
        },
        {
          type: 'string',
          description: '#省份名称（冗余）#',
          key: 'provinceName',
          name: '省份名称（冗余）',
          componentType: 'Input',
        },
        {
          type: 'integer',
          format: 'int32',
          description: '#排序#',
          key: 'sort',
          name: '排序',
          componentType: 'InputNumber',
        },
      ],
      responseParameters: [],
    };
    this.EditableTableRef = React.createRef();
  }

  componentDidMount() {
    this.parametersHandle();
  }
  componentWillReceiveProps() {
    this.parametersHandle();
  }

  parametersHandle() {
    console.log('this.props', this.props);

    let { parameters } = this.props;
    if (parameters.requestParameters) {
      let properties = parameters.requestParameters.properties;
      let requestParameters = [];
      for (const key in properties) {
        if (Object.prototype.hasOwnProperty.call(properties, key)) {
          const element: { description: string; type: string } =
            properties[key as keyof typeof properties];
          let name = element.description.replace(/#/g, '');
          requestParameters.push({
            ...element,
            key: key,
            name,
            // 前置判断组件类型
            componentType: element.type === 'integer' ? 'InputNumber' : 'Input',
            require: name.indexOf('冗余') === -1,
            placeholder: `请输入${name}`,
          });
        }
      }
      this.setState({
        requestParameters,
      });
      // this.EditableTableRef.init(requestParameters);
    }
  }

  render() {
    return (
      <Card>
        <p>请求参数</p>
        <Row>
          <Button
            onClick={() => {
              this.parametersHandle();
            }}
            style={{ margin: '0 0 12px 0' }}
          >
            解析
          </Button>
          <EditableTable
            ref={this.EditableTableRef}
            requestParameters={this.state.requestParameters}
            definitions={this.props.definitions}
          ></EditableTable>
          <Form
            name="basic"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            style={{
              width: '100%',
            }}
          >
            {
              // this.state.requestParameters.map((item: { name: '', componentType: '', key: '' }) => {
              //   return (<Form.Item
              //     label={item.name}
              //     key={item.key}
              //   >
              //     {item.componentType}
              //   </Form.Item>)
              // })
            }
          </Form>
        </Row>
      </Card>
    );
  }
}

export default ParametersSelect;
