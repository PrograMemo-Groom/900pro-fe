import React, { useEffect, useRef } from 'react';
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

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';
export type EditorTheme = 'light' | 'dark';

// 렌더링 카운트 디버깅용 변수
let renderCount = 0;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  theme?: EditorTheme;
  readOnly?: boolean;
  documentId?: string; // 파일의 고유 ID
  userName?: string; // 사용자 이름 (커서 표시용)
}

const whiteTextExtension = EditorView.theme({
  '.cm-content': {
    color: '#ffffff'
  }
});

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

  // 커스텀 훅 사용
  const { highlightExtensions, addHighlight, highlightTheme } = useHighlights({
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

  useEffect(() => {
    // 로컬 세션에서만 작동하는 Yjs 설정
    if (!readOnly) {
      // 새 Y.Doc 인스턴스 생성
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;
      const ytext = ydoc.getText('codemirror'); // ytext 가져오기

      // IndexedDB에 변경사항 저장
      const persistence = new IndexeddbPersistence(documentId, ydoc);
      persistenceRef.current = persistence;

      // 연결 상태 확인 및 초기 콘텐츠 설정 (수정됨)
      persistence.on('synced', (isSynced: boolean) => {
        console.log(`[디버깅] Yjs 동기화 상태 (${documentId}): ${isSynced}`);
        // 동기화 완료 후이고, Yjs 문서가 비어있으며, value prop에 값이 있을 때 초기 콘텐츠 설정
        if (isSynced && ytext.length === 0 && value) {
            console.log(`[디버깅] Yjs 동기화 후 초기 콘텐츠 설정 (${documentId}):`, value.substring(0, 50) + '...');
            ytext.insert(0, value);
        }
      });

      // 컴포넌트 언마운트시 정리 (수정됨: persistence 정리 추가)
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
        // readOnly 모드일 때 기존 Yjs 인스턴스 정리 (수정됨)
        if (persistenceRef.current) {
            persistenceRef.current.destroy();
            persistenceRef.current = null;
        }
        if (ydocRef.current) {
          ydocRef.current.destroy();
          ydocRef.current = null;
        }
        console.log('[디버깅] readOnly 모드로 전환, Yjs 인스턴스 정리됨');
        return () => {}; // 정리할 필요 없음
    }
  }, [documentId, readOnly]); // value 의존성 제거됨

  // 하이라이트 버튼 클릭 핸들러
  const handleHighlight = (color: string) => {
    console.log('하이라이트 버튼 클릭됨');
    if (selectedRange) {
      const { from, to } = selectedRange;
      const success = addHighlight(from, to, color, false);
      if (success) {
        setMenuPosition(null); // 메뉴 닫기
      }
    }
  };

  // 메모 버튼 클릭 핸들러
  const handleAddMemo = () => {
    console.log('메모 추가 버튼 클릭됨');
    if (selectedRange) {
      const { from, to } = selectedRange;
      const memoColorHex = '#FFDA63'; // 메모용 색상
      const success = addHighlight(from, to, memoColorHex, true);
      if (success) {
        setMenuPosition(null); // 메뉴 닫기
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

  return (
    <div className="code-editor-wrapper" style={{ position: 'relative' }}>
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
