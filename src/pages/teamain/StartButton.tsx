import React from 'react';
import styles from '@/css/teamain/TeamMain.module.scss';

interface StartButtonProps {
  isActive: boolean;
  timeLeft: number;
  onClick: () => void;
}

function StartButton({ isActive, timeLeft, onClick }: StartButtonProps) {
  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <button
      className={styles.start_button}
      disabled={!isActive}
      onClick={onClick}
    >
      {isActive
        ? `시험 시작까지 ${formatTime(timeLeft)} 남음`
        : '시험에 입장할 수 없습니다.'}
    </button>
  );
}

export default React.memo(StartButton);
