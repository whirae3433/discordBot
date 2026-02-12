import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimerCard({ item, onClick, onReset }) {
  const isReady =
    !item.running && (item.durationSec === 0 || item.remainingSec === 0);

  const label = isReady ? 'READY' : formatMMSS(item.remainingSec);
  const isDanger = item.running && item.remainingSec <= 10;

  return (
    <div
      className={[
        'relative group rounded-2xl border p-4 transition',
        item.running
          ? 'border-emerald-400 bg-zinc-900'
          : 'border-zinc-700 bg-zinc-900',
        isDanger ? 'animate-pulse border-red-400' : '',
      ].join(' ')}
    >
      {/* 🔥 X 버튼 */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // 카드 클릭 방지
          onReset();
        }}
        className={`absolute top-2 right-2 transition text-xl
  ${
    item.running
      ? 'text-red-400 opacity-100'
      : 'text-zinc-500 opacity-0 group-hover:opacity-100'
  }
`}
      >
        <MdOutlineCancel />
      </button>

      {/* 카드 클릭 영역 */}
      <button onClick={onClick} className="w-full text-left">
        <div className="font-bold text-lg leading-tight">{item.name}</div>

        <div className="mt-2 text-sm text-zinc-400">
          {formatMMSS(item.durationSec)}
        </div>

        <div
          className={[
            'mt-4 text-2xl font-extrabold tracking-wide',
            isReady ? 'text-emerald-400' : 'text-zinc-100',
          ].join(' ')}
        >
          {label}
        </div>
      </button>
    </div>
  );
}
