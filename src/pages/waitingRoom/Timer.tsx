import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store';
import { setTestId } from '@/store/team/teamainSlice';
import axios from 'axios';
import styles from '@/css/waiting/waitingroom.module.scss';

interface TimerProps {
  startTime: string;
}

export default function Timer({ startTime }: TimerProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [timeLeft, setTimeLeft] = useState(0);
  const [_isActive, setIsActive] = useState(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const teamId = useAppSelector((state) => state.teamain.teamId);
  const problemCount = useAppSelector((state) => state.teamain.problemCount);

  useEffect(() => {
    if (!startTime || !teamId || !problemCount ) return;

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

    const updateTimer = async () => {
      const now = Date.now();
      const diff = Math.floor((startTimestamp - now) / 1000);
      setTimeLeft(diff);

      if (diff <= 1800 && diff > 0) {
        setIsActive(true);
      }
      if (diff <= 0) {
        if (timerId.current) clearInterval(timerId.current);
        // navigate('/coding-test'); // ✅ 시험 시작하면 이동

        try {
          console.log('⌛ 시험 시작! 문제 세팅 중...');

          const response = await axios.post('/api/waiting-room/set-problem', {
            teamId,
            problemCount,
          });

          const testId = response.data.data.testId;
          dispatch(setTestId(testId));

          console.log('✅ 문제 세팅 완료! testId:', testId);

          navigate('/coding-test'); // ✅ 문제 세팅 후 시험 시작 화면 이동
        } catch (error) {
          console.error('❗ 문제 세팅 실패:', error);
          // 실패시 처리 (ex: 알림 띄우고, 대기실 유지 등)
        }
      }
    };

    updateTimer();
    timerId.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [startTime, navigate]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  return (
    <section className={styles.time_section}>
      <h3>시작까지 남은 시간</h3>
      <p className={styles.timer}>
        {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
      </p>
      <hr />
    </section>
  );
}
