import React, { useState, useRef } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
// import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { availableLanguages, languageDisplayNames } from '@/pages/coding-test/constants/constants';
import './EditorPanel.scss';

export type CodeLanguage = 'python' | 'javascript' | 'java' | 'cpp' | 'c';
export type EditorTheme = 'light' | 'dark';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  extension?: string;
  children?: FileItem[];
  isOpen?: boolean;
}

interface Tab {
  id: string;
  name: string;
  language: CodeLanguage;
  content: string;
}

interface EditorPanelProps {
  selectedLanguage: CodeLanguage;
  onLanguageSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  currentCode: string;
  handleCodeChange: (value: string) => void;
  theme: EditorTheme;
  isRunning: boolean;
  output: string;
}

// const whiteTextExtension = EditorView.theme({
//   '.cm-content': {
//     color: '#ffffff'
//   }
// });

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
    default:
      return python();
  }
};

const getTheme = (themeType: EditorTheme) => {
  return themeType === 'dark' ? vscodeDark : undefined;
};

// 샘플 파일 구조 데이터
const sampleFileStructure: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        children: [
          { id: '3', name: 'App.js', type: 'file', extension: 'js' },
          { id: '4', name: 'Header.js', type: 'file', extension: 'js' },
        ]
      },
      {
        id: '5',
        name: 'styles',
        type: 'folder',
        children: [
          { id: '6', name: 'main.css', type: 'file', extension: 'css' },
        ]
      },
      { id: '7', name: 'index.js', type: 'file', extension: 'js' },
    ]
  },
  {
    id: '8',
    name: 'public',
    type: 'folder',
    children: [
      { id: '9', name: 'index.html', type: 'file', extension: 'html' },
    ]
  },
  { id: '10', name: 'package.json', type: 'file', extension: 'json' },
];

