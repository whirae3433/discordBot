import { useEffect, useMemo, useRef, useState } from 'react';
import { useCountdown } from './useCountdown';

/**
 * 실행 모드에서만 필요한 "타이머 엔진" 훅
 * - items + itemsRef
 * - tick(useCountdown)
 * - click/restart 로직
 * - resetAll
 */
export function useRunTimers({ enabled }) {
  const [items, setItems] = useState([]);
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 실행 모드일 때만 틱
  useCountdown(!!enabled, setItems);

  const resetAll = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        running: false,
        remainingSec: it.durationSec,
        endsAt: null,
      })),
    );
  };

  const clickItem = (id) => {
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx === -1) return prev;

      const now = Date.now();
      const clicked = prev[idx];
      const duration = Math.max(0, clicked.durationSec);

      const restarted = {
        ...clicked,
        running: duration > 0,
        remainingSec: duration,
        endsAt: duration > 0 ? now + duration * 1000 : null,
      };

      // 클릭한 카드를 맨 뒤로 보내기(너가 원했던 동작 유지)
      const next = prev.slice(0, idx).concat(prev.slice(idx + 1));
      next.push(restarted);
      return next;
    });
  };

  // 자주 쓰는 값들
  const firstItemId = items.length > 0 ? items[0].id : null;

  return {
    items,
    setItems,
    itemsRef,
    clickItem,
    resetAll,
    firstItemId,
  };
}
