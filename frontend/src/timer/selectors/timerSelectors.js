import { TIMER_SETS } from '../constants';

export function calcRemainingSec({ running, endsAtMs, durationSec }, nowMs) {
  if (!running || !endsAtMs) return durationSec ?? 0;
  return Math.max(0, (endsAtMs - nowMs) / 1000);
}

export function mapServerItemToWatch(serverItem, nowMs) {
  const endsAtMs = serverItem.endsAt
    ? new Date(serverItem.endsAt).getTime()
    : null;

  return {
    id: serverItem.id,
    setKey: serverItem.setKey,
    title: serverItem.title,
    running: !!serverItem.running,
    endsAtMs,
    durationSec: serverItem.durationSec ?? 0,
    remainingSec: calcRemainingSec(
      {
        running: !!serverItem.running,
        endsAtMs,
        durationSec: serverItem.durationSec ?? 0,
      },
      nowMs,
    ),
  };
}

export function mapMini(serverItem, nowMs) {
  return mapServerItemToWatch(serverItem, nowMs);
}

export function getTimerSet(selectedKey) {
  return TIMER_SETS.find((s) => s.key === selectedKey);
}

export function getViewItems(items, nowTick, deathTimers = {}) {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems.map((item) => {
    const remainingMs = item.endsAtMs ? item.endsAtMs - nowTick : 0;
    const remainingSec = item.running
      ? Math.max(0, Math.ceil(remainingMs / 1000))
      : 0;

    const death = deathTimers[item.id];
    const deathRemainingSec = death?.endsAt
      ? Math.max(0, Math.floor((death.endsAt - nowTick) / 1000))
      : 0;

    return {
      ...item,
      remainingSec,
      deathRunning: deathRemainingSec > 0,
      deathRemainingSec,
    };
  });
}

export function getSmokeWatchItems(roomState, nowMs) {
  if (!roomState?.items?.length) return [];

  return roomState.items
    .filter((it) => it.setKey === 't2')
    .map((it) => mapServerItemToWatch(it, nowMs));
}

export function getExtraTimers(roomState, selectedKey, nowMs, myRole) {
  if (myRole !== 'owner') return [];
  if (selectedKey !== 't1') return [];
  if (!roomState?.items?.length) return [];

  const smoke = roomState.items
    .filter((x) => x.setKey === 't2')
    .map((x) => mapMini(x, nowMs));

  const gongban = roomState.items
    .filter((x) => x.setKey === 't3')
    .map((x) => mapMini(x, nowMs));

  return [...smoke, ...gongban];
}
