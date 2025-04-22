import { useState, useRef, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle, ImperativePanelHandle } from 'react-resizable-panels';
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

// SVG 아이콘 임포트
import pythonIcon from '@/assets/python.svg';
import javascriptIcon from '@/assets/javascript.svg';
import javaIcon from '@/assets/java.svg';
import cppIcon from '@/assets/cpp.svg';
import cIcon from '@/assets/c.svg';

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
}

interface EditorPanelProps {
  selectedLanguage: CodeLanguage;
  onLanguageDropdownChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTabLanguageChange: (lang: CodeLanguage) => void;
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
        name: 'main',
        type: 'folder',
        children: [
          { id: '3', name: 'main.java', type: 'file', extension: 'java' },
          { id: '4', name: 'Untitled.txt', type: 'file', extension: 'txt' },
        ]
      },
      {
        id: '5',
        name: 'test',
        type: 'folder',
        children: [
          { id: '6', name: 'input.txt', type: 'file', extension: 'txt' },
        ]
      },
    ]
  },
  {
    id: '7',
    name: 'etc',
    type: 'folder',
    children: [
      { id: '8', name: 'practice.js', type: 'file', extension: 'js' },
      { id: '9', name: 'practice.cpp', type: 'file', extension: 'cpp' },
      { id: '10', name: 'practice.py', type: 'file', extension: 'py' },
    ]
  },
];

