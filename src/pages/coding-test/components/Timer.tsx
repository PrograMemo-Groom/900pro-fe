import React from 'react';
import { useTimer } from '@/pages/coding-test/hooks/useTimer';

interface TimerProps {
  startTime: string | null;
  durationTime: number | null;
}

const Timer = React.memo(({ startTime, durationTime }: TimerProps) => {
  const { remainingTime } = useTimer(startTime, durationTime);

  return (
    <div className="timer">
      {remainingTime}
    </div>
  );
});

Timer.displayName = 'Timer';

export default Timer;
