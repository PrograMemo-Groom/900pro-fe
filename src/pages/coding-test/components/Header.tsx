import '@/css/coding-test/Header.scss';

interface HeaderProps {
  remainingTime: string;
  isRunning: boolean;
  handleRunCode: () => void;
  handleSubmit: () => void;
}

const Header = ({
  remainingTime,
  isRunning,
  handleRunCode,
  handleSubmit
}: HeaderProps) => {
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
      </div>
    </div>
  );
};

export default Header;
