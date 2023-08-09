/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-21 17:11:40
 * @Description: searchPageText
 */
import { useRef, useState, useMemo, useCallback } from 'react';
type Highlight = any;

declare const CSS: {
  highlights: Map<string, Highlight>;
};

type useSearchPageText = {
  clearHighlights: () => void;
  setTextNodeRange: (str: string) => void;
  setNewTextNodes: () => void;
  rangeIndexAdd: () => void;
  rangeIndexSubtract: () => void;
  rangeIndexText: string;
};

const useSearchPageText = (selectorKey: string, scrollElementClass?: string): useSearchPageText => {
  const clearHighlights = () => {
    // 清除上个高亮
    CSS.highlights.clear();
  };

  let allTextNodes: any[] = [];
  const ranges = useRef<any[]>([]);
  const [rangesLen, setRangesLen] = useState<number>(0);
  const [rangeIndex, setRangeIndex] = useState<number>(0);
  const rangeIndexText = useMemo(() => {
    return `${rangesLen > 0 ? rangeIndex + 1 : 0}/${rangesLen}`;
  }, [rangeIndex, rangesLen]);

  /**
   * @description: 获取区域所有文本节点
   * @return {*}
   */
  const setNewTextNodes = () => {
    const result = [];
    if (!document) {
      return;
    }
    if (!selectorKey) {
      console.log('please input selectorKey');
      return;
    }
    const articleNode: any = document.querySelector(selectorKey);
    if (articleNode) {
      // Find all text nodes in the article. We'll search within
      // these text nodes.
      const treeWalker = document.createTreeWalker(articleNode, NodeFilter.SHOW_TEXT);
      let currentNode = treeWalker.nextNode();
      while (currentNode) {
        result.push(currentNode);
        currentNode = treeWalker.nextNode();
      }
    }
    allTextNodes = result;
  };

  setNewTextNodes();

  /**
   * @description: 过滤文本节点是否与选中文本匹配
   * @param {string} str
   * @return {*}
   */
  const setTextNodeRange = (str: string) => {
    if (allTextNodes.length > 0 && str !== '') {
      clearHighlights();

      // 查找所有文本节点是否包含搜索词
      const curRanges: any[] = allTextNodes
        .map((el) => {
          return { el, text: el.textContent.toLowerCase() };
        })
        .map(({ text, el }) => {
          const indices = [];
          let startPos = 0;
          while (startPos < text.length) {
            const index: number = text.indexOf(str, startPos);
            if (index === -1) break;
            indices.push(index);
            startPos = index + str.length;
          }

          // 根据搜索词的位置创建选区
          return indices.map((index) => {
            const range = new Range();
            range.setStart(el, index);
            range.setEnd(el, index + str.length);
            return range;
          });
        });

      const Highlight = (window as any).Highlight;
      ranges.current = curRanges.filter((v) => v.length > 0).flat();
      setRangesLen(ranges.current.length);
      // 创建高亮对象
      const searchResultsHighlight = new Highlight(...ranges.current);

      // 注册高亮
      CSS.highlights.set('search-results', searchResultsHighlight);
      setTimeout(() => {
        handleScrollToRange(0);
      }, 0);
    }
  };

  /**
   * @description: 将滚动区域的滚动条滚动到range索引位置
   * @return {*}
   */
  const handleScrollToRange = (index: number) => {
    setRangeIndex(index);
    if (!scrollElementClass) {
      console.log('please input scrollElementClass');
      return;
    }
    const scrollElement = document.querySelector(scrollElementClass);
    if (ranges.current[index]) {
      const parentNode = ranges.current[index]?.startContainer?.parentNode;
      if (scrollElement && parentNode) {
        parentNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
        const Highlight = (window as any).Highlight;
        // 创建当前选中高亮对象-注册class
        CSS.highlights.set('search-results-current', new Highlight(ranges.current[index]));
      }
    }
  };

  /**
   * @description: range索引增加并滚动
   * @return {*}
   */
  const rangeIndexAdd = () => {
    if (ranges.current.length === 0) return;
    const curRangeIndex = rangeIndex < ranges.current.length - 1 ? rangeIndex + 1 : 0;
    handleScrollToRange(curRangeIndex);
  };

  /**
   * @description: range索引减少并滚动
   * @return {*}
   */
  const rangeIndexSubtract = () => {
    if (ranges.current.length === 0) return;
    const curRangeIndex = rangeIndex > 0 ? rangeIndex - 1 : ranges.current.length - 1;
    handleScrollToRange(curRangeIndex);
  };

  return {
    clearHighlights,
    setTextNodeRange,
    setNewTextNodes,
    rangeIndexAdd,
    rangeIndexSubtract,
    rangeIndexText,
  };
};

export default useSearchPageText;
