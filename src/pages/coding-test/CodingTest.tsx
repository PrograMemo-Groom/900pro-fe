import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import EditorPanel, { CodeLanguage, EditorTheme } from '@/pages/coding-test/components/EditorPanel';
import ProblemPanel from '@/pages/coding-test/components/ProblemPanel';
import Header from '@/pages/coding-test/components/Header';
import { useCodingTestLogic } from '@/pages/coding-test/hooks/useCodingTestLogic';
import '@/pages/coding-test/CodingTest.scss';

const CodingTestPage: React.FC = () => {
  const [theme] = useState<EditorTheme>('dark');
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
  } = useCodingTestLogic();

  const onLanguageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleLanguageChange(e.target.value as CodeLanguage);
  };

  return (
    <div className="coding-test-container dark-mode">
      <Header
        remainingTime={remainingTime}
        isRunning={isRunning}
        handleRunCode={handleRunCode}
        handleSubmit={handleSubmit}
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
              onLanguageSelectChange={onLanguageSelectChange}
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

export default CodingTestPage;
