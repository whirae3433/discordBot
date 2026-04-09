import { useCallback, useEffect, useMemo, useState } from 'react';
import { DEATH_TIMER_DURATION_MS } from '../constants/timerConstants';

export function useDeathTimers(roomId, nowTick) {
  const [deathTimers, setDeathTimers] = useState({});
  const [loaded, setLoaded] = useState(false);

  const storageKey = useMemo(() => `deathTimers:${roomId}`, [roomId]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);

      if (!raw) {
        setDeathTimers({});
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw);
      const now = Date.now();

      const cleaned = Object.fromEntries(
        Object.entries(parsed).filter(([, value]) => value?.endsAt > now),
      );

      setDeathTimers(cleaned);
      setLoaded(true);
    } catch (error) {
      console.error('death timer load failed:', error);
      setDeathTimers({});
      setLoaded(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(deathTimers));
    } catch (error) {
      console.error('death timer save failed:', error);
    }
  }, [deathTimers, storageKey, loaded]);

  useEffect(() => {
    setDeathTimers((prev) => {
      const now = Date.now();
      let changed = false;
      const next = {};

      for (const [itemId, value] of Object.entries(prev)) {
        if (value?.endsAt > now) {
          next[itemId] = value;
        } else {
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, [nowTick]);

  const toggleDeathTimer = useCallback((itemId) => {
    setDeathTimers((prev) => {
      const current = prev[itemId];
      const now = Date.now();

      if (current?.endsAt && current.endsAt > now) {
        const next = { ...prev };
        delete next[itemId];
        return next;
      }

      return {
        ...prev,
        [itemId]: {
          endsAt: now + DEATH_TIMER_DURATION_MS,
        },
      };
    });
  }, []);

  const clearDeathTimersByItemIds = useCallback((itemIds) => {
    if (!Array.isArray(itemIds) || itemIds.length === 0) return;

    setDeathTimers((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const itemId of itemIds) {
        if (next[itemId]) {
          delete next[itemId];
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, []);

  return {
    deathTimers,
    toggleDeathTimer,
    clearDeathTimersByItemIds,
  };
}