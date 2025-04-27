import '@/css/coding-test/ProblemPanel.scss';
import { useEffect, useState } from 'react';
import { fetchProblemList, Problem } from '@/api/codingTestApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

// 문제 제출 상태를 관리하는 타입
interface SubmissionStatus {
  [problemId: number]: boolean; // true: 제출완료, false: 미제출
}

interface ProblemPanelProps {
  onProblemSelect?: (problem: Problem) => void;
  submissionStatus: SubmissionStatus;
  onProblemsLoaded?: (problems: Problem[]) => void;
}

const ProblemPanel = ({ onProblemSelect, submissionStatus, onProblemsLoaded }: ProblemPanelProps) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 리덕스에서 testId 가져오기
  const testId = useSelector((state: RootState) => state.teamain.testId);

  useEffect(() => {
    const loadProblems = async () => {
      try {
        // 리덕스에서 가져온 testId 사용
        if (!testId) {
          setError('테스트 ID가 없습니다.');
          setLoading(false);
          return;
        }

        const problemList = await fetchProblemList(testId);
        setProblems(problemList);

        // 문제 목록을 부모 컴포넌트로 전달하여 초기 제출 상태 설정
        onProblemsLoaded?.(problemList);

        // 첫 번째 문제를 기본으로 선택
        if (problemList.length > 0) {
          setSelectedProblem(problemList[0]);
          // 선택된 문제 부모 컴포넌트로 전달
          onProblemSelect?.(problemList[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('문제 로딩 중 오류:', err);
        setError('문제를 불러오는 중 오류가 발생했습니다.');
        setLoading(false);
      }
    };

    loadProblems();
  }, [testId, onProblemSelect, onProblemsLoaded]);

  // 문제 선택 핸들러
  const handleProblemSelect = (problem: Problem) => {
    setSelectedProblem(problem);
    // 선택된 문제 부모 컴포넌트로 전달
    onProblemSelect?.(problem);
  };

  if (loading) {
    return <div className="problem-panel">문제를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="problem-panel error">{error}</div>;
  }

  if (!selectedProblem) {
    return (
      <div className="problem-panel">
        <div style={{ padding: '10px 15px' }}>문제가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="problem-panel">
      <div className="problem-header">
        <div className="problem-tabs">
          {problems.map((problem) => (
            <button
              key={problem.id}
              className={`problem-tab ${selectedProblem.id === problem.id ? 'active' : ''}`}
              onClick={() => handleProblemSelect(problem)}
            >
              #{problem.baekNum} {submissionStatus[problem.id] ? '(제출)' : '(미제출)'}
            </button>
          ))}
        </div>
        <h2 className="problem-title">#{selectedProblem.baekNum} {selectedProblem.title}</h2>
      </div>

      <div className="problem-details">
        <div dangerouslySetInnerHTML={{ __html: selectedProblem.description }} />

        {selectedProblem.inputDes && (
          <>
            <h3>입력</h3>
            <p>{selectedProblem.inputDes}</p>
          </>
        )}

        {selectedProblem.outputDes && (
          <>
            <h3>출력</h3>
            <p>{selectedProblem.outputDes}</p>
          </>
        )}

        <h3>예시 입력</h3>
        <pre>{selectedProblem.exInput}</pre>

        <h3>예시 출력</h3>
        <pre>{selectedProblem.exOutput}</pre>
      </div>
    </div>
  );
};

export default ProblemPanel;
