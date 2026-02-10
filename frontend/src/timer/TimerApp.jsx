import React, { useMemo, useState, useCallback } from 'react';
import { APP_SHELL, TIMER_SETS } from './constants';
import SetSelector from './components/SetSelector';
import EditGrid from './components/EditGrid';
import RunBoard from './components/RunBoard';
import HotkeySetting from './HotKeySetting';

import { makeSlotsForSet, buildRunItems } from './utils/timerFactory';
import { useRunTimers } from './hooks/useRunTimers';
import { useElectronHotKey } from './hooks/useElectronHotKey';

export default function TimerApp() {
  const [selectedKey, setSelectedKey] = useState('t1');

  const timerSet = useMemo(
    () => TIMER_SETS.find((s) => s.key === selectedKey),
    [selectedKey],
  );

  const [mode, setMode] = useState('edit'); // edit | run

  // 세트별 슬롯 저장
  const [slotsBySet, setSlotsBySet] = useState(() => {
    const obj = {};
    for (const s of TIMER_SETS) obj[s.key] = makeSlotsForSet(s);
    return obj;
  });

  const slots = slotsBySet[selectedKey];

  // 실행 엔진 훅
  const { items, setItems, clickItem, resetAll, itemsRef } = useRunTimers({
    enabled: mode === 'run',
  });

  // 글로벌키 트리거 동작: 맨 앞 카드 실행
  const onGlobalTrigger = useCallback(() => {
    if (mode !== 'run') return;
    const current = itemsRef.current || [];
    if (!current.length) return;
    clickItem(current[0].id);
  }, [mode, clickItem, itemsRef]);

  // Electron 단축키 훅
  useElectronHotKey({
    enabled: mode === 'run',
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

  return (
    <div className={APP_SHELL}>
      <div className="max-w-5xl mx-auto">
        {/* 상단 헤더 영역: 좌(타이틀+세트) / 우(단축키) */}
        <div className="flex items-start justify-between gap-6 mb-6">
          {/* 좌측 */}
          <div>
            <h1 className="text-2xl font-bold">로나 타이머</h1>
            <div className="mt-2">
              <SetSelector selectedKey={selectedKey} onSelect={onSelectSet} />
            </div>
          </div>

          {/* 우측 */}
          <div className="shrink-0">
            <HotkeySetting active={mode === 'run'} />
          </div>
        </div>

        {/* 본문 */}
        {mode === 'edit' ? (
          <EditGrid
            timerSet={timerSet}
            slots={slots}
            setSlotValue={setSlotValue}
            onStart={onStart}
            onReset={onResetCurrent}
          />
        ) : (
          <RunBoard
            timerSet={timerSet}
            items={items}
            onClickItem={clickItem}
            onResetAll={resetAll}
            onBack={onBack}
          />
        )}
      </div>
    </div>
  );
}
