/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-02-03 10:23:22
 * @Description: HistoryTextDropdown
 */
import { Row, Dropdown, Menu } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import state from '@/stores/index';
import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';

const HistoryTextDropdown: React.FC<{ onChange: (key: string) => void }> = (props) => {
  const { onChange } = props;
  const swaggerStore = state.swagger;
  const { historyTexts } = state.swagger;

  const handleDelete = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, i: number) => {
    e.stopPropagation();
    const list = [...historyTexts];
    list.splice(i, 1);
    swaggerStore.setHistoryTexts(list);
  };

  const historyTextMenu = useMemo(() => {
    console.log('historyTexts', historyTexts);
    return (
      <Menu
        items={historyTexts.map((text: string, i: number) => {
          const key = JSON.stringify(text);
          return {
            label: (
              <Row justify="space-between" align="middle">
                <span>{key}</span>
                <CloseOutlined
                  className="dropdown-menu-item-icon"
                  title="删除"
                  onClick={(e) => {
                    handleDelete(e, i);
                  }}
                />
              </Row>
            ),
            key,
          };
        })}
        onClick={(event) => {
          onChange(event.key);
        }}
      ></Menu>
    );
  }, [historyTexts]);

  return (
    <Dropdown.Button overlay={historyTextMenu} disabled={historyTexts.length <= 0}>
      历史文本
    </Dropdown.Button>
  );
};

export default HistoryTextDropdown;
