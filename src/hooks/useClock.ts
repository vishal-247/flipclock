import { useState, useEffect, useCallback } from 'react';
import { ClockFormat } from '../settings/types';

interface ClockState {
  hours: number;
  minutes: number;
  seconds: number;
  ampm: 'AM' | 'PM';
  dateString: string;
  dayString: string;
}

export function useClock(format: ClockFormat = '12h') {
  const getClockValues = useCallback((): ClockState => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const ampm: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';

    if (format === '12h') {
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 hour should be 12
    }

    // Formatted date string (e.g. "Monday, Nov 16" and "2026")
    const dayString = now.toLocaleDateString(undefined, { weekday: 'short' }).toUpperCase();
    const dateString = now.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }).toUpperCase();

    return {
      hours,
      minutes,
      seconds,
      ampm,
      dateString,
      dayString,
    };
  }, [format]);

  const [state, setState] = useState<ClockState>(getClockValues);

  useEffect(() => {
    let timeoutId: number;

    const tick = () => {
      setState(getClockValues());
      // Calculate delay to next second boundary for pinpoint precision
      const now = Date.now();
      const delay = 1000 - (now % 1000);
      timeoutId = window.setTimeout(tick, delay);
    };

    // Immediate update on format switch
    setState(getClockValues());
    const initialDelay = 1000 - (Date.now() % 1000);
    timeoutId = window.setTimeout(tick, initialDelay);

    // Resync immediately when tab becomes visible after being backgrounded
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setState(getClockValues());
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getClockValues]);

  return state;
}

