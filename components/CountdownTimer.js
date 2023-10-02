import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endDate }) => {
  // Define calculateTimeRemaining function before using it
  const calculateTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    return Math.max(end - now, 0);
  };

  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(endDate));

  useEffect(() => {
    const timerInterval = setInterval(() => {
      const remaining = calculateTimeRemaining(endDate);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        clearInterval(timerInterval);
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [endDate]);

  const formatTime = (time) => {
    const hours = Math.floor(time / 3600000);
    const minutes = Math.floor((time % 3600000) / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div>
      {formatTime(timeRemaining)}
    </div>
  );
};

export default CountdownTimer;
