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
import '@/pages/history/components/CodeEditor/CodeEditor.scss';
import * as Y from 'yjs';
import { yCollab } from 'y-codemirror.next';
import { IndexeddbPersistence } from 'y-indexeddb';
import { CodeLanguage, EditorTheme, CodeEditorProps } from '@/pages/history/components/CodeEditor/types/types';
import { MEMO_CONTAINER_STYLE, HIGHLIGHT_MENU_CONTAINER_STYLE } from '@/pages/history/components/CodeEditor/constants/constants';

/**
 * 렌더링 카운트 디버깅용 변수
 */
let renderCount = 0;

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

  // 에디터 및 문서 참조
  const ydocRef = useRef<Y.Doc | null>(null);
  const persistenceRef = useRef<IndexeddbPersistence | null>(null);
  const editorRef = useRef<EditorView | null>(null);

  /**
   * 언어별 확장 생성 함수
   */
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

  /**
   * 테마 설정 함수
   */
  const getTheme = (themeType: EditorTheme) => {
    return themeType === 'dark' ? vscodeDark : undefined;
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

  // 확장 설정
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

  // 마우스 이벤트 핸들러 추가
  extensions.push(
    EditorView.updateListener.of(update => {
      if (update.view) {
        editorRef.current = update.view;
      }
    })
  );

  // Yjs 협업 기능 추가 (readOnly가 아닐 경우만)
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
    <div className="code-editor-wrapper">
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
