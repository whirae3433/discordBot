import React, { useMemo, useState, useCallback } from 'react';
import { APP_SHELL, TIMER_SETS } from './constants';
import SetSelector from './components/SetSelector';
import EditGrid from './components/EditGrid';
import RunBoard from './components/RunBoard';
import HotkeySetting from './HotKeySetting';
import TopActions from './components/TopActions';

import { makeSlotsForSet, buildRunItems } from './utils/timerFactory';
import { useRunTimers } from './hooks/useRunTimers';
import { useElectronHotKey } from './hooks/useElectronHotKey';

export default function TimerApp() {
  const [selectedKey, setSelectedKey] = useState('t1');
  const [hotkeyEnabled, setHotkeyEnabled] = useState(false);
  const [muted, setMuted] = useState(false);

  const timerSet = useMemo(
    () => TIMER_SETS.find((s) => s.key === selectedKey),
    [selectedKey],
  );

  const [mode, setMode] = useState('edit'); // edit | run

  const [slotsBySet, setSlotsBySet] = useState(() => {
    const obj = {};
    for (const s of TIMER_SETS) obj[s.key] = makeSlotsForSet(s);
    return obj;
  });

  const slots = slotsBySet[selectedKey];

  const { items, setItems, clickItem, resetAll, resetItem, itemsRef } =
    useRunTimers({ enabled: mode === 'run', muted });

  const onGlobalTrigger = useCallback(() => {
    if (mode !== 'run') return;
    const current = itemsRef.current || [];
    if (!current.length) return;
    clickItem(current[0].id, 'hotkey');
  }, [mode, clickItem, itemsRef]);

  useElectronHotKey({
    enabled: mode === 'run' && hotkeyEnabled,
    onTrigger: onGlobalTrigger,
  });

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

  const onStart = () => {
    setItems(buildRunItems(timerSet, slots));
    setMode('run');
  };

  const onBack = () => {
    setMode('edit');
    setItems([]);
  };

  const onSelectSet = (key) => {
    setSelectedKey(key);
    setMode('edit');
    setItems([]);
  };

  // ✅ 공용 액션바 핸들러 결정
  const actionReset = mode === 'edit' ? onResetCurrent : resetAll;
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
          </div>

          <div className="shrink-0">
            <HotkeySetting
              active={mode === 'run'}
              enabled={hotkeyEnabled}
              setEnabled={setHotkeyEnabled}
            />
          </div>
        </div>

        {/* ✅ 여기서 공용 버튼 */}
        <TopActions
          mode={mode}
          onReset={actionReset}
          onPrimary={actionPrimary}
          primaryLabel={primaryLabel}
          muted={muted}
          onToggleMute={() => setMuted((v) => !v)}
        />

        {/* 본문 */}
        {mode === 'edit' ? (
          <EditGrid
            timerSet={timerSet}
            slots={slots}
            setSlotValue={setSlotValue}
          />
        ) : (
          <RunBoard
            timerSet={timerSet}
            items={items}
            onClickItem={(id) => clickItem(id, 'mouse')}
            onResetItem={resetItem}
          />
        )}
      </div>
    </div>
  );
}
