import React, { useMemo } from 'react';
import { SLOT_GRID_COLS } from '../constants';
import { clampMinuteStr, useEditGrid } from '../hooks/useEditGrid';

export default function EditGrid({
  timerSet,
  slots,
  setSlotValue,
  onStart,
  onReset,
}) {
  const { count, timeMode, defaultMinute, fixedSec } = timerSet;
  const { refs, handleKeyDown } = useEditGrid({ count, timeMode });

  const filledCount = useMemo(() => {
    if (timeMode === 'minute-input') {
      return slots.filter((s) => String(s.name).trim() && Number(s.minute) > 0)
        .length;
    }
    return slots.filter((s) => String(s.name).trim()).length;
  }, [slots, timeMode]);

  return (
    <>
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-bold">{timerSet.label} 세팅</div>
          <div className="text-sm text-zinc-400">
            {timeMode === 'minute-input'
              ? `총 ${count}개 · 기본 ${defaultMinute}분 (분 수정 가능)`
              : `총 ${count}개 · 고정 ${Math.floor(fixedSec)}초`}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-white/5 transition"
          >
            초기화
          </button>
          <button
            onClick={onStart}
            className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 font-bold hover:bg-white transition"
          >
            실행
          </button>
        </div>
      </div>

      <div className={`grid gap-3 ${SLOT_GRID_COLS(count)}`}>
        {slots.map((slot, index) => (
          <div
            key={slot.id}
            className="rounded-xl border border-zinc-700 bg-zinc-900 p-3"
          >
            <div className="text-xs text-zinc-400 mb-1">닉네임</div>
            <input
              ref={(el) => {
                refs.current[index] = refs.current[index] || {};
                refs.current[index].name = el;
              }}
              value={slot.name}
              onChange={(e) => setSlotValue(index, 'name', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, index, 'name')}
              placeholder="예: 무영"
              className="w-full rounded-lg px-3 py-2 bg-zinc-950/40 border border-zinc-700
                         outline-none focus:border-zinc-300 text-sm text-zinc-100 placeholder:text-zinc-500"
            />

            {timeMode === 'minute-input' && (
              <>
                <div className="text-xs text-zinc-400 mt-3 mb-1">
                  타이머 (분)
                </div>
                <input
                  ref={(el) => {
                    refs.current[index] = refs.current[index] || {};
                    refs.current[index].minute = el;
                  }}
                  value={slot.minute}
                  onChange={(e) =>
                    setSlotValue(
                      index,
                      'minute',
                      clampMinuteStr(e.target.value),
                    )
                  }
                  onKeyDown={(e) => handleKeyDown(e, index, 'minute')}
                  inputMode="numeric"
                  placeholder={String(defaultMinute)}
                  className="w-full rounded-lg px-3 py-2 bg-zinc-950/40 border border-zinc-700
                             outline-none focus:border-zinc-300 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
              </>
            )}

            {timeMode === 'fixed-sec' && (
              <div className="mt-3 text-sm text-zinc-400">
                고정:{' '}
                <span className="text-zinc-100 font-bold">{fixedSec}s</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-zinc-400">
        입력완료: <span className="font-bold text-zinc-100">{filledCount}</span>{' '}
        / {count}
      </div>
    </>
  );
}
