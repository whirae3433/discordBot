import React from 'react';
import { AiOutlineSound } from 'react-icons/ai';
import { IoVolumeMuteOutline } from 'react-icons/io5';

function formatSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function MiniTimer({ item, onClick }) {
  const running = item.running;
  const remaining = item.remainingSec;

  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-xl border px-3 flex items-center gap-2 transition
        ${running ? 'border-zinc-500' : 'border-zinc-700 hover:bg-white/5'}`}
      title={item.title}
    >
      <span className="text-sm font-bold">{item.title}</span>
      <span
        className={`text-sm tabular-nums ${
          running ? 'text-zinc-100' : 'text-zinc-400'
        }`}
      >
        {formatSec(remaining)}
      </span>
    </button>
  );
}

export default function TopActions({
  mode,
  onReset,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  muted,
  onToggleMute,
  extraTimers = [],
  onClickExtra,
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      {/* 좌측: 기존 액션 버튼 */}
      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          className="h-10 rounded-xl border border-zinc-700 px-4 hover:bg-white/5 transition"
        >
          리셋
        </button>

        <button
          onClick={primaryDisabled ? undefined : onPrimary} // 클릭 막기
          disabled={primaryDisabled} // 버튼 disable
          className={`h-10 rounded-xl border px-4 transition
            ${
              primaryDisabled
                ? 'border-zinc-800 text-zinc-500 bg-zinc-950/40 cursor-not-allowed'
                : 'border-zinc-700 hover:bg-white/5'
            }`}
        >
          {primaryLabel}
        </button>

        <button
          onClick={onToggleMute}
          className={`h-10 rounded-xl border px-4 transition
            ${
              muted
                ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                : 'border-green-500 text-green-400 hover:bg-green-500/10'
            }`}
          title={muted ? '음소거' : '소리 켜짐'}
        >
          {muted ? <IoVolumeMuteOutline /> : <AiOutlineSound />}
        </button>
      </div>

      {/* 우측: 미니 타이머 */}
      {!!extraTimers.length && (
        <div className="flex items-center gap-2">
          {extraTimers.map((it) => (
            <MiniTimer
              key={it.id}
              item={it}
              onClick={() => onClickExtra?.(it.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}