const EditorPanel: React.FC<EditorPanelProps> = ({
  selectedLanguage,
  onLanguageDropdownChange,
  onTabLanguageChange,
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
  const [tabs, setTabs] = useState<Tab[]>(() => {
    // 초기 selectedLanguage에 맞는 기본 탭 이름 설정
    let initialTabName = 'main';
    if (selectedLanguage === 'python') initialTabName += '.py';
    else if (selectedLanguage === 'javascript') initialTabName += '.js';
    else if (selectedLanguage === 'java') initialTabName += '.java';
    else if (selectedLanguage === 'cpp') initialTabName += '.cpp';
    else if (selectedLanguage === 'c') initialTabName += '.c';
    else initialTabName += '.txt'; // 예외 처리

    return [{ id: 'initialTab', name: initialTabName, language: selectedLanguage }];
  });
  const [activeTabId, setActiveTabId] = useState<string>('initialTab');

  // CodeMirror 인스턴스를 참조하기 위한 ref 추가
  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  // 사이드바 접힘 상태 관리
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const [sidebarSize, setSidebarSize] = useState(15);

  // 컴포넌트 마운트 시 사이드바 초기 상태 설정
  useEffect(() => {
    const panel = sidebarPanelRef.current;
    if (panel && isSidebarCollapsed) {
      panel.collapse();
    }
  }, []);

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    const panel = sidebarPanelRef.current;
    if (panel) {
      if (isSidebarCollapsed) {
        panel.expand();
      } else {
        panel.collapse();
      }
    }
  };

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
    const existingTab = tabs.find(tab => tab.id === file.id);

    let fileLanguage: CodeLanguage = 'javascript'; // 기본값
    const fileExtension = file.extension || '';
    if (fileExtension === 'py') fileLanguage = 'python';
    else if (fileExtension === 'java') fileLanguage = 'java';
    else if (fileExtension === 'cpp' || fileExtension === 'c') fileLanguage = fileExtension as CodeLanguage;
    else if (fileExtension === 'js') fileLanguage = 'javascript';

    if (existingTab) {
      // 이미 열려있는 탭이면 해당 탭을 활성화하고, 해당 탭의 언어로 전역 언어 변경
      setActiveTabId(file.id);
      if (selectedLanguage !== existingTab.language) {
        onTabLanguageChange(existingTab.language); // 전역 언어 변경 콜백 호출
      }
    } else {
      // 새 탭 추가 (content 없이)
      const newTab: Tab = {
        id: file.id,
        name: file.name,
        language: fileLanguage,
      };
      const newTabs = [...tabs, newTab];
      setTabs(newTabs);
      setActiveTabId(file.id);
      // 새 탭의 언어로 전역 언어 변경
      if (selectedLanguage !== fileLanguage) {
        onTabLanguageChange(fileLanguage); // 전역 언어 변경 콜백 호출
      }
    }
  };

  // 탭 닫기 함수
  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const closingTabIndex = tabs.findIndex(tab => tab.id === id);
    const filteredTabs = tabs.filter(tab => tab.id !== id);

    if (filteredTabs.length === 0) {
      // 모든 탭이 닫힌 경우: 새 기본 탭 추가 (초기 상태와 유사하게 처리 필요 - 여기서는 간단히 js로)
      const defaultLang = 'javascript';
      const newTab: Tab = { id: 'newtab', name: 'untitled.js', language: defaultLang };
      setTabs([newTab]);
      setActiveTabId('newtab');
      if (selectedLanguage !== defaultLang) {
        onTabLanguageChange(defaultLang);
      }
    } else if (activeTabId === id) {
      // 활성화된 탭이 닫힌 경우: 이전 탭 또는 첫번째 탭 활성화
      const newActiveIndex = Math.max(0, closingTabIndex - 1);
      const newActiveTab = filteredTabs[newActiveIndex];
      setActiveTabId(newActiveTab.id);
      // 새로 활성화된 탭의 언어로 변경
      if (selectedLanguage !== newActiveTab.language) {
        onTabLanguageChange(newActiveTab.language);
      }
      setTabs(filteredTabs); // 상태 업데이트는 여기서 한 번만
    } else {
       // 비활성 탭이 닫힌 경우: 활성 탭 유지, 탭 목록만 업데이트
       setTabs(filteredTabs);
    }
  };

  // 탭 클릭 핸들러 추가: 클릭된 탭의 언어로 전역 언어 변경
  const handleTabClick = (tabId: string) => {
    const clickedTab = tabs.find(tab => tab.id === tabId);
    if (clickedTab) {
      setActiveTabId(tabId);
      if (selectedLanguage !== clickedTab.language) {
        onTabLanguageChange(clickedTab.language); // 전역 언어 변경 콜백 호출
      }
    }
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
                  {item.extension === 'js' ? <img src={javascriptIcon} alt="JavaScript" width="16" height="16" /> :
                   item.extension === 'py' ? <img src={pythonIcon} alt="Python" width="16" height="16" /> :
                   item.extension === 'java' ? <img src={javaIcon} alt="Java" width="16" height="16" /> :
                   item.extension === 'cpp' ? <img src={cppIcon} alt="C++" width="16" height="16" /> :
                   item.extension === 'c' ? <img src={cIcon} alt="C" width="16" height="16" /> : '📄'}
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
      <button
        className="sidebar-toggle-button"
        onClick={toggleSidebar}
        style={{
          left: isSidebarCollapsed ? '0px' : `${sidebarSize}%`,
          transform: isSidebarCollapsed ? 'translateX(0)' : 'translateX(-100%)',
        }}
        title={isSidebarCollapsed ? "탐색기 펼치기" : "탐색기 접기"}
      >
        {isSidebarCollapsed ? '>' : '<'}
      </button>

      <PanelGroup direction="horizontal">
        {/* 좌측 사이드바 - 파일 구조 */}
        <Panel
          ref={sidebarPanelRef}
          defaultSize={sidebarSize}
          minSize={10}
          maxSize={50}
          collapsible={true}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          onResize={setSidebarSize}
          order={1}
          className="sidebar-panel"
        >
          <div className="sidebar">
            <div className="sidebar-header">
              <button className="icon-button" title="파일 탐색기">
                <span role="img" aria-label="file">📄</span>
              </button>
              <button className="icon-button" title="폴더 구조">
                <span role="img" aria-label="folder">📂</span>
              </button>
            </div>
            <div className="file-explorer hide-scrollbar">
              {renderFileStructure(fileStructure)}
            </div>
          </div>
        </Panel>

        {!isSidebarCollapsed && (
          <PanelResizeHandle className="resize-handle-horizontal" />
        )}

        {/* 메인 에디터 영역 */}
        <Panel defaultSize={80} order={2}>
          <div className="main-editor-area">
            {/* 헤더 영역 - 탭바와 언어 선택기 */}
            <div className="editor-header">
              {/* 탭바 */}
              <div className="editor-tabs">
                {tabs.map(tab => (
                  <div
                    key={tab.id}
                    className={`editor-tab ${activeTabId === tab.id ? 'active' : ''}`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <div className="file">
                      <span className="file-icon">
                        {tab.language === 'javascript' ? <img src={javascriptIcon} alt="JavaScript" width="16" height="16" /> :
                         tab.language === 'python' ? <img src={pythonIcon} alt="Python" width="16" height="16" /> :
                         tab.language === 'java' ? <img src={javaIcon} alt="Java" width="16" height="16" /> :
                         tab.language === 'cpp' ? <img src={cppIcon} alt="C++" width="16" height="16" /> :
                         tab.language === 'c' ? <img src={cIcon} alt="C" width="16" height="16" /> : '📄'}
                      </span>
                      <span className="tab-name">{tab.name}</span>
                    </div>
                    <button
                      className="close-tab"
                      onClick={(e) => closeTab(tab.id, e)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              <div className="language-selector-container">
                <select
                  className="language-selector"
                  value={selectedLanguage}
                  onChange={onLanguageDropdownChange}
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
              <Panel defaultSize={70} minSize={10}>
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
