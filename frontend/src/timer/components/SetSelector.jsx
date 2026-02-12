import React from 'react';
import { TIMER_SETS } from '../constants';

export default function SetSelector({ selectedKey, onSelect }) {
  return (
    <div className="flex gap-2">
      {TIMER_SETS.map((s) => (
        <button
          key={s.key}
          onClick={() => onSelect(s.key)}
          className={[
            'rounded-xl border px-4 py-2 font-bold transition',
            selectedKey === s.key
              ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800',
          ].join(' ')}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}