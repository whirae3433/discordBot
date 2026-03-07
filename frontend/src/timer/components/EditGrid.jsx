import React, { useMemo } from 'react';
import { SLOT_GRID_COLS } from '../constants';
import { clampMinuteStr, useEditGrid } from '../hooks/useEditGrid';

function isFilled(slot, timeMode) {
  const nameOk = String(slot?.name || '').trim().length > 0;

  if (timeMode === 'minute-input') return nameOk && Number(slot?.minute) > 0;
  if (timeMode === 'sec-input') return nameOk && Number(slot?.sec) > 0;
  return nameOk; // fixed-sec or others
}

export default function EditGrid({ timerSet, slots, setSlotValue }) {
  const { count, timeMode, defaultMinute, fixedSec, defaultSec } = timerSet;
  const { refs, handleKeyDown } = useEditGrid({ count, timeMode });

  const filledCount = useMemo(
    () => (slots || []).filter((s) => isFilled(s, timeMode)).length,
    [slots, timeMode],
  );

  return (
    <>
      <div className={`grid gap-3 ${SLOT_GRID_COLS(count)}`}>
        {(slots || []).map((slot, index) => (
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
              placeholder="예: 이케아"
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
                  placeholder={String(defaultMinute ?? 0)}
                  className="w-full rounded-lg px-3 py-2 bg-zinc-950/40 border border-zinc-700
                             outline-none focus:border-zinc-300 text-sm text-zinc-100 placeholder:text-zinc-500"
                />
              </>
            )}

            {timeMode === 'sec-input' && (
              <>
                <div className="text-xs text-zinc-400 mt-3 mb-1">
                  타이머 (초)
                </div>
                <input
                  ref={(el) => {
                    refs.current[index] = refs.current[index] || {};
                    refs.current[index].sec = el;
                  }}
                  value={slot.sec}
                  onChange={(e) =>
                    setSlotValue(
                      index,
                      'sec',
                      e.target.value.replace(/[^\d]/g, ''),
                    )
                  }
                  onKeyDown={(e) => handleKeyDown(e, index, 'sec')}
                  inputMode="numeric"
                  placeholder={String(defaultSec ?? 0)}
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
