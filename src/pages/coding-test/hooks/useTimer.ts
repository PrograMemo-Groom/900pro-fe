import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (startTimeString: string | null, durationTime: number | null) => {
  const [remainingTime, setRemainingTime] = useState<string>('00:00:00');
  const timerId = useRef<NodeJS.Timeout | null>(null);
  const timeRef = useRef<string>('00:00:00');
  const endTimestampRef = useRef<number | null>(null);

  // 타이머 로직
  useEffect(() => {
    if (!startTimeString || !durationTime) return;

    // 시작 시간 파싱 (HH:MM 형식)
    const [hour, minute] = startTimeString.split(':').map(Number);

    // 현재 날짜 기준으로 시작 시간 설정
    const today = new Date();
    const startTimestamp = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      hour,
      minute,
      0
    ).getTime();

    // 종료 시간 계산 (시작 시간 + 지속 시간)
    endTimestampRef.current = startTimestamp + (durationTime * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const endTimestamp = endTimestampRef.current;

      if (!endTimestamp) return;

      // 시험이 이미 종료되었으면
      if (now >= endTimestamp) {
        timeRef.current = '00:00:00';
        setRemainingTime('00:00:00');
        if (timerId.current) clearInterval(timerId.current);
        return;
      }

      // 남은 시간 계산 (초 단위)
      const diffInSeconds = Math.floor((endTimestamp - now) / 1000);

      // 시, 분, 초 형식으로 변환
      const hours = Math.floor(diffInSeconds / 3600);
      const minutes = Math.floor((diffInSeconds % 3600) / 60);
      const seconds = diffInSeconds % 60;

      // HH:MM:SS 형식으로 포맷팅
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      // 이전 값과 다를 때만 상태 업데이트
      if (timeRef.current !== formattedTime) {
        timeRef.current = formattedTime;
        setRemainingTime(formattedTime);
      }
    };

    // 초기 타이머 업데이트
    updateTimer();

    // 1초마다 타이머 업데이트
    timerId.current = setInterval(updateTimer, 1000);

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [startTimeString, durationTime]);

  // 타이머 값을 직접 접근할 수 있는 getter 함수
  const getTime = useCallback(() => timeRef.current, []);

  return { remainingTime, getTime };
};
