import { useCallback } from 'react';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

function isActuallyCooling(target) {
  if (!target?.running) return false;
  if (!target?.endsAt) return false;

  const endsAtMs = new Date(target.endsAt).getTime();
  return endsAtMs > Date.now();
}

export function useTimerActions({
  myRole,
  roomId,
  roomState,
  selectedKey,
  canAccessSet,
  startItem,
  stopItem,
  navigate,
  clearRoomClosed,
  setResetting,
}) {
  const onServerToggle = useCallback(
    async (itemId) => {
      const target = roomState?.items?.find(
        (x) => String(x.id) === String(itemId),
      );
      if (!target) return;
      if (!canAccessSet(target.setKey)) return;

      const cooling = isActuallyCooling(target);

      if (cooling) await stopItem(itemId);
      else await startItem(itemId);
    },
    [roomState, startItem, stopItem, canAccessSet],
  );

  const onServerStop = useCallback(
    async (itemId) => {
      const target = roomState?.items?.find(
        (x) => String(x.id) === String(itemId),
      );
      if (!target) return;
      if (!canAccessSet(target.setKey)) return;

      await stopItem(itemId);
    },
    [roomState, stopItem, canAccessSet],
  );

  const onResetCurrentSet = useCallback(async () => {
    if (!canAccessSet(selectedKey)) return;
    if (!roomState?.items?.length) return;

    const ok = window.confirm('리셋하시겠습니까?');
    if (!ok) return;

    try {
      setResetting(true);

      const runningItems = roomState.items.filter(
        (it) => it.setKey === selectedKey && isActuallyCooling(it),
      );

      await Promise.all(runningItems.map((it) => stopItem(it.id)));
    } catch (e) {
      console.error('세트 리셋 실패:', e);
    } finally {
      setResetting(false);
    }
  }, [canAccessSet, selectedKey, roomState, stopItem, setResetting]);

  const onOpenSettings = useCallback(() => {
    if (!canAccessSet(selectedKey)) return;

    const ok = window.confirm('세팅 페이지로 이동하시겠습니까?');
    if (!ok) return;
    
    navigate(`/timer/room/${roomId}/edit?setKey=${selectedKey}`);
  }, [canAccessSet, selectedKey, navigate, roomId]);

  const onDeleteRoom = useCallback(async () => {
    if (myRole !== 'owner') return;

    const ok = window.confirm('방을 삭제하시겠습니까?');
    if (!ok) return;

    try {
      const res = await fetch(`${API_BASE}/timer/rooms/${roomId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || '방 삭제 실패');
      }
    } catch (e) {
      alert(e?.message || '방 삭제 실패');
    }
  }, [myRole, roomId]);

  const onConfirmRoomClosed = useCallback(() => {
    clearRoomClosed();
    navigate('/timer', { replace: true });
  }, [clearRoomClosed, navigate]);

  return {
    onServerToggle,
    onServerStop,
    onResetCurrentSet,
    onOpenSettings,
    onDeleteRoom,
    onConfirmRoomClosed,
  };
}
