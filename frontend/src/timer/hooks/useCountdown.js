import { useEffect } from 'react';

export function useCountdown(enabled, setItems) {
  useEffect(() => {
    if (!enabled) return;

    const t = setInterval(() => {
      const now = Date.now();
      setItems((prev) =>
        prev.map((it) => {
          if (!it.running || !it.endsAt) return it;

          const remaining = Math.max(0, (it.endsAt - now) / 1000);
          if (remaining <= 0) return { ...it, remainingSec: 0, running: false, endsAt: null };
          return { ...it, remainingSec: remaining };
        })
      );
    }, 200);

    return () => clearInterval(t);
  }, [enabled, setItems]);
}