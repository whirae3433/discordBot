import { useEffect, useState } from 'react';

export function useNowTick(interval = 250) {
  const [nowTick, setNowTick] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);

  return nowTick;
}
