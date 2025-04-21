import { EditorView } from '@codemirror/view';

/**
 * 하이라이트 정보를 저장할 인터페이스
 */
export interface Highlight {
  clientId: string;
  id?: string;
  from: number;
  to: number;
  color: string;
  documentId: string;
  isPending?: boolean;
  isMemo?: boolean;
}

/**
 * 활성화된 메모 팝업 상태 인터페이스
 */
export interface ActiveMemoState {
  clientId: string;
  highlight: Highlight;
  position: { top: number; left: number };
}

/**
 * 클릭된 하이라이트 메뉴 상태 인터페이스
 */
export interface HighlightMenuState {
  clientId: string;
  highlight: Highlight;
  position: { top: number; left: number };
}

/**
 * useHighlights 훅의 속성 인터페이스
 */
export interface UseHighlightsProps {
  documentId: string;
  editorRef: React.MutableRefObject<EditorView | null>;
  onHighlightClick?: (state: HighlightMenuState) => void;
} 
