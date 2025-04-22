import './Header.scss';

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
      <div className="header-timer">남은 시간 {remainingTime}</div>
      <div className="header-title">9BACKPRO</div>
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
