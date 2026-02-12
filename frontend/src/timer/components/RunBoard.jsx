import React from 'react';
import { SLOT_GRID_COLS } from '../constants';
import TimerCard from './TimerCard';

export default function RunBoard({ timerSet, items, onClickItem, onResetItem }) {
  const { count } = timerSet;

  return (
    <div className={`grid gap-3 ${SLOT_GRID_COLS(count)}`}>
      {items.map((it) => (
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
