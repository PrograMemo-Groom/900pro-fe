import { EditorView } from '@codemirror/view';
import React from 'react';

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

/**
 * 하이라이트 클릭 시 표시되는 액션 메뉴 컴포넌트 인터페이스
 */
export interface ActiveMiniMenuProps {
  position: { top: number; left: number };
  highlight: Highlight;
  onClose: () => void;
  onDelete?: (clientId: string) => void;
  onColorChange?: (clientId: string, newColor: string) => void;
}

/**
 * 포스트잇 형태의 메모 팝업 컴포넌트 인터페이스
 */
export interface MemoPopupProps {
  position: { top: number; left: number };
  clientId: string;
  content?: string;
  backgroundColor?: string;
  onClose: () => void;
  onSave?: (clientId: string, content: string) => void;
}

/**
 * 미니 메뉴 컴포넌트의 속성 인터페이스
 */
export interface MiniMenuProps {
  position: { x: number; y: number } | null;  // 메뉴가 표시될 화면 위치 (null이면 표시하지 않음)
  onHighlight: (color: string) => void;       // 하이라이트 버튼 클릭 시 호출될 콜백 함수
  onAddMemo: (color: string) => void;         // 메모 버튼 클릭 시 호출될 콜백 함수
}

/**
 * useTextSelection 훅의 속성 인터페이스
 */
export interface UseTextSelectionProps {
  editorRef: React.MutableRefObject<EditorView | null>;
}

/**
 * 코드 에디터에서 지원하는 프로그래밍 언어 타입 정의
 */
export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';

/**
 * 코드 에디터 테마 타입 정의
 */
export type EditorTheme = 'light' | 'dark';

/**
 * 코드 에디터 컴포넌트 속성 인터페이스
 */
export interface CodeEditorProps {
  value: string;                    // 에디터의 초기 내용
  onChange: (value: string) => void; // 내용 변경 시 호출될 콜백 함수
  language?: CodeLanguage;          // 사용할 프로그래밍 언어
  theme?: EditorTheme;              // 에디터 테마 (라이트/다크)
  readOnly?: boolean;               // 읽기 전용 모드 여부
  documentId?: string;              // 파일의 고유 ID
  userName?: string;                // 사용자 이름 (커서 표시용)
}
