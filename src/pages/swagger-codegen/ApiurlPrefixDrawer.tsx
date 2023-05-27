/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2022-11-25 11:22:05
 * @Description: apiurl默认前缀-设置抽屉弹窗
 */
import { Drawer, DrawerProps } from 'antd';
import ApiurlPrefixEditTable from './ApiurlPrefixEditTable';
import { observer } from 'mobx-react-lite';

const ApiurlPrefixDrawer: React.FC<DrawerProps> = (props) => {
  const { ...drawerProps } = props;

  return (
    <Drawer
      width="90%"
      bodyStyle={{ padding: 16 }}
      title="apiurl前缀列表"
      {...drawerProps}
      zIndex={200}
      destroyOnClose={true}
    >
      <ApiurlPrefixEditTable />
    </Drawer>
  );
};

export default observer(ApiurlPrefixDrawer);
