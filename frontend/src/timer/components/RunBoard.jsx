import React from 'react';
import { SLOT_GRID_COLS } from '../constants';
import TimerCard from './TimerCard';

export default function RunBoard({ timerSet, items, onClickItem, onResetAll, onBack }) {
  const { count, label } = timerSet;

  return (
    <>
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-bold">{label} 실행</div>
          <div className="text-sm text-zinc-400">
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onResetAll}
            className="rounded-xl border border-zinc-700 px-4 py-2 hover:bg-white/5 transition"
          >
            전체리셋
          </button>
          <button
            onClick={onBack}
            className="rounded-xl bg-zinc-100 text-zinc-900 px-4 py-2 font-bold hover:bg-white transition"
          >
            세팅으로
          </button>
        </div>
      </div>

      <div className={`grid gap-3 ${SLOT_GRID_COLS(count)}`}>
        {items.map((it) => (
          <TimerCard key={it.id} item={it} onClick={() => onClickItem(it.id)} />
        ))}
      </div>
    </>
  );
}