import { ViewPlugin, ViewUpdate } from '@codemirror/view';

/**
 * 하이라이트 변경 감지 플러그인
 */
export const highlightPlugin = ViewPlugin.define(_view => {
  return {
    update(update: ViewUpdate) {
      if (update.docChanged) {
        // 문서 변경 시 로직 (필요한 경우)
      }
    }
  };
}); 
