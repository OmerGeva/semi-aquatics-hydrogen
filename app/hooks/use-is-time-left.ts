// Packages
import { useState } from "react";

// Helpers
import { calculateTimeLeft } from '../utils/calculate_time_left';

export const useIsTimeLeft = (): boolean => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(new Date()));

    const totalTimeLeft: number = Object.values(timeLeft).reduce((a: any, b: any) => a + b);
    if (totalTimeLeft > 0) {
      setTimeout(() => {
        setTimeLeft(calculateTimeLeft(new Date()));
      }, 1000);
    } else{
      return false;
    }
    return true;
}