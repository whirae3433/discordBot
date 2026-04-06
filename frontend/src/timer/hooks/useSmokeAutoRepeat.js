import { useEffect, useRef } from 'react';

export function useSmokeAutoRepeat({ enabled, items, startItem }) {
  const autoRepeatPendingRef = useRef(new Set());

  useEffect(() => {
    if (!enabled) return;

    for (const it of items) {
      const isExpiredButStillRunning = it.running && it.remainingSec <= 0;

      if (!isExpiredButStillRunning) continue;
      if (autoRepeatPendingRef.current.has(it.id)) continue;

      autoRepeatPendingRef.current.add(it.id);

      startItem(it.id)
        .catch((e) => {
          console.error('자동 반복 시작 실패:', e);
        })
        .finally(() => {
          setTimeout(() => {
            autoRepeatPendingRef.current.delete(it.id);
          }, 500);
        });
    }
  }, [enabled, items, startItem]);
}
