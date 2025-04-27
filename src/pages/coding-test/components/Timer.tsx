import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '@/pages/coding-test/hooks/useTimer';
import { endCodingTest } from '@/api/codingTestApi';
import { updateUserCodingStatus } from '@/api/waitingRoomApi';
import { updatePartialUserInfo } from '@/store/auth/slices';
import { useAppDispatch } from '@/store';
import { useAppSelector } from '@/store';
import { Problem } from '@/api/codingTestApi';

interface TimerProps {
  testId: number;
  startTime: string | null;
  durationTime: number | null;
  selectedProblem: Problem | null;
}

const Timer = React.memo(({ startTime, durationTime, testId, selectedProblem }: TimerProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.userId);

  const handleTimerExpire = useCallback(async () => {
    const endTestData = {
      testId: testId,
      problemId: selectedProblem?.id || 0,
      userId: Number(userId)
    };

    try {
      // console.log('⌛ 시험 종료!');
      const response = await endCodingTest(endTestData);
      if (response.success) {
        await updateUserCodingStatus(Number(userId));
        dispatch(updatePartialUserInfo({ coding: false }));
        localStorage.removeItem('codingTestCode');
        localStorage.removeItem('codingTestLanguage');
        alert('수고하셨습니다.');
      }
    } catch (error) {
      console.error('유저 상태 업데이트 실패:', error);
    }
    navigate('/history');
  }, [navigate, userId, dispatch, testId, selectedProblem]);

  const { remainingTime } = useTimer(startTime, durationTime, handleTimerExpire);

  return (
    <div className="timer">
      {remainingTime}
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;
