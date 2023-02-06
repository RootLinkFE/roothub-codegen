/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-03 10:23:22
 * @Description: HistoryTextDropdown
 */
import { Row, Dropdown, Menu } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import state from '@/stores/index';
import { observer } from 'mobx-react-lite';

const HistoryTextDropdown: React.FC<{ onChange: (key: string) => void }> = (props) => {
  const { onChange } = props;
  const swaggerStore = state.swagger;
  const { historyTexts } = state.swagger;

  const handleDelete = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, i: number) => {
    e.stopPropagation();
    const urls = [...swaggerStore.historyTexts];
    urls.splice(i, 1);
    swaggerStore.setHistoryTexts(urls);
  };

  const historyTextMenu = (
    <Menu
      items={historyTexts.map((text: string, i: number) => {
        return {
          label: (
            <Row justify="space-between" align="middle">
              <span>{text}</span>
              <CloseOutlined
                className="dropdown-menu-item-icon"
                title="删除"
                onClick={(e) => {
                  handleDelete(e, i);
                }}
              />
            </Row>
          ),
          key: text,
        };
      })}
      onClick={(event) => {
        onChange(event.key);
      }}
    ></Menu>
  );

  return (
    <Dropdown.Button overlay={historyTextMenu} disabled={historyTexts.length <= 0}>
      历史文本
    </Dropdown.Button>
  );
};

export default observer(HistoryTextDropdown);