const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedLanguage,
  onLanguageSelectChange,
  currentCode,
  handleCodeChange,
  theme,
  isRunning,
  output
}) => {
  const langExtension = getLanguageExtension(selectedLanguage);
  const extensions: Extension[] = [];
  if (langExtension) {
    extensions.push(langExtension);
  }

  // 파일 구조 상태
  const [fileStructure, setFileStructure] = useState<FileItem[]>(sampleFileStructure);

  // 탭 관리 상태
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'tab1', name: 'main.js', language: 'javascript', content: currentCode }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab1');

  // CodeMirror 인스턴스를 참조하기 위한 ref 추가
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  // editor-container 클릭 시 마지막 줄로 커서 이동
  const handleEditorContainerClick = (e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.cm-editor')) {
      const view = codeMirrorRef.current?.view;
      if (view) {
        // 문서 내용 가져오기
        const doc = view.state.doc;
        // 마지막 줄 번호
        const lastLine = doc.lines;
        // 마지막 줄의 마지막 위치 계산
        const lastLineLength = doc.line(lastLine).length;

        // 마지막 줄로 커서 이동
        const transaction = view.state.update({
          selection: { anchor: doc.line(lastLine).from + lastLineLength },
          scrollIntoView: true
        });
        view.dispatch(transaction);

        // 에디터에 포커스 설정
        view.focus();
      }
    }
  };

  // 파일 구조 토글 함수
  const toggleFolder = (id: string) => {
    const toggleFolderItem = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        if (item.id === id) {
          return { ...item, isOpen: !item.isOpen };
        }
        if (item.children) {
          return {
            ...item,
            children: toggleFolderItem(item.children)
          };
        }
        return item;
      });
    };
    setFileStructure(toggleFolderItem(fileStructure));
  };

  // 파일 클릭 함수
  const handleFileClick = (file: FileItem) => {
    // 이미 열려있는 탭인지 확인
    const existingTab = tabs.find(tab => tab.id === file.id);

    if (existingTab) {
      // 이미 열려있는 파일이면 해당 탭을 활성화
      setActiveTabId(file.id);
    } else {
      // 새 탭 추가
      const fileExtension = file.extension || '';
      let language: CodeLanguage = 'javascript';

      if (fileExtension === 'py') language = 'python';
      else if (fileExtension === 'java') language = 'java';
      else if (fileExtension === 'cpp' || fileExtension === 'c') language = fileExtension as CodeLanguage;

      const newTab: Tab = {
        id: file.id,
        name: file.name,
        language,
        content: `// ${file.name} 내용`
      };

      setTabs([...tabs, newTab]);
      setActiveTabId(file.id);
    }
  };

  // 탭 닫기 함수
  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filteredTabs = tabs.filter(tab => tab.id !== id);

    if (filteredTabs.length === 0) {
      // 모든 탭이 닫힌 경우 새 탭 추가
      setTabs([{ id: 'newtab', name: 'untitled', language: selectedLanguage, content: '' }]);
      setActiveTabId('newtab');
    } else if (activeTabId === id) {
      // 활성화된 탭이 닫힌 경우 마지막 탭을 활성화
      setActiveTabId(filteredTabs[filteredTabs.length - 1].id);
    }

    setTabs(filteredTabs);
  };

  // 재귀적으로 파일 구조 렌더링
  const renderFileStructure = (items: FileItem[]) => {
    return (
      <ul className="file-tree">
        {items.map(item => (
          <li key={item.id} className="file-tree-item">
            {item.type === 'folder' ? (
              <div
                className={`folder ${item.isOpen ? 'active' : ''}`}
                onClick={() => toggleFolder(item.id)}
              >
                <span className="folder-icon">{item.isOpen ? '📂' : '📁'}</span>
                <span>{item.name}</span>
              </div>
            ) : (
              <div
                className={`file ${activeTabId === item.id ? 'active' : ''}`}
                onClick={() => handleFileClick(item)}
              >
                <span className="file-icon">
                  {item.extension === 'js' ? '📄' :
                   item.extension === 'css' ? '🎨' :
                   item.extension === 'html' ? '🌐' :
                   item.extension === 'json' ? '📋' : '📄'}
                </span>
                <span>{item.name}</span>
              </div>
            )}
            {item.type === 'folder' && item.isOpen && item.children && (
              <div className="folder-children">
                {renderFileStructure(item.children)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="editor-panel">
      <PanelGroup direction="horizontal">
        {/* 좌측 사이드바 - 파일 구조 */}
        <Panel defaultSize={20} minSize={15} maxSize={30}>
          <div className="sidebar">
            <div className="sidebar-header">
              <button
                className="icon-button"
                title="파일 탐색기"
              >
                <span role="img" aria-label="file">📄</span>
              </button>
              <button
                className="icon-button"
                title="폴더 구조"
              >
                <span role="img" aria-label="folder">📂</span>
              </button>
            </div>
            <div className="file-explorer hide-scrollbar">
              {renderFileStructure(fileStructure)}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle-horizontal" />

        {/* 메인 에디터 영역 */}
        <Panel defaultSize={80}>
          <div className="main-editor-area">
            {/* 탭바 */}
            <div className="editor-tabs">
              {tabs.map(tab => (
                <div
                  key={tab.id}
                  className={`editor-tab ${activeTabId === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTabId(tab.id)}
                >
                  <span className="tab-name">{tab.name}</span>
                  <button
                    className="close-tab"
                    onClick={(e) => closeTab(tab.id, e)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div className="language-selector-container">
                <select
                  className="language-selector"
                  value={selectedLanguage}
                  onChange={onLanguageSelectChange}
                >
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>
                      {languageDisplayNames[lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <PanelGroup direction="vertical" autoSaveId="editor-output-layout">
              <Panel defaultSize={70} minSize={30}>
                <div className="editor-container" onClick={handleEditorContainerClick}>
                  <CodeMirror
                    ref={codeMirrorRef}
                    value={currentCode}
                    height="100%"
                    onChange={handleCodeChange}
                    extensions={extensions}
                    theme={getTheme(theme)}
                    readOnly={isRunning}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="resize-handle-vertical" />

              <Panel defaultSize={30} minSize={10}>
                <div className="output-panel">
                  <pre>{output || "// 실행 결과가 여기에 표시됩니다."}</pre>
                </div>
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorPanel;
