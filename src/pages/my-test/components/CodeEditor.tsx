import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import '@/pages/my-test/components/CodeEditor.scss';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { IndexeddbPersistence } from 'y-indexeddb';
import MiniMenu from './MiniMenu';

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c' | 'text';
export type EditorTheme = 'light' | 'dark';

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
  const ydocRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const editorRef = useRef<EditorView | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ from: number; to: number } | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    // 로컬 세션에서만 작동하는 Yjs 설정
    if (!readOnly) {
      // 새 Y.Doc 인스턴스 생성
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;

      // IndexedDB에 변경사항 저장
      const persistence = new IndexeddbPersistence(documentId, ydoc);
      persistenceRef.current = persistence;

      // 연결 상태 확인
      persistence.on('synced', () => {
        console.log('콘텐츠가 IndexedDB와 동기화되었습니다');
      });

      // 컴포넌트 언마운트시 정리
      return () => {
        if (ydocRef.current) {
          ydocRef.current.destroy();
        }
      };
    }
  }, [documentId, readOnly]);

  // 문서 클릭 시 메뉴 닫기 이벤트 핸들러
  useEffect(() => {
    const handleClickOutside = () => {
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMouseDown = (_event: MouseEvent, _view: EditorView) => {
    isDragging.current = true;
    setMenuPosition(null);
  };

  const handleMouseUp = (event: MouseEvent, view: EditorView) => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const selection = view.state.selection.main;
    // 텍스트가 선택되었는지 확인
    if (!selection.empty) {
      // 이벤트가 발생한 곳에 메뉴 위치 설정
      const editorRect = view.dom.getBoundingClientRect();
      const menuPos = {
        x: event.clientX - editorRect.left,
        y: event.clientY - editorRect.top
      };
      event.stopPropagation();

      setMenuPosition(menuPos);
      setSelectedRange({ from: selection.from, to: selection.to });
    }
  };

  // 하이라이트 버튼 클릭 핸들러
  const handleHighlight = () => {
    if (selectedRange && editorRef.current) {
      console.log('하이라이트 선택된 범위:', selectedRange);
      // TODO: 선택한 텍스트 하이라이트 기능 구현
      // 기능 구현 전 임시로 콘솔 출력만
      const { from, to } = selectedRange;
      const text = editorRef.current.state.sliceDoc(from, to);
      console.log('선택된 텍스트:', text);
    }
    setMenuPosition(null); // 메뉴 닫기
  };

  // 메모 버튼 클릭 핸들러
  const handleAddMemo = () => {
    if (selectedRange && editorRef.current) {
      console.log('메모 추가 범위:', selectedRange);
      // TODO: 선택한 텍스트에 메모 추가 기능 구현
      // 기능 구현 전 임시로 콘솔 출력만
      const { from, to } = selectedRange;
      const text = editorRef.current.state.sliceDoc(from, to);
      console.log('메모 추가할 텍스트:', text);
    }
    setMenuPosition(null);
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

  if (language === 'text') {
    extensions.push(whiteTextExtension);
  }

  // 마우스 이벤트 핸들러 추가
  extensions.push(
    EditorView.domEventHandlers({
      mousedown: handleMouseDown,
      mouseup: handleMouseUp,
    }),
    EditorView.updateListener.of(update => {
      if (update.view) {
        editorRef.current = update.view;
      }
    })
  );

  // Yjs 협업 기능 추가
  if (!readOnly && ydocRef.current) {
    const ytext = ydocRef.current.getText('codemirror');

    // 초기 콘텐츠 설정 (문서가 비어있는 경우에만)
    if (ytext.length === 0 && value) {
      ytext.insert(0, value);
    }

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
