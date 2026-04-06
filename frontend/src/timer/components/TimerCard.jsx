import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimerCard({ item, onClick, onReset }) {
  const isCooling = item.running && item.remainingSec > 0;
  const label = isCooling ? formatMMSS(item.remainingSec) : 'READY';
  const isDanger = isCooling && item.remainingSec <= 10;

  return (
    <div
      className={[
        'relative group rounded-2xl p-4 transition border bg-zinc-900',
        isCooling ? 'border-zinc-700 opacity-60' : 'border-emerald-400',
        isDanger ? 'animate-pulse' : '',
      ].join(' ')}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReset();
        }}
        className={`absolute top-2 right-2 transition text-xl ${
          isCooling
            ? 'text-red-300 opacity-70'
            : 'text-zinc-500 opacity-0 group-hover:opacity-100'
        }`}
      >
        <MdOutlineCancel />
      </button>

      <button
        onClick={() => {
          if (isCooling) return;
          onClick();
        }}
        className={`w-full text-left ${isCooling ? 'cursor-not-allowed' : ''}`}
      >
        <div
          className={`font-bold text-lg leading-tight ${
            isCooling ? 'text-zinc-400' : 'text-zinc-100'
          }`}
        >
          {item.title}
        </div>

        <div className="mt-2 text-sm text-zinc-500">
          {formatMMSS(item.durationSec)}
        </div>

        <div
          className={[
            'mt-4 text-2xl font-extrabold tracking-wide',
            isCooling ? 'text-zinc-300' : 'text-emerald-400',
          ].join(' ')}
        >
          {label}
        </div>
      </button>
    </div>
  );
}
