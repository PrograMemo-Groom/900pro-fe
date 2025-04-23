import { useState, useRef, useEffect } from 'react';
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { EditorPanelProps } from '@/pages/coding-test/types/types';
import '@/css/coding-test/EditorPanel.scss';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// 분리된 컴포넌트 및 훅 임포트
import useTabManagement from './EditorPanel/hooks/useTabManagement';
import Sidebar from './EditorPanel/sidebar/Sidebar';
import TabBar from './EditorPanel/editor/TabBar';
import CodeEditor from './EditorPanel/editor/CodeEditor';
import OutputPanel from './EditorPanel/editor/OutputPanel';

const EditorPanel = ({
  selectedLanguage,
  onTabLanguageChange,
  currentCode,
  handleCodeChange,
  theme,
  isRunning,
  output
}: EditorPanelProps) => {

  const codeMirrorRef = useRef<ReactCodeMirrorRef>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const sidebarPanelRef = useRef<any>(null);
  const [sidebarSize, setSidebarSize] = useState(0);

  // 탭 관리 훅
  const {
    tabs,
    activeTabId,
    handleTabClick,
    closeTab,
    addTab
  } = useTabManagement({
    defaultLanguage: selectedLanguage,
    onLanguageChange: onTabLanguageChange
  });

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
        panel.expand(15);
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
        const doc = view.state.doc;
        const lastLine = doc.lines;
        const lastLineLength = doc.line(lastLine).length;

        const transaction = view.state.update({
          selection: { anchor: doc.line(lastLine).from + lastLineLength },
          scrollIntoView: true
        });
        view.dispatch(transaction);
        view.focus();
      }
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = (id: string, name: string, language: any) => {
    addTab(id, name, language);
  };

  // 파일 삭제 시 해당 탭을 닫는 핸들러
  const handleDeleteItem = (id: string) => {
    // 해당 ID의 탭이 열려있는지 확인
    const tabToClose = tabs.find(tab => tab.id === id);
    if (tabToClose) {
      // 실제 탭 닫기를 위한 가짜 이벤트 객체 생성
      const mockEvent = {
        stopPropagation: () => {}
      } as React.MouseEvent;
      closeTab(id, mockEvent);
    }
  };

  return (
    <div className="editor-panel">
      <button
        className="sidebar-toggle-button"
        onClick={toggleSidebar}
        style={{
          left: isSidebarCollapsed ? '0px' : `calc(${sidebarSize}% - 3px)`,
          transform: isSidebarCollapsed ? 'translateX(0)' : 'translateX(-100%)',
        }}
        title={isSidebarCollapsed ? "탐색기 펼치기" : "탐색기 접기"}
      >
        {isSidebarCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      <PanelGroup direction="horizontal">
        {/* 좌측 사이드바 - 파일 구조 */}
        <Sidebar
          ref={sidebarPanelRef}
          activeFileId={activeTabId}
          onFileSelect={handleFileSelect}
          onCollapse={() => setIsSidebarCollapsed(true)}
          onExpand={() => setIsSidebarCollapsed(false)}
          onResize={setSidebarSize}
          defaultSize={sidebarSize}
          onDeleteItem={handleDeleteItem}
        />

        {/* resize handle은 항상 렌더링하되, 사이드바가 접혀있을 때는 숨김 */}
        <PanelResizeHandle
          className={`resize-handle-horizontal ${isSidebarCollapsed ? 'hidden-resize-handle' : ''}`}
        />

        {/* 메인 에디터 영역 */}
        <Panel defaultSize={100} order={2}>
          <div className="main-editor-area">
            {/* 헤더 영역 - 탭바와 언어 선택기 */}
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              selectedLanguage={selectedLanguage}
              onTabClick={handleTabClick}
              onTabClose={closeTab}
            />

            <PanelGroup direction="vertical" autoSaveId="editor-output-layout">
              <Panel defaultSize={70} minSize={10}>
                <CodeEditor
                  ref={codeMirrorRef}
                  code={currentCode}
                  language={selectedLanguage}
                  theme={theme}
                  isReadOnly={isRunning}
                  onChange={handleCodeChange}
                  onClick={handleEditorContainerClick}
                />
              </Panel>

              <PanelResizeHandle className="resize-handle-vertical" />

              <Panel defaultSize={30} minSize={10}>
                <OutputPanel output={output} />
              </Panel>
            </PanelGroup>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default EditorPanel;
