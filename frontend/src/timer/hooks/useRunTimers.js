import { useEffect, useRef, useState, useCallback } from 'react';
import { useCountdown } from './useCountdown';
import { useBeep } from './useBeep';

export function useRunTimers({ enabled, beepSrc = './beep.mp3', muted }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);

  const { beep, ensureReady } = useBeep({ src: beepSrc, volume: 0.9 });

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useCountdown(!!enabled, setItems);

  const clearBeepTimeout = (it) => {
    if (it?.beepTimeoutId) clearTimeout(it.beepTimeoutId);
  };

  const resetPatch = useCallback(
    (it) => {
      clearBeepTimeout(it);
      return {
        ...it,
        running: false,
        remainingSec: it.durationSec,
        endsAt: null,
        beepTimeoutId: null,
      };
    },
    [], // clearBeepTimeout는 렌더마다 동일(closure 문제 없음)
  );

  const resetAll = () => setItems((prev) => prev.map(resetPatch));
  const resetItem = (id) =>
    setItems((prev) => prev.map((it) => (it.id === id ? resetPatch(it) : it)));

  const clickItem = (id, source = 'mouse') => {
    ensureReady();

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx === -1) return prev;

      const clicked = prev[idx];
      if (source === 'hotkey' && clicked.running) return prev;

      clearBeepTimeout(clicked);

      const now = Date.now();
      const duration = Math.max(0, clicked.durationSec);
      const endsAt = duration > 0 ? now + duration * 1000 : null;

      let beepTimeoutId = null;
      if (endsAt && duration >= 10) {
        const msUntilBeep = endsAt - 11_000 - now;
        beepTimeoutId = setTimeout(
          () => {
            const current = itemsRef.current?.find((x) => x.id === id);
            if (current?.running && current?.endsAt === endsAt && !muted) {
              beep();
            }
          },
          Math.max(0, msUntilBeep),
        );
      }

      const restarted = {
        ...clicked,
        running: duration > 0,
        remainingSec: duration,
        endsAt,
        beepTimeoutId,
      };

      const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
      next.push(restarted);
      return next;
    });
  };

  return { items, setItems, itemsRef, clickItem, resetAll, resetItem };
}
