/*
 * @Author: ZtrainWilliams ztrain1224@163.com
 * @Date: 2023-05-21 17:11:40
 * @Description: searchPageText
 */

type Highlight = any;

declare const CSS: {
  highlights: Map<string, Highlight>;
};

type useSearchPageText = {
  clearHighlights: () => void;
  setTextNodeRange: (str: string) => void;
  setNewTextNodes: () => void;
};

const useSearchPageText = (selectorKey: string): useSearchPageText => {
  const clearHighlights = () => {
    // 清除上个高亮
    CSS.highlights.clear();
  };

  let allTextNodes: any[] = [];

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

  const setTextNodeRange = (str: string) => {
    if (allTextNodes.length > 0 && str !== '') {
      clearHighlights();

      // 查找所有文本节点是否包含搜索词
      const ranges = allTextNodes
        .map((el) => {
          return { el, text: el.textContent.toLowerCase() };
        })
        .map(({ text, el }) => {
          const indices = [];
          let startPos = 0;
          while (startPos < text.length) {
            const index = text.indexOf(str, startPos);
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
      // 创建高亮对象
      const searchResultsHighlight = new Highlight(...ranges.flat());

      // 注册高亮
      CSS.highlights.set('search-results', searchResultsHighlight);
    }
  };

  return {
    clearHighlights,
    setTextNodeRange,
    setNewTextNodes,
  };
};

export default useSearchPageText;
