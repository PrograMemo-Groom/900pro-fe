import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import EditorPanel from '@/pages/coding-test/components/EditorPanel';
import ProblemPanel from '@/pages/coding-test/components/ProblemPanel';
import Header from '@/pages/coding-test/components/Header';
import { useCodingTestMainLogic } from '@/pages/coding-test/hooks/useCodingTestMainLogic';
import { EditorTheme } from '@/pages/coding-test/types/types';
import '@/css/coding-test/CodingTest.scss';
import { useAppSelector } from '@/store';

const CodingTest= () => {
  const [theme] = useState<EditorTheme>('dark');
  const startTime = useAppSelector((state) => state.teamain.startTime);
  const durationTime = useAppSelector((state) => state.teamain.durationTime);
  const isCodingAllowed = useAppSelector((state) => state.auth.user.coding);

  const {
    output,
    isRunning,
    remainingTime,
    selectedLanguage,
    handleCodeChange,
    handleLanguageChange,
    handleRunCode,
    handleSubmit,
    currentCode
  } = useCodingTestMainLogic();

  if (isCodingAllowed === false) {
    return (
      <div className="coding-test-container dark-mode">
        <div className="access-denied-message" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <h2>접근 권한이 없습니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="coding-test-container dark-mode">
      <Header
        remainingTime={remainingTime}
        isRunning={isRunning}
        handleRunCode={handleRunCode}
        handleSubmit={handleSubmit}
        startTime={startTime}
        durationTime={durationTime}
      />

      <div className="main-content">
        <PanelGroup
          direction="horizontal"
          autoSaveId="coding-test-layout"
          onLayout={(sizes) => {
            localStorage.setItem('panel-sizes', JSON.stringify(sizes));
          }}
        >
          <Panel defaultSize={40} minSize={20}>
            <ProblemPanel />
          </Panel>

          <PanelResizeHandle className="resize-handle" id="resize-handle" />

          <Panel defaultSize={60} minSize={30}>
            <EditorPanel
              selectedLanguage={selectedLanguage}
              onTabLanguageChange={handleLanguageChange}
              currentCode={currentCode}
              handleCodeChange={handleCodeChange}
              theme={theme}
              isRunning={isRunning}
              output={output}
            />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default CodingTest;
