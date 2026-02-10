import React from 'react';

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimerCard({ item, onClick }) {
  const isReady =
    !item.running && (item.durationSec === 0 || item.remainingSec === 0);

  const label = isReady ? 'READY' : formatMMSS(item.remainingSec);

  return (
    <button
      onClick={onClick}
      className={[
        'rounded-2xl border p-4 text-left transition',
        'hover:bg-zinc-800',
        item.running ? 'border-emerald-400 bg-zinc-900' : 'border-zinc-700 bg-zinc-900',
      ].join(' ')}
    >
      <div className="font-bold text-lg leading-tight">{item.name}</div>

      <div className="mt-2 text-sm text-zinc-400">{formatMMSS(item.durationSec)}</div>

      <div
        className={[
          'mt-4 text-2xl font-extrabold tracking-wide',
          isReady ? 'text-emerald-400' : 'text-zinc-100',
        ].join(' ')}
      >
        {label}
      </div>
    </button>
  );
}