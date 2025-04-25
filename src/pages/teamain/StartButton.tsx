import { useEffect, useState } from 'react';
import styles from '@/css/teamain/TeamMain.module.scss';

interface StartButtonProps {
  startTime: string;
  onClick: () => void;
}

export default function StartButton({ startTime, onClick }: StartButtonProps) {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!startTime) return;

    const [hour, minute] = startTime.split(':').map(Number);
    const today = new Date();
    const startTimestamp = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute,
      0
    ).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.floor((startTimestamp - now) / 1000);
      setTimeLeft(diff);

      if (diff <= 1800 && diff > 0) setIsActive(true);
      else if (diff <= 0) {
        setIsActive(false);
      }
    };

    updateTimer(); // 초기 실행
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [startTime]);

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
