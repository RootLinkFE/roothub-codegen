/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-21 17:11:40
 * @Description: SearchFixedBox
 */
import { Row, Input, message } from 'antd';
import type { InputRef } from 'antd';
import React, { useEffect, useRef, useCallback } from 'react';
import { useModel } from 'umi';
import { CloseOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import useSearchPageText from '@/shared/searchPageText';
import useBus from '@/shared/useBus';
import state from '@/stores/index';
import { debounce } from 'lodash';

const SearchFixedBox: React.FC<any> = () => {
  const { searchTextFixed, setSearchTextFixed, apiSearchText, setapiSearchText, selectedApi } = useModel(
    'useApiSwitchModel',
  );
  const { clearHighlights, setTextNodeRange, setNewTextNodes } = useSearchPageText(
    '.api-detail-tabs .ant-tabs-content',
  );
  const inputRef = useRef<InputRef>(null);

  const inputChange = debounce((e: any) => {
    const value = e.target.value;
    setapiSearchText(value);
    if (value === '') {
      clearHighlights();
    } else {
      setTextNodeRange(value);
    }
  }, 400);

  // 设置搜索框弹起，focus
  const handleFixed = (isKeyPress?: boolean) => {
    if (selectedApi) {
      setSearchTextFixed(true);
      setTimeout(() => {
        requestAnimationFrame(() => {
          console.log('inputRef', inputRef, inputRef.current?.focus);
          inputRef.current?.focus({
            cursor: isKeyPress ? 'all' : 'end',
          });
        });
      }, 100);
    }
  };

  const handleSetNewText = (text?: string) => {
    setNewTextNodes(); // 收集文本TextNode
    setTextNodeRange(text ?? apiSearchText); // 设置选中文本高亮
  };

  const handleActiveSearchText = () => {
    const { searchFixedText } = state.settings;
    if (searchFixedText !== '') {
      state.settings.setSearchFixedText(''); // 即时清空
      setapiSearchText(searchFixedText); // 设置当前值
      handleFixed(); // 弹起，focus
      handleSetNewText(searchFixedText);
    }
  };

  useKeyPress(['ctrl.f'], () => {
    handleFixed(true);
    handleSetNewText();
  });

  useEffect(() => {
    if ((apiSearchText ?? true) && searchTextFixed) {
      handleSetNewText(apiSearchText);
    }
    return () => {
      clearHighlights();
    };
  }, [selectedApi]);

  // 事件汇总收集activeSearchText触发
  useBus(
    'activeSearchFixedText',
    () => {
      handleActiveSearchText();
    },
    [selectedApi],
  );

  if (searchTextFixed) {
    return (
      <Row className="search-fixed-box">
        <Input
          defaultValue={apiSearchText}
          onChange={inputChange}
          size="large"
          ref={inputRef}
          onPressEnter={inputChange}
          addonAfter={
            <span
              onClick={() => {
                setSearchTextFixed(false);
                clearHighlights();
              }}
              className="search-fixed-close"
            >
              <CloseOutlined />
            </span>
          }
        />
      </Row>
    );
  } else {
    return <></>;
  }
};

export default SearchFixedBox;
