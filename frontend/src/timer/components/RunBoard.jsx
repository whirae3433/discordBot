import React from 'react';
import { SLOT_GRID_COLS } from '../constants';
import TimerCard from './TimerCard';

export default function RunBoard({
  timerSet,
  items,
  onClickItem,
  onResetItem,
}) {
  const { count } = timerSet;

  return (
    <div className={`grid gap-3 ${SLOT_GRID_COLS(count)}`}>
      {(items || [])
        .slice() // 원본 보호
        .sort((a, b) => {
          // 1. READY 먼저 (running 아닌 애들)
          if (a.running !== b.running) {
            return a.running ? 1 : -1;
          }

          // 2. 둘 다 running이면 쿨타임 짧은 순
          return a.remainingSec - b.remainingSec;
        })

        .map((it) => (
          <TimerCard
            key={it.id}
            item={it}
            onClick={() => onClickItem(it.id)}
            onReset={() => onResetItem(it.id)}
          />
        ))}
    </div>
  );
}
