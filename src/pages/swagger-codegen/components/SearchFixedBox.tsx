/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-21 17:11:40
 * @Description: SearchFixedBox
 */
import { Row, Input } from 'antd';
import type { InputRef } from 'antd';
import React, { useEffect, useRef } from 'react';
import { useModel } from 'umi';
import { UpOutlined, DownOutlined, CloseOutlined } from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import useSearchPageText from '@/shared/searchPageText';
import useBus from '@/shared/useBus';
import state from '@/stores/index';
import { debounce } from 'lodash';

const SearchFixedBox: React.FC<{ onUrlTextChange: (urlText: string) => boolean }> = (props) => {
  const { onUrlTextChange } = props;
  const {
    searchTextFixed,
    setSearchTextFixed,
    apiSearchText,
    setapiSearchText,
    selectedApi,
    resourceDetail,
    searchTags,
  } = useModel('useApiSwitchModel');
  const {
    clearHighlights,
    setTextNodeRange,
    setNewTextNodes,
    rangeIndexAdd,
    rangeIndexSubtract,
    rangeIndexText,
  } = useSearchPageText('.api-detail-tabs .ant-tabs-content .ant-tabs-tabpane-active', '.api-detail-content');
  const inputRef = useRef<InputRef>(null);

  const inputChange = (e: any) => {
    const value = e.target.value;
    setapiSearchText(value);
    debounceValueChange(value);
  };

  const debounceValueChange = debounce((value: string) => {
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
      const urlReg = /^\/[a-z0-9-]+(?:\/[a-zA-Z0-9-${}]+)*$/;
      if (urlReg.test(searchFixedText)) {
        // 如果匹配为接口url
        onUrlTextChange(searchFixedText);
      }

      selectedApi &&
        requestAnimationFrame(() => {
          state.settings.setSearchFixedText(''); // 即时清空
          setapiSearchText(searchFixedText); // 设置当前值
          handleFixed(); // 弹起，focus
          handleSetNewText(searchFixedText);
        });
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

  useKeyPress(
    'esc',
    () => {
      if (searchTextFixed) {
        setSearchTextFixed(false);
        clearHighlights();
      }
    },
    {
      target: document.getElementById('search-fixed-box'),
    },
  );

  // 事件汇总收集activeSearchText触发
  useBus(
    'activeSearchFixedText',
    () => {
      handleActiveSearchText();
    },
    [selectedApi, resourceDetail, searchTags],
  );

  if (searchTextFixed) {
    return (
      <Row className="search-fixed-box" id="search-fixed-box">
        <Input
          value={apiSearchText}
          onChange={inputChange}
          size="large"
          ref={inputRef}
          onPressEnter={inputChange}
          addonAfter={
            <Row className="search-fixed-option-box">
              <span className="search-fixed-option">{rangeIndexText}</span>
              <span
                onClick={() => {
                  rangeIndexSubtract();
                }}
                className="search-fixed-option search-fixed-sub"
              >
                <UpOutlined />
              </span>
              <span
                onClick={() => {
                  rangeIndexAdd();
                }}
                className="search-fixed-option search-fixed-add"
              >
                <DownOutlined />
              </span>
              <span
                onClick={() => {
                  setSearchTextFixed(false);
                  clearHighlights();
                }}
                className="search-fixed-option search-fixed-close"
              >
                <CloseOutlined />
              </span>
            </Row>
          }
        />
      </Row>
    );
  } else {
    return <></>;
  }
};

export default SearchFixedBox;
