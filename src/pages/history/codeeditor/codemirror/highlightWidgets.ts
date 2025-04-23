import { WidgetType, EditorView } from '@codemirror/view';
import { Highlight, ActiveMemoState, HighlightMenuState } from '@/pages/history/codeeditor/types/types.ts';
import { createIconDOM, calculateMemoPosition } from '@/pages/history/codeeditor/utils/domUtils.ts';
import React from 'react';

/**
 * clientId로 하이라이트/위젯 필터링 함수
 */
export const filterByClientId = (_from: number, _to: number, value: any, clientIdToFilter: string): boolean => {
  const markClientId = value.spec.attributes?.['data-client-id'];
  if (markClientId === clientIdToFilter) {
    return false;
  }

  // 위젯 필터링 로직
  const widgetInstance = value.spec.widget as any;
  if (widgetInstance && typeof widgetInstance === 'object' && 'widgetClientId' in widgetInstance) {
    if (widgetInstance.widgetClientId === clientIdToFilter) {
      return false;
    }
  }

  return true;
};

/**
 * 메모 아이콘 위젯 생성 함수
 */
export const createMemoIconWidget = (
  clientId: string,
  color: string, // HEX 색상 (#rrggbb)
  highlight: Highlight,
  setActiveMemo: React.Dispatch<React.SetStateAction<ActiveMemoState | null>>,
  editorView: EditorView,
  _onHighlightClick?: (state: HighlightMenuState) => void
) => {
  return new class extends WidgetType {
    readonly widgetClientId: string;

    constructor() {
      super();
      this.widgetClientId = clientId;
    }

    toDOM() {
      const handleIconClick = () => {
        const memoClientId = this.widgetClientId;
        const memoHighlight = highlight;

        setActiveMemo(prevActiveMemo => {
          const position = calculateMemoPosition(memoHighlight.to, editorView);
          const newPosition = position || { top: 100, left: 100 };

          if (prevActiveMemo && prevActiveMemo.clientId === memoClientId) {
            return null;
          } else {
            return {
              clientId: memoClientId,
              highlight: memoHighlight,
              position: newPosition
            };
          }
        });
      };

      return createIconDOM(this.widgetClientId, color, true, handleIconClick);
    }

    ignoreEvent() {
      return false;
    }
  }
}; 
