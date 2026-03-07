import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useParams } from 'react-router-dom';
import { socket } from './socket';
import { APP_SHELL, TIMER_SETS } from './constants';

import SetSelector from './components/SetSelector';
import EditGrid from './components/EditGrid';
import RunBoard from './components/RunBoard';
import HotkeySetting from './HotKeySetting';
import TopActions from './components/TopActions';

import { makeSlotsForSet } from './utils/timerFactory';
import { useElectronHotKey } from './hooks/useElectronHotKey';

import { useTimerRoomSocket } from './hooks/useTimerRoomSocket';
import { useTimerItemsView } from './hooks/useTimerItemsView';
import { buildDraftItems } from './hooks/useTimerDraft';
import { useTimerApi } from './hooks/useTimerApi';

// 공통: 남은 시간 계산
function calcRemainingSec({ running, endsAtMs, durationSec }, nowMs) {
  if (!running || !endsAtMs) return durationSec ?? 0;
  return Math.max(0, (endsAtMs - nowMs) / 1000);
}

function mapMini(serverItem, nowMs) {
  const endsAtMs = serverItem.endsAt
    ? new Date(serverItem.endsAt).getTime()
    : null;

  return {
    id: serverItem.id,
    name: serverItem.title,
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

export default function TimerApp() {
  const { roomId } = useParams();

  const [selectedKey, setSelectedKey] = useState('t1');
  const [mode, setMode] = useState('edit'); // edit | run
  const [hotkeyEnabled, setHotkeyEnabled] = useState(false);
  const [muted, setMuted] = useState(false);
  const [starting, setStarting] = useState(false);

  // 전역 tick (RunBoard + TopActions 둘 다 이걸로 흐르게)
  const [nowTick, setNowTick] = useState(Date.now());
  useEffect(() => {
    if (mode !== 'run') return;
    const t = setInterval(() => setNowTick(Date.now()), 250);
    return () => clearInterval(t);
  }, [mode]);

  // socket / room state
  const { socketConnected, roomState } = useTimerRoomSocket({ socket, roomId });

  // 현재 탭 items (서버에서 온 원본 형태: endsAt(ms), durationSec, running)
  const { items } = useTimerItemsView({ roomState, selectedKey });

  // UI에 뿌릴 items는 TimerApp에서 remainingSec을 계산해서 만든다
  const viewItems = useMemo(() => {
    const nowMs = nowTick;
    return (items || []).map((it) => ({
      ...it,
      remainingSec: calcRemainingSec(it, nowMs),
    }));
  }, [items, nowTick]);

  // itemsRef: 핫키/토글에서 최신 items 보장
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // API
  const { replaceItems, startItem, stopItem } = useTimerApi();

  // timer set / slots
  const timerSet = useMemo(
    () => TIMER_SETS.find((s) => s.key === selectedKey),
    [selectedKey],
  );

  const [slotsBySet, setSlotsBySet] = useState(() => {
    const obj = {};
    for (const s of TIMER_SETS) obj[s.key] = makeSlotsForSet(s);
    return obj;
  });
  const slots = slotsBySet[selectedKey];

  const setSlotValue = (index, field, value) => {
    setSlotsBySet((prev) => ({
      ...prev,
      [selectedKey]: prev[selectedKey].map((s, i) =>
        i === index ? { ...s, [field]: value } : s,
      ),
    }));
  };

  const onResetCurrent = () => {
    setSlotsBySet((prev) => ({
      ...prev,
      [selectedKey]: makeSlotsForSet(timerSet),
    }));
  };

  // 서버 토글/스탑
  const onServerToggle = useCallback(
    async (itemId) => {
      const target = itemsRef.current?.find((x) => x.id === itemId);
      if (!target) return;

      if (target.running) await stopItem(itemId);
      else await startItem(itemId);
    },
    [roomState, startItem, stopItem],
  );

  const onServerStop = useCallback(
    async (itemId) => {
      await stopItem(itemId);
    },
    [stopItem],
  );

  // 실행(세팅 -> 서버 replace)
  const onStart = useCallback(async () => {
    if (starting) return;
    setStarting(true);

    try {
      const { draft } = buildDraftItems(timerSet, slots);

      if (!draft.length) {
        alert('타이머가 비어있음. (닉네임/시간 입력 확인)');
        return;
      }

      await replaceItems({ roomId, setKey: selectedKey, items: draft });
      setMode('run');
    } catch (e) {
      alert(e?.message || 'replace failed');
    } finally {
      setStarting(false);
    }
  }, [starting, timerSet, slots, replaceItems, roomId, selectedKey]);

  const onBack = () => setMode('edit');

  // 세트 선택 시 slots 초기화(원하면 유지로 바꿔도 됨)
  const onSelectSet = (key) => {
    setSelectedKey(key);
    setMode('edit');

    const set = TIMER_SETS.find((s) => s.key === key);
    if (set) {
      setSlotsBySet((prev) => ({
        ...prev,
        [key]: makeSlotsForSet(set),
      }));
    }
  };

  //  리프(t1) 탭에서 연막(t2)/공반(t3) 미니 타이머 표시 + nowTick 기반으로 흐르게
  const extraTimers = useMemo(() => {
    if (selectedKey !== 't1') return [];
    if (!roomState?.items?.length) return [];

    const nowMs = nowTick;

    const smoke = roomState.items
      .filter((x) => x.setKey === 't2')
      .map((x) => mapMini(x, nowMs));

    const gongban = roomState.items
      .filter((x) => x.setKey === 't3')
      .map((x) => mapMini(x, nowMs));

    return [...smoke, ...gongban];
  }, [roomState, selectedKey, nowTick]);

  // 글로벌 핫키: 맨 앞 타이머 토글
  const onGlobalTrigger = useCallback(() => {
    if (mode !== 'run') return;
    const current = itemsRef.current || [];
    if (!current.length) return;
    onServerToggle(current[0].id);
  }, [mode, onServerToggle]);

  useElectronHotKey({
    enabled: mode === 'run' && hotkeyEnabled,
    onTrigger: onGlobalTrigger,
  });

  // TopActions
  const actionReset = mode === 'edit' ? onResetCurrent : () => {};
  const actionPrimary = mode === 'edit' ? onStart : onBack;
  const primaryLabel = mode === 'edit' ? '실행' : '세팅';

  return (
    <div className={APP_SHELL}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold">로나 타이머</h1>
            <div className="mt-2">
              <SetSelector selectedKey={selectedKey} onSelect={onSelectSet} />
            </div>
            {/* socketConnected 필요하면 여기 작은 점으로 표시해도 됨 */}
            {/* <div className="text-xs text-zinc-500 mt-1">{socketConnected ? '● online' : '● offline'}</div> */}
          </div>

          <div className="shrink-0">
            <HotkeySetting
              active={mode === 'run'}
              enabled={hotkeyEnabled}
              setEnabled={setHotkeyEnabled}
            />
          </div>
        </div>

        <TopActions
          mode={mode}
          onReset={actionReset}
          onPrimary={actionPrimary}
          primaryLabel={primaryLabel}
          primaryDisabled={mode === 'edit' && starting}
          muted={muted}
          onToggleMute={() => setMuted((v) => !v)}
          extraTimers={extraTimers}
          onClickExtra={(id) => onServerToggle(id)}
        />

        {mode === 'edit' ? (
          <EditGrid
            timerSet={timerSet}
            slots={slots}
            setSlotValue={setSlotValue}
          />
        ) : (
          <RunBoard
            timerSet={timerSet}
            items={viewItems}
            onClickItem={(id) => onServerToggle(id)}
            onResetItem={(id) => onServerStop(id)}
          />
        )}
      </div>
    </div>
  );
}
