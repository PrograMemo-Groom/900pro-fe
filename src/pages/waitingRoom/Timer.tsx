import { useAppDispatch, useAppSelector } from '@/store';
import { updatePartialUserInfo } from '@/store/auth/slices';
import { setTestId } from '@/store/team/teamainSlice';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import { attendCheck, updateUserCodingStatus } from '@/api/waitingRoomApi';
import styles from '@/css/waiting/WaitingRoom.module.scss';

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
  const userId = useAppSelector((state) => state.auth.user.id);

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

        try {
          // console.log('⌛ 시험 시작!');
          // 시험 시작과 동시에 해야하는 일들 여기 적어주세요 - 건영님!
          if (userId) {
            await updateUserCodingStatus(userId);
            dispatch(updatePartialUserInfo({ coding: true }));
            if (teamId) {
              const response = await attendCheck(userId, teamId);
              dispatch(setTestId(response.data.testId));
            }
          }
          navigate('/coding-test'); // ✅ 문제 세팅 후 시험 시작 화면 이동
        } catch (error) {
          console.error('❗ 문제 세팅 실패:', error);
          // 실패시 처리 필요하면 적으세요
          if (userId) {
            await new Promise((res) => setTimeout(res, 2000)); // 2초 쉬었다가
            const retryResponse = await attendCheck(userId, teamId); // 다시 시도
            dispatch(setTestId(retryResponse.data.testId));
            navigate('/coding-test')
          }
        }
      }
    };

    updateTimer();
    timerId.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [startTime, navigate, userId]);

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
