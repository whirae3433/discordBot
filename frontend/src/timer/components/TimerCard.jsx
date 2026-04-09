import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { FaSkullCrossbones } from 'react-icons/fa';

import {
  DEATH_TIMER_DURATION_SEC,
  DEATH_DANGER_SEC,
} from '../constants/timerConstants';

function formatMMSS(sec) {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export default function TimerCard({
  item,
  onClick,
  onReset,
  onToggleDeathTimer,
}) {
  const isCooling = item.running && item.remainingSec > 0;
  const label = isCooling ? formatMMSS(item.remainingSec) : 'READY';
  const isDanger = isCooling && item.remainingSec <= 10;

  const isDeathRunning = item.deathRunning && item.deathRemainingSec > 0;
  const deathLabel = isDeathRunning
    ? formatMMSS(item.deathRemainingSec)
    : formatMMSS(DEATH_TIMER_DURATION_SEC);

  const isDeathDanger =
    isDeathRunning && item.deathRemainingSec <= DEATH_DANGER_SEC;

  return (
    <div
      className={[
        'relative group rounded-2xl p-4 transition border bg-zinc-900',
        isCooling ? 'border-zinc-700' : 'border-emerald-400',
        isDanger ? 'animate-pulse' : '',
      ].join(' ')}
    >
      {/* 우상단 X 버튼 */}
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

      {/* 메인 타이머 */}
      <button
        onClick={() => {
          if (isCooling) return;
          onClick();
        }}
        className={`w-full text-left ${isCooling ? 'cursor-not-allowed opacity-60' : ''}`}
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

      {/* 우하단 death 타이머 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleDeathTimer();
        }}
        className={[
          'absolute bottom-3 right-3 flex items-center gap-2 rounded-lg px-2 py-1 text-xs border transition',
          isDeathRunning
            ? isDeathDanger
              ? 'animate-siren'
              : 'bg-red-500/20 text-red-300 border-red-400/40'
            : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-zinc-200',
        ].join(' ')}
      >
        <FaSkullCrossbones className="text-sm" />
        <span>{deathLabel}</span>
      </button>
    </div>
  );
}
