import { useState, useCallback } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import EditorPanel from '@/pages/coding-test/components/EditorPanel';
import ProblemPanel from '@/pages/coding-test/components/ProblemPanel';
import Header from '@/pages/coding-test/components/Header';
import { useCodingTestMainLogic } from '@/pages/coding-test/hooks/useCodingTestMainLogic';
import { EditorTheme } from '@/pages/coding-test/types/types';
import '@/css/coding-test/CodingTest.scss';
import { useAppSelector } from '@/store';
import { Problem } from '@/api/codingTestApi';

interface SubmissionStatus {
  [problemId: number]: boolean;
}

const CodingTest= () => {
  const [theme] = useState<EditorTheme>('dark');
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({});

  const startTime = useAppSelector((state) => state.teamain.startTime);
  const durationTime = useAppSelector((state) => state.teamain.durationTime);
  const isCodingAllowed = useAppSelector((state) => state.auth.user.coding);
  const testId = useAppSelector((state) => state.teamain.testId) || 1073741824;
  const userId = useAppSelector((state) => state.auth.userId);

  // 문제 제출 상태 업데이트 함수
  const updateSubmissionStatus = useCallback((problemId: number, submitted: boolean) => {
    setSubmissionStatus(prev => ({
      ...prev,
      [problemId]: submitted
    }));
  }, []);

  // 문제 목록이 로드될 때 초기 상태를 설정하는 함수
  const initSubmissionStatus = useCallback((problems: Problem[]) => {
    const initialStatus: SubmissionStatus = {};
    problems.forEach(problem => {
      initialStatus[problem.id] = false;
    });
    setSubmissionStatus(initialStatus);
  }, []);

  const {
    output,
    isRunning,
    remainingTime,
    selectedLanguage,
    handleCodeChange,
    handleLanguageChange,
    handleRunCode,
    handleSubmit,
    handleEndTest,
    currentCode
  } = useCodingTestMainLogic({
    testId,
    userId: userId?.toString() || '',
    selectedProblem,
    updateSubmissionStatus
  });

  if (!isCodingAllowed) {
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
        handleEndTest={handleEndTest}
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
            <ProblemPanel
              onProblemSelect={setSelectedProblem}
              submissionStatus={submissionStatus}
              onProblemsLoaded={initSubmissionStatus}
            />
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
