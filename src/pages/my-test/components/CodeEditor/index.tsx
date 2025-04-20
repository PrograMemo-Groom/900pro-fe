import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { highlightSelectionMatches } from '@codemirror/search';
import '@/pages/my-test/components/CodeEditor/CodeEditor.scss';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { IndexeddbPersistence } from 'y-indexeddb';
import MiniMenu from '@/pages/my-test/components/MiniMenu';
import { useHighlights } from '@/pages/my-test/components/CodeEditor/hooks/useHighlights';
import { useTextSelection } from '@/pages/my-test/components/CodeEditor/hooks/useTextSelection';
import MemoPopup from './components/MemoPopup';
import ReactDOM from 'react-dom/client';

/**
 * 코드 에디터에서 지원하는 프로그래밍 언어 타입 정의
 */
export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';

/**
 * 코드 에디터 테마 타입 정의
 */
export type EditorTheme = 'light' | 'dark';

// 렌더링 카운트 디버깅용 변수
let renderCount = 0;

/**
 * 코드 에디터 컴포넌트 속성 인터페이스
 */
interface CodeEditorProps {
  value: string;                    // 에디터의 초기 내용
  onChange: (value: string) => void; // 내용 변경 시 호출될 콜백 함수
  language?: CodeLanguage;          // 사용할 프로그래밍 언어
  theme?: EditorTheme;              // 에디터 테마 (라이트/다크)
  readOnly?: boolean;               // 읽기 전용 모드 여부
  documentId?: string;              // 파일의 고유 ID
  userName?: string;                // 사용자 이름 (커서 표시용)
}

/**
 * 텍스트 모드에서 흰색 텍스트를 표시하기 위한 확장
 */
const whiteTextExtension = EditorView.theme({
  '.cm-content': {
    color: '#ffffff'
  }
});

