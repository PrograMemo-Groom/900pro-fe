import '@/css/coding-test/ProblemPanel.scss';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { fetchProblems, setSelectedProblemId } from '@/store/coding-test/problemSlice';

const ProblemPanel = () => {
  const dispatch = useDispatch();
  const { problems, selectedProblemId, loading } = useSelector(
    (state: RootState) => state.codingProblem
  );

  // 선택된 문제 찾기
  const selectedProblem = problems.find(p => p.baekNum === selectedProblemId);

  // 문제 목록 불러오기
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const testday = "2025-04-25"
    // Redux thunk 액션 호출
    dispatch(fetchProblems({ teamId: 1, date: testday }) as any);
  }, [dispatch]);

  // 문제 선택 핸들러
  const handleProblemSelect = (baekNum: number) => {
    dispatch(setSelectedProblemId(baekNum));
  };

  if (loading) {
    return <div className="problem-panel">로딩 중...</div>;
  }

  if (!selectedProblem && problems.length > 0) {
    return <div className="problem-panel">문제를 선택해주세요.</div>;
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
              key={problem.baekNum}
              className={`problem-tab ${selectedProblemId === problem.baekNum ? 'active' : ''}`}
              onClick={() => handleProblemSelect(problem.baekNum)}
            >
              #{problem.baekNum}
            </button>
          ))}
        </div>
        <h2 className="problem-title">#{selectedProblem.baekNum} {selectedProblem.title}</h2>
      </div>

      <div className="problem-details">
        <p>{selectedProblem.description}</p>

        <h3>입력</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{selectedProblem.inputDes}</p>

        <h3>출력</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{selectedProblem.outputDes}</p>

        <h3>예시 입력</h3>
        <pre>{selectedProblem.exInput}</pre>

        <h3>예시 출력</h3>
        <pre>{selectedProblem.exOutput}</pre>
      </div>
    </div>
  );
};

export default ProblemPanel;
