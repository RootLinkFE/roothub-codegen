/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-01 15:45:05
 * @Description: 默认抽屉90%弹窗
 */
import { Drawer, DrawerProps } from 'antd';
import { observer } from 'mobx-react-lite';

const DefaultDrawer: React.FC<DrawerProps> = (props) => {
  const { ...drawerProps } = props;

  return (
    <>
      <Drawer width="90%" bodyStyle={{ padding: 16 }} {...drawerProps} zIndex={200} destroyOnClose={true}>
        {props.children}
      </Drawer>
    </>
  );
};

export default observer(DefaultDrawer);