/**
 * 코드 에디터 컴포넌트 (CodeMirror)
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  theme = 'dark',
  readOnly = false,
  documentId = 'default-doc',
  userName = '익명 사용자',
}) => {
  console.log(`[디버깅] CodeEditor 컴포넌트 렌더링 #${++renderCount}, documentId: ${documentId}`);
  const ydocRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const editorRef = useRef<EditorView | null>(null);

  const { highlightExtensions, addHighlight, highlightTheme, activeMemo, closeMemoPopup } = useHighlights({
    documentId,
    editorRef
  });

  const {
    menuPosition,
    setMenuPosition,
    selectedRange,
    editorEventHandlers
  } = useTextSelection({
    editorRef
  });

  // 메모 내용 저장 상태
  const [memoContents, setMemoContents] = useState<Record<string, string>>({});
  // 메모 팝업 루트 참조
  const memoPopupRootRef = useRef<ReactDOM.Root | null>(null);
  // 메모 팝업 컨테이너 참조
  const memoPopupContainerRef = useRef<HTMLDivElement | null>(null);

  // 메모 팝업 컨테이너 스타일 상수
  const MEMO_CONTAINER_STYLE = {
    position: 'absolute',
    top: '0',
    left: '0',
    pointerEvents: 'none',
    zIndex: '9999',
    overflow: 'visible'
  };

  /**
   * 에디터 초기화 및 정리를 담당하는 생명주기
   */
  useEffect(() => {
    // [생명주기] 컴포넌트 마운트 시 또는 documentId/readOnly 변경 시 실행됨
    if (!readOnly) {
      // 1. 편집 모드: Yjs 협업 설정
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;
      const ytext = ydoc.getText('codemirror'); // ytext 가져오기

      // IndexedDB에 변경사항 저장 (영구 저장소)
      const persistence = new IndexeddbPersistence(documentId, ydoc);
      persistenceRef.current = persistence;

      // 2. 초기 콘텐츠 설정 로직
      persistence.on('synced', (isSynced: boolean) => {
        console.log(`[디버깅] Yjs 동기화 상태 (${documentId}): ${isSynced}`);
        // 동기화 완료 후이고, Yjs 문서가 비어있으며,
        // value prop에 값이 있을 때 초기 콘텐츠 설정
        if (isSynced && ytext.length === 0 && value) {
            console.log(`[디버깅] Yjs 동기화 후 초기 콘텐츠 설정 (${documentId}):`, value.substring(0, 50) + '...');
            ytext.insert(0, value);
        }
      });

      // 3. 정리 함수 (컴포넌트 언마운트 또는 의존성 변경 시 실행)
      return () => {
        console.log(`[디버깅] Yjs 정리 시작 (${documentId})`);
        if (persistenceRef.current) {
            persistenceRef.current.destroy(); // Persistence 정리
            persistenceRef.current = null; // 참조 해제
        }
        if (ydocRef.current) {
          ydocRef.current.destroy();
          ydocRef.current = null; // 참조 해제
        }
        console.log(`[디버깅] Yjs Doc 및 Persistence 정리 완료 (${documentId})`);
      };
    } else {
        // 4. 읽기 전용 모드: 기존 Yjs 인스턴스 정리
        if (persistenceRef.current) {
            persistenceRef.current.destroy();
            persistenceRef.current = null;
        }
        if (ydocRef.current) {
          ydocRef.current.destroy();
          ydocRef.current = null;
        }
        console.log('[디버깅] readOnly 모드로 전환, Yjs 인스턴스 정리됨');
        return () => {}; // 빈 정리 함수
    }
  }, [documentId, readOnly, value]); // value 의존성 추가

  /**
   * 하이라이트 버튼 클릭 핸들러
   */
  const handleHighlight = (color: string) => {
    console.log('하이라이트 버튼 클릭됨');
    if (selectedRange) {
      const { from, to } = selectedRange;
      const success = addHighlight(from, to, color, false);
      if (success) {
        setMenuPosition(null);
      }
    }
  };

  /**
   * 메모 버튼 클릭 핸들러
   */
  const handleAddMemo = (color: string) => {
    console.log('메모 추가 버튼 클릭됨');
    if (selectedRange) {
      const { from, to } = selectedRange;
      const success = addHighlight(from, to, color, true);
      if (success) {
        setMenuPosition(null);
      }
    }
  };

  const getLanguageExtension = (lang: CodeLanguage) => {
    switch (lang) {
      case 'python':
        return python();
      case 'javascript':
        return javascript();
      case 'java':
        return java();
      case 'cpp':
        return cpp();
      case 'c':
        return cpp();
      case 'text':
        return null;
      default:
        return python();
    }
  };

  const getTheme = (themeType: EditorTheme) => {
    return themeType === 'dark' ? vscodeDark : undefined;
  };

  const langExtension = getLanguageExtension(language);

  const extensions: Extension[] = [];
  if (langExtension) {
    extensions.push(langExtension);
  }

  // 같은 단어 자동 하이라이팅 비활성화
  extensions.push(highlightSelectionMatches({ highlightWordAroundCursor: false, minSelectionLength: 100 }));

  // 텍스트 모드에서 흰색 텍스트 확장 추가
  if (language === 'text') {
    extensions.push(whiteTextExtension);
  }

  // 하이라이트 테마 추가
  extensions.push(highlightTheme);

  // 하이라이트 확장 추가
  extensions.push(...highlightExtensions);

  // 마우스 이벤트 핸들러 추가
  extensions.push(
    EditorView.domEventHandlers(editorEventHandlers),
    EditorView.updateListener.of(update => {
      if (update.view) {
        editorRef.current = update.view;
      }
    })
  );

  // Yjs 협업 기능 추가
  if (!readOnly && ydocRef.current) {
    const ytext = ydocRef.current.getText('codemirror');

    // 협업 확장 기능 추가
    extensions.push(
      yCollab(ytext, {
        clientID: Math.floor(Math.random() * 100000),
        username: userName,
        userColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      })
    );
  }

  // 메모 저장 핸들러
  const handleSaveMemo = (clientId: string, content: string) => {
    setMemoContents(prev => ({
      ...prev,
      [clientId]: content
    }));

    // TODO: 메모 내용을 백엔드에 저장하는 로직 추가
    console.log('메모 저장:', clientId, content);
  };

  // 메모 팝업 관리를 위한 useEffect
  useEffect(() => {
    console.log('[디버깅] 메모 팝업 useEffect 실행됨, activeMemo:', activeMemo ? activeMemo.clientId : 'null');

    // 활성화된 메모가 있고 에디터 참조가 있는 경우
    if (activeMemo && editorRef.current) {
      console.log('[디버깅] 메모 팝업 렌더링 시작:', activeMemo.position);

      // 이전 메모 팝업 정리 - setTimeout으로 비동기 처리
      if (memoPopupRootRef.current) {
        const prevRoot = memoPopupRootRef.current;
        const prevContainer = memoPopupContainerRef.current;

        // 참조 초기화 (새 참조를 할당하기 전)
        memoPopupRootRef.current = null;
        memoPopupContainerRef.current = null;

        // 비동기적으로 이전 팝업 정리 (현재 렌더링 사이클 이후)
        setTimeout(() => {
          try {
            prevRoot.unmount();
            if (prevContainer && prevContainer.parentNode) {
              prevContainer.parentNode.removeChild(prevContainer);
            }
          } catch (e) {
            console.error('메모 팝업 정리 중 오류:', e);
          }
        }, 0);
      }

      // cm-scroller 요소 찾기 (실제 스크롤이 발생하는 요소)
      const cmScroller = editorRef.current.dom.querySelector('.cm-scroller');
      if (!cmScroller) {
        console.error('.cm-scroller 요소를 찾을 수 없습니다.');
        return;
      }

      // 메모 팝업 컨테이너 생성
      const container = document.createElement('div');
      container.className = 'memo-popup-container';

      // 컨테이너 스타일 설정
      Object.assign(container.style, MEMO_CONTAINER_STYLE);

      // DOM에 추가
      cmScroller.appendChild(container);

      console.log('[디버깅] 메모 팝업 컨테이너 생성 - 스타일:', {
        position: container.style.position,
        zIndex: container.style.zIndex,
        overflow: container.style.overflow,
        parentStyle: window.getComputedStyle(cmScroller)
      });

      // 참조 저장
      memoPopupContainerRef.current = container;

      // React로 메모 팝업 렌더링
      const root = ReactDOM.createRoot(container);
      root.render(
        <MemoPopup
          position={{
            top: activeMemo.position.top,
            left: activeMemo.position.left
          }}
          clientId={activeMemo.clientId}
          content={memoContents[activeMemo.clientId] || ''}
          onClose={closeMemoPopup}
          onSave={handleSaveMemo}
        />
      );

      // 참조 저장
      memoPopupRootRef.current = root;

      // 정리 함수
      return () => {
        // 정리 함수도 비동기적으로 처리
        if (memoPopupRootRef.current) {
          const root = memoPopupRootRef.current;
          const container = memoPopupContainerRef.current;

          memoPopupRootRef.current = null;
          memoPopupContainerRef.current = null;

          setTimeout(() => {
            try {
              root.unmount();
              if (container && container.parentNode) {
                container.parentNode.removeChild(container);
              }
            } catch (e) {
              console.error('메모 팝업 정리 중 오류:', e);
            }
          }, 0);
        }
      };
    }
  }, [activeMemo, closeMemoPopup, handleSaveMemo, memoContents]);

  return (
    <div className="code-editor-wrapper">
      <MiniMenu
        position={menuPosition}
        onHighlight={handleHighlight}
        onAddMemo={handleAddMemo}
      />
      <div className="code-editor-container">
        <CodeMirror
          value={!readOnly && ydocRef.current ? '' : value}
          height="100%"
          onChange={onChange}
          extensions={extensions}
          theme={getTheme(theme)}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
