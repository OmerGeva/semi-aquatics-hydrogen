import { useState, useEffect, useRef } from 'react';
import { calculateTimeLeft } from '../../utils/calculate_time_left';

const styles = {
  countdownTimerContainer: 'countdownTimerContainer',
} as const;

type PropsT = {
  dropDateTime: Date;
  setShowCountdown: (showCountdown: boolean) => void;
};

const CountdownTimer = ({ dropDateTime, setShowCountdown }: PropsT) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(dropDateTime));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft(dropDateTime);
      if (updatedTimeLeft.total <= 0) {
        setShowCountdown(false);
        clearInterval(intervalRef.current as NodeJS.Timeout);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      } else {
        setTimeLeft(updatedTimeLeft);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [dropDateTime]);

  if (timeLeft.total <= 0) {
    return <span></span>;
  }

  const formatTime = (num: number) => String(num).padStart(2, '0');

  return (
    <div className={styles.countdownTimerContainer}>
      {formatTime(timeLeft.days)}:
      {formatTime(timeLeft.hours)}:
      {formatTime(timeLeft.minutes)}:
      {formatTime(timeLeft.seconds)}
    </div>
  );
};

export default CountdownTimer;
