import { useEffect, useState } from 'react';
import { getMillisecondsUntilNextKigaliMidnight } from '../lib/dates';

export function useKigaliNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let midnightTimer: number | null = null;

    const scheduleMidnightRefresh = () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      midnightTimer = window.setTimeout(() => {
        setNow(new Date());
        scheduleMidnightRefresh();
      }, Math.max(1_000, getMillisecondsUntilNextKigaliMidnight()));
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      setNow(new Date());
      scheduleMidnightRefresh();
    };

    scheduleMidnightRefresh();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (midnightTimer !== null) window.clearTimeout(midnightTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return now;
}
