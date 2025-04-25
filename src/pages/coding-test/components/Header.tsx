import '@/css/coding-test/Header.scss';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  remainingTime: string;
  isRunning: boolean;
  handleRunCode: () => void;
  handleSubmit: () => void;
  handleEndTest?: () => void;
}

const Header = ({
  remainingTime,
  isRunning,
  handleRunCode,
  handleSubmit,
  // handleEndTest
}: HeaderProps) => {
  const navigate = useNavigate();

  const confirmEndTest = () => {
    if (window.confirm('시험을 종료하시겠습니까?')) {
      // 외부에서 제공된 handleEndTest가 있으면 실행
      // if (handleEndTest) {
      //   handleEndTest();
      // }
      alert('수고하셨습니다.');
      navigate('/history');
    }
  };

  return (
    <div className="header">
      <div className="header-timer">
        <span>남은 시간 </span>
        <span>{remainingTime}</span>
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
