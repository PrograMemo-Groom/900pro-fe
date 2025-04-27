import '@/css/coding-test/Header.scss';
import { useNavigate } from 'react-router-dom';
import Timer from '@/pages/coding-test/components/Timer';

interface HeaderProps {
  remainingTime: string;
  isRunning: boolean;
  handleRunCode: () => void;
  handleSubmit: () => void;
  handleEndTest?: () => void;
  startTime?: string | null;
  durationTime?: number | null;
}

const Header = ({
  remainingTime,
  isRunning,
  handleRunCode,
  handleSubmit,
  handleEndTest,
  startTime = null,
  durationTime = null
}: HeaderProps) => {
  const navigate = useNavigate();

  const confirmEndTest = () => {
    if (window.confirm('시험을 종료하시겠습니까?')) {
      if (handleEndTest) {
        handleEndTest();
      }
      navigate('/history');
    }
  };

  return (
    <div className="header">
      <div className="header-timer">
        <span>남은 시간 </span>
        {startTime && durationTime ? (
          <Timer startTime={startTime} durationTime={durationTime} />
        ) : (
          <span>{remainingTime}</span>
        )}
      </div>
      <div className="header-title">
        <h1>9BACKPRO</h1>
      </div>
      <div className="header-actions">
        <button
          className="run-button header-button"
          onClick={handleRunCode}
          disabled={isRunning}
        >
          {isRunning ? '실행중...' : '실행하기'}
        </button>
        <button className="submit-button header-button" onClick={handleSubmit}>제출하기</button>
        <button className="end-test-button header-button" onClick={confirmEndTest}>시험종료</button>
      </div>
    </div>
  );
};

export default Header;
