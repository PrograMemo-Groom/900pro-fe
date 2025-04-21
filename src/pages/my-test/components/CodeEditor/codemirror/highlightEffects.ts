import { StateEffect } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { Highlight, ActiveMemoState, HighlightMenuState } from '@/pages/my-test/components/CodeEditor/types/types';

/**
 * 하이라이트 색상 업데이트 효과 정의
 */
export const updateHighlightColorEffect = StateEffect.define<{
  clientId: string;
  newColor: string;
  isMemo: boolean;
  from: number;
  to: number;
}>();

/**
 * 하이라이트 추가 효과 정의
 */
export const addHighlightEffect = StateEffect.define<{
  highlight: Highlight;
  setActiveMemo: React.Dispatch<React.SetStateAction<ActiveMemoState | null>>;
  editorView: EditorView | null;
  onHighlightClick?: (state: HighlightMenuState) => void;
}>();

/**
 * 하이라이트 전체 제거 효과 정의
 */
export const clearHighlightsEffect = StateEffect.define<null>();

/**
 * 특정 하이라이트 제거 효과 정의
 */
export const removeHighlightEffect = StateEffect.define<string>();

/**
 * 하이라이트 테마 정의
 */
export const highlightTheme = EditorView.baseTheme({
  '.cm-highlight': {
    backgroundColor: 'rgba(248, 255, 156, 0.2)',
    borderRadius: '2px',
    padding: '0 1px',
    transition: 'background-color 0.1s ease-in-out, border-color 0.1s ease-in-out'
  }
});
