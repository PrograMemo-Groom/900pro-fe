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
import { useHighlights, HighlightMenuState, Highlight } from '@/pages/my-test/components/CodeEditor/hooks/useHighlights';
import { useTextSelection } from '@/pages/my-test/components/CodeEditor/hooks/useTextSelection';
import MemoPopup from './components/MemoPopup';
import HighlightActionMenu from './components/HighlightActionMenu';
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

  // 메모 팝업 루트 참조
  const memoPopupRootRef = useRef<ReactDOM.Root | null>(null);
  // 메모 팝업 컨테이너 참조
  const memoPopupContainerRef = useRef<HTMLDivElement | null>(null);
  // 메모 팝업이 초기화되었는지 추적
  const isMemoPopupInitializedRef = useRef<boolean>(false);

  // 하이라이트 메뉴 루트 참조
  const highlightMenuRootRef = useRef<ReactDOM.Root | null>(null);
  // 하이라이트 메뉴 컨테이너 참조
  const highlightMenuContainerRef = useRef<HTMLDivElement | null>(null);
  // 하이라이트 메뉴가 초기화되었는지 추적
  const isHighlightMenuInitializedRef = useRef<boolean>(false);

  // 각종 상태 정의
  const [memoContents, setMemoContents] = useState<Record<string, string>>({}); // 메모 내용 저장 상태
  const [highlightMenuState, setHighlightMenuState] = useState<HighlightMenuState | null>(null); // 하이라이트 메뉴 상태

  // 메모 팝업 컨테이너 스타일 상수
  const MEMO_CONTAINER_STYLE = {
    position: 'absolute',
    top: '0',
    left: '0',
    pointerEvents: 'none',
    zIndex: '9999',
    overflow: 'visible'
  };

  // 하이라이트 메뉴 컨테이너 스타일
  const HIGHLIGHT_MENU_CONTAINER_STYLE = {
    position: 'absolute',
    top: '0',
    left: '0',
    pointerEvents: 'none',
    zIndex: '9999',
    overflow: 'visible'
  };

  // useHighlights 커스텀 훅 사용 (하이라이트 처리)
  const {
    highlightExtensions,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    highlightTheme,
    activeMemo,
    closeMemoPopup,
    setActiveMemo
  } = useHighlights({
    documentId,
    editorRef,
    onHighlightClick: (state: HighlightMenuState) => {
      console.log('[디버깅] 하이라이트 클릭됨:', state.clientId);

      // 활성화된 메모 팝업이 있다면 닫기
      if (activeMemo) {
        closeMemoPopup();
      }

      // 하이라이트 메뉴 표시
      setHighlightMenuState(state);
    }
  });

  // useTextSelection 커스텀 훅 사용 (텍스트 선택 처리)
  const {
    menuPosition,
    setMenuPosition,
    selectedRange,
    editorEventHandlers
  } = useTextSelection({
    editorRef
  });

  /**
   * 메모 위치 계산 함수 - useHighlights.tsx에서 가져온 함수와 동일
   */
  const calculateMemoPosition = (pos: number, editorView: EditorView): { top: number; left: number } | null => {
    try {
      // 메모 포지션 계산
      const coords = editorView.coordsAtPos(pos);
      if (!coords) {
        return null;
      }

      // cm-scroller 요소 찾기
      const cmScroller = editorView.dom.querySelector('.cm-scroller');
      if (!cmScroller) {
        console.warn('.cm-scroller 요소를 찾을 수 없습니다.');
        return null;
      }

      // cm-scroller 기준 상대 위치 계산
      const scrollerRect = cmScroller.getBoundingClientRect();

      // 스크롤 위치 고려한 상대 위치 계산
      const newTop = coords.top - scrollerRect.top + cmScroller.scrollTop + 20;
      const newLeft = coords.left - scrollerRect.left + cmScroller.scrollLeft + 10;

      return { top: newTop, left: newLeft };
    } catch (e) {
      console.error('메모 위치 계산 중 오류:', e);
      return null;
    }
  };

  /**
   * 하이라이트 메모 수정/추가 핸들러
   */
  const handleEditHighlightMemo = (highlight: Highlight) => {
    console.log('[디버깅] 하이라이트 메모 수정 요청:', highlight.clientId);

    if (!editorRef.current) return;

    // 메모 위치 계산
    const position = calculateMemoPosition(highlight.to, editorRef.current);

    if (position) {
      // 메모 팝업 활성화
      setActiveMemo({
        clientId: highlight.clientId,
        highlight,
        position
      });
    } else {
      console.warn(`[경고] 메모 팝업 위치 계산 실패: ${highlight.clientId}`);
    }
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

  // 미니메뉴가 나타날 때 메모 팝업과 하이라이트 메뉴 닫기
  useEffect(() => {
    if (menuPosition) {
      if (activeMemo) {
        closeMemoPopup();
      }

      if (highlightMenuState) {
        setHighlightMenuState(null);
      }
    }
  }, [menuPosition, activeMemo, closeMemoPopup, highlightMenuState]);

  // 하이라이트 메뉴나 메모 팝업이 변경될 때 상호작용 관리
  useEffect(() => {
    if (highlightMenuState && activeMemo) {
      // 둘 다 열려있을 수 없음
      setHighlightMenuState(null);
    }
  }, [highlightMenuState, activeMemo]);

  // 메모 저장 핸들러
  const handleSaveMemo = (clientId: string, content: string) => {
    setMemoContents(prev => ({
      ...prev,
      [clientId]: content
    }));

    // TODO: 메모 내용을 백엔드에 저장하는 로직 추가
    console.log('메모 저장:', clientId, content);
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

  // 메모 팝업 초기화를 위한 useEffect
  useEffect(() => {
    // 이미 초기화되었으면 건너뜀
    if (isMemoPopupInitializedRef.current) return;

    // 에디터가 준비되었는지 확인
    if (!editorRef.current) return;

    console.log('[디버깅] 메모 팝업 컨테이너 초기화');

    // cm-scroller 요소 찾기 (실제 스크롤이 발생하는 요소)
    const cmScroller = editorRef.current.dom.querySelector('.cm-scroller');
    if (!cmScroller) {
      console.error('.cm-scroller 요소를 찾을 수 없습니다.');
      return;
    }

    // 메모 팝업 컨테이너 생성 (한 번만)
    const container = document.createElement('div');
    container.className = 'memo-popup-container';
    container.style.display = 'none'; // 초기에는 숨김 상태

    // 컨테이너 스타일 설정
    Object.assign(container.style, MEMO_CONTAINER_STYLE);

    // DOM에 추가
    cmScroller.appendChild(container);
    memoPopupContainerRef.current = container;

    // React 루트 생성 (한 번만)
    const root = ReactDOM.createRoot(container);
    memoPopupRootRef.current = root;

    // 초기화 완료 표시
    isMemoPopupInitializedRef.current = true;

    console.log('[디버깅] 메모 팝업 컨테이너 및 루트 초기화 완료');

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('[디버깅] 메모 팝업 정리');
      if (memoPopupRootRef.current) {
        try {
          memoPopupRootRef.current.unmount();
          memoPopupRootRef.current = null;
        } catch (e) {
          console.error('메모 팝업 루트 정리 중 오류:', e);
        }
      }

      if (memoPopupContainerRef.current && memoPopupContainerRef.current.parentNode) {
        memoPopupContainerRef.current.parentNode.removeChild(memoPopupContainerRef.current);
        memoPopupContainerRef.current = null;
      }

      isMemoPopupInitializedRef.current = false;
    };
  }, [editorRef.current]); // editorRef.current가 설정되면 실행

  // 메모 팝업 내용 업데이트를 위한 useEffect
  useEffect(() => {
    console.log('[디버깅] 메모 팝업 내용 업데이트 useEffect 실행됨, activeMemo:', activeMemo ? activeMemo.clientId : 'null');

    // 컨테이너와 루트가 초기화되지 않았으면 무시
    if (!memoPopupContainerRef.current || !memoPopupRootRef.current || !isMemoPopupInitializedRef.current) {
      return;
    }

    // 활성화된 메모가 있는 경우
    if (activeMemo) {
      console.log('[디버깅] 메모 팝업 표시:', activeMemo.position);

      // 컨테이너를 표시하고 내용 렌더링
      memoPopupContainerRef.current.style.display = 'block';

      // 내용 업데이트
      memoPopupRootRef.current.render(
        <MemoPopup
          position={{
            top: activeMemo.position.top,
            left: activeMemo.position.left
          }}
          clientId={activeMemo.clientId}
          content={memoContents[activeMemo.clientId] || ''}
          backgroundColor={activeMemo.highlight.color}
          onClose={closeMemoPopup}
          onSave={handleSaveMemo}
        />
      );
    } else {
      // 활성화된 메모가 없으면 컨테이너만 숨김
      if (memoPopupContainerRef.current) {
        console.log('[디버깅] 메모 팝업 숨김');
        memoPopupContainerRef.current.style.display = 'none';
      }
    }
  }, [activeMemo, closeMemoPopup, memoContents, handleSaveMemo]);

  // 하이라이트 메뉴 초기화를 위한 useEffect 추가 (메모 팝업 초기화 useEffect 다음에)
  useEffect(() => {
    // 이미 초기화되었으면 건너뜀
    if (isHighlightMenuInitializedRef.current) return;

    // 에디터가 준비되었는지 확인
    if (!editorRef.current) return;

    console.log('[디버깅] 하이라이트 메뉴 컨테이너 초기화');

    // cm-scroller 요소 찾기 (실제 스크롤이 발생하는 요소)
    const cmScroller = editorRef.current.dom.querySelector('.cm-scroller');
    if (!cmScroller) {
      console.error('.cm-scroller 요소를 찾을 수 없습니다.');
      return;
    }

    // 하이라이트 메뉴 컨테이너 생성 (한 번만)
    const container = document.createElement('div');
    container.className = 'highlight-menu-container';
    container.style.display = 'none'; // 초기에는 숨김 상태

    // 컨테이너 스타일 설정
    Object.assign(container.style, HIGHLIGHT_MENU_CONTAINER_STYLE);

    // DOM에 추가
    cmScroller.appendChild(container);
    highlightMenuContainerRef.current = container;

    // React 루트 생성 (한 번만)
    const root = ReactDOM.createRoot(container);
    highlightMenuRootRef.current = root;

    // 초기화 완료 표시
    isHighlightMenuInitializedRef.current = true;

    console.log('[디버깅] 하이라이트 메뉴 컨테이너 및 루트 초기화 완료');

    // 컴포넌트 언마운트 시 정리
    return () => {
      console.log('[디버깅] 하이라이트 메뉴 정리');
      if (highlightMenuRootRef.current) {
        try {
          highlightMenuRootRef.current.unmount();
          highlightMenuRootRef.current = null;
        } catch (e) {
          console.error('하이라이트 메뉴 루트 정리 중 오류:', e);
        }
      }

      if (highlightMenuContainerRef.current && highlightMenuContainerRef.current.parentNode) {
        highlightMenuContainerRef.current.parentNode.removeChild(highlightMenuContainerRef.current);
        highlightMenuContainerRef.current = null;
      }

      isHighlightMenuInitializedRef.current = false;
    };
  }, [editorRef.current]); // editorRef.current가 설정되면 실행

  // 하이라이트 메뉴 내용 업데이트를 위한 useEffect 추가 (메모 팝업 내용 업데이트 useEffect 다음에)
  useEffect(() => {
    console.log('[디버깅] 하이라이트 메뉴 업데이트 useEffect 실행됨, highlightMenuState:', highlightMenuState ? highlightMenuState.clientId : 'null');

    // 컨테이너와 루트가 초기화되지 않았으면 무시
    if (!highlightMenuContainerRef.current || !highlightMenuRootRef.current || !isHighlightMenuInitializedRef.current) {
      return;
    }

    // 하이라이트 메뉴 상태가 있는 경우
    if (highlightMenuState) {
      console.log('[디버깅] 하이라이트 메뉴 표시:', highlightMenuState.position);

      // 컨테이너를 표시하고 내용 렌더링
      highlightMenuContainerRef.current.style.display = 'block';

      // 내용 업데이트
      highlightMenuRootRef.current.render(
        <HighlightActionMenu
          position={highlightMenuState.position}
          highlight={highlightMenuState.highlight}
          onClose={() => setHighlightMenuState(null)}
          onEdit={handleEditHighlightMemo}
          onDelete={removeHighlight}
          onColorChange={updateHighlightColor}
        />
      );
    } else {
      // 하이라이트 메뉴 상태가 없으면 컨테이너만 숨김
      if (highlightMenuContainerRef.current) {
        console.log('[디버깅] 하이라이트 메뉴 숨김');
        highlightMenuContainerRef.current.style.display = 'none';
      }
    }
  }, [highlightMenuState, handleEditHighlightMemo, removeHighlight, updateHighlightColor]);

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
