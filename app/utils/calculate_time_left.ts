interface TimeLeftObj {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export const calculateTimeLeft = (dropDateUTC: Date): TimeLeftObj => {
  // Get current time in Eastern Time from UTC
  const nowUTC = new Date(); // Current UTC time
  
  // Calculate difference between dropDateUTC and current Eastern Time
  // todo: remove
  let difference = 0
  try {
    difference = dropDateUTC.getTime() - nowUTC.getTime();
  } catch (error) {
    console.warn('Unable to calculate drop countdown', error);
  }
  
  let timeLeft: TimeLeftObj = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  return timeLeft;
};
