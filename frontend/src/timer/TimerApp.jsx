import React, {
  useMemo,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from './socket';
import { APP_SHELL } from './constants';

import RunBoard from './components/RunBoard';
import TopActions from './components/TopActions';
import TimerAppHeader from './components/TimerAppHeader';
import RoomClosedModal from './components/RoomClosedModal';

import { useElectronHotKey } from './hooks/useElectronHotKey';
import { useTimerRoomSocket } from './hooks/useTimerRoomSocket';
import { useTimerItemsView } from './hooks/useTimerItemsView';
import { useTimerApi } from './hooks/useTimerApi';
import { useRoomClosed } from './hooks/useRoomClosed';
import { useNowTick } from './hooks/useNowTick';
import { useTimerPermissions } from './hooks/useTimerPermissions';
import { useTimerActions } from './hooks/useTimerActions';
import { useSmokeAutoRepeat } from './hooks/useSmokeAutoRepeat';
import { useSmokeDangerBeep } from './hooks/useSmokeDangerBeep';

import {
  getTimerSet,
  getViewItems,
  getSmokeWatchItems,
  getExtraTimers,
} from './selectors/timerSelectors';
import { useDeathTimers } from './hooks/useDeathTimers';

export default function TimerApp({ myRole = 'member' }) {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { roomClosed, clearRoomClosed } = useRoomClosed(roomId);
  const nowTick = useNowTick(250);

  const [selectedKey, setSelectedKey] = useState(
    myRole === 'owner' ? 't1' : 't2',
  );
  const [hotkeyEnabled, setHotkeyEnabled] = useState(false);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('timer_volume');
    return saved != null ? Number(saved) : 0.8;
  });
  const [resetting, setResetting] = useState(false);

  const isMuted = volume <= 0;

  useEffect(() => {
    localStorage.setItem('timer_volume', String(volume));
  }, [volume]);

  const { canAccessSet, visibleSetKeys, visibleSets, canManageSelectedSet } =
    useTimerPermissions(myRole, selectedKey);

  useEffect(() => {
    if (!visibleSetKeys.includes(selectedKey) && visibleSetKeys.length > 0) {
      setSelectedKey(visibleSetKeys[0]);
    }
  }, [selectedKey, visibleSetKeys]);

  useEffect(() => {
    if (roomId) {
      localStorage.setItem('currentTimerRoomId', roomId);
    }
  }, [roomId]);

  const { roomState } = useTimerRoomSocket({ socket, roomId });
  const { items } = useTimerItemsView({ roomState, selectedKey });
  const { startItem, stopItem, setAutoRepeat } = useTimerApi();
  const { deathTimers, toggleDeathTimer, clearDeathTimersByItemIds } =
    useDeathTimers(roomId, nowTick);

  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const timerSet = useMemo(() => getTimerSet(selectedKey), [selectedKey]);

  const viewItems = useMemo(
    () => getViewItems(items, nowTick, deathTimers),
    [items, nowTick, deathTimers],
  );

  const smokeWatchItems = useMemo(
    () => getSmokeWatchItems(roomState, nowTick),
    [roomState, nowTick],
  );
  const extraTimers = useMemo(
    () => getExtraTimers(roomState, selectedKey, nowTick, myRole),
    [roomState, selectedKey, nowTick, myRole],
  );

  const autoRepeatEnabled = !!roomState?.autoRepeatBySet?.t2;

  useSmokeAutoRepeat({
    enabled: autoRepeatEnabled,
    items: smokeWatchItems,
    startItem,
  });

  useSmokeDangerBeep({
    items: smokeWatchItems,
    volume,
    muted: isMuted,
  });

  const {
    onServerToggle,
    onServerStop,
    onResetCurrentSet,
    onOpenSettings,
    onDeleteRoom,
    onConfirmRoomClosed,
  } = useTimerActions({
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
    clearDeathTimersByItemIds,
  });

  const onGlobalTrigger = useCallback(() => {
    const current = itemsRef.current || [];
    if (!current.length) return;
    onServerToggle(current[0].id);
  }, [onServerToggle]);

  const onExitLobby = useCallback(() => {
    if (window.confirm('로비로 나가시겠습니까?')) {
      localStorage.removeItem('currentTimerRoomId');
      navigate('/timer');
    }
  }, [navigate]);

  useElectronHotKey({
    enabled: hotkeyEnabled,
    onTrigger: onGlobalTrigger,
  });

  return (
    <>
      <div className={APP_SHELL}>
        <div className="max-w-5xl mx-auto">
          <TimerAppHeader
            roomTitle={roomState?.name}
            myRole={myRole}
            visibleSets={visibleSets}
            selectedKey={selectedKey}
            onSelectSet={setSelectedKey}
            onExitLobby={onExitLobby}
            onDeleteRoom={onDeleteRoom}
            hotkeyEnabled={hotkeyEnabled}
            setHotkeyEnabled={setHotkeyEnabled}
          />

          <TopActions
            onReset={onResetCurrentSet}
            resetDisabled={!canManageSelectedSet || resetting}
            onPrimary={onOpenSettings}
            primaryLabel="세팅"
            primaryDisabled={!canManageSelectedSet}
            volume={volume}
            onChangeVolume={setVolume}
            extraTimers={extraTimers}
            onClickExtra={onServerToggle}
            autoRepeatEnabled={autoRepeatEnabled}
            onToggleAutoRepeat={() =>
              setAutoRepeat({
                roomId,
                setKey: 't2',
                autoRepeat: !autoRepeatEnabled,
              })
            }
            showAutoRepeat={selectedKey === 't2'}
          />

          <RunBoard
            timerSet={timerSet}
            items={viewItems}
            onClickItem={onServerToggle}
            onResetItem={onServerStop}
            onToggleDeathTimer={toggleDeathTimer}
          />
        </div>
      </div>

      <RoomClosedModal open={roomClosed} onConfirm={onConfirmRoomClosed} />
    </>
  );
}
