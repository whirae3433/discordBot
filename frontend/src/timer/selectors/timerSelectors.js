import { TIMER_SETS } from '../constants';

export function calcRemainingSec({ running, endsAtMs }, nowMs) {
  if (!running || !endsAtMs) return 0;
  return Math.max(0, (endsAtMs - nowMs) / 1000);
}

export function calcPeriodicRemainingSec(startedAtMs, durationSec, nowMs) {
  const periodMs = Number(durationSec || 0) * 1000;

  if (!startedAtMs || periodMs <= 0) return 0;

  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const phaseMs = elapsedMs % periodMs;
  const remainingMs =
    phaseMs === 0 && elapsedMs > 0 ? periodMs : periodMs - phaseMs;

  return remainingMs / 1000;
}

export function getPeriodicEndsAtMs(startedAtMs, durationSec, nowMs) {
  const periodMs = Number(durationSec || 0) * 1000;

  if (!startedAtMs || periodMs <= 0) return null;

  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const cyclesPassed = Math.floor(elapsedMs / periodMs);
  return startedAtMs + (cyclesPassed + 1) * periodMs;
}

export function mapServerItemToWatch(serverItem, nowMs, autoRepeatBySet = {}) {
  const startedAtMs = serverItem.startedAt
    ? new Date(serverItem.startedAt).getTime()
    : null;

  const originalEndsAtMs = serverItem.endsAt
    ? new Date(serverItem.endsAt).getTime()
    : null;

  const running = !!serverItem.running;
  const durationSec = Number(serverItem.durationSec ?? 0);

  const isSmokeAutoRepeat =
    serverItem.setKey === 't2' &&
    !!autoRepeatBySet?.t2 &&
    running &&
    !!startedAtMs &&
    durationSec > 0;

  const endsAtMs = isSmokeAutoRepeat
    ? getPeriodicEndsAtMs(startedAtMs, durationSec, nowMs)
    : originalEndsAtMs;

  const remainingSec = isSmokeAutoRepeat
    ? calcPeriodicRemainingSec(startedAtMs, durationSec, nowMs)
    : calcRemainingSec({ running, endsAtMs }, nowMs);

  return {
    id: serverItem.id,
    setKey: serverItem.setKey,
    title: serverItem.title,
    running,
    startedAtMs,
    endsAtMs,
    durationSec,
    remainingSec,
  };
}

export function mapMini(serverItem, nowMs, autoRepeatBySet = {}) {
  return mapServerItemToWatch(serverItem, nowMs, autoRepeatBySet);
}

export function getTimerSet(selectedKey) {
  return TIMER_SETS.find((s) => s.key === selectedKey);
}

export function getViewItems(items, nowTick, deathTimers = {}) {
  const safeItems = Array.isArray(items) ? items : [];

  return safeItems.map((item) => {
    const remainingSec = item.running
      ? Math.max(0, Math.ceil(item.remainingSec ?? 0))
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
    .map((it) => mapServerItemToWatch(it, nowMs, roomState.autoRepeatBySet));
}

export function getExtraTimers(roomState, selectedKey, nowMs, myRole) {
  if (myRole !== 'owner') return [];
  if (selectedKey !== 't1') return [];
  if (!roomState?.items?.length) return [];

  const smoke = roomState.items
    .filter((x) => x.setKey === 't2')
    .map((x) => mapMini(x, nowMs, roomState.autoRepeatBySet));

  const gongban = roomState.items
    .filter((x) => x.setKey === 't3')
    .map((x) => mapMini(x, nowMs, roomState.autoRepeatBySet));

  return [...smoke, ...gongban];
}
