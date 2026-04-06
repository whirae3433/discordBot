import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineSound } from 'react-icons/ai';
import { IoVolumeMuteOutline } from 'react-icons/io5';
import { TbRepeat, TbRepeatOff } from 'react-icons/tb';

function formatSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function MiniTimer({ item, onClick }) {
  const isDanger = item.running && item.remainingSec <= 10;

  return (
    <button
      onClick={onClick}
      className={`h-10 rounded-xl border px-3 flex items-center gap-2 transition ${
        isDanger
          ? 'border-red-500 text-red-400 animate-pulse'
          : 'border-zinc-700 text-zinc-100'
      }`}
    >
      <span className="text-sm font-bold">{item.title || item.name}</span>
      <span className="text-sm">{formatSec(item.remainingSec)}</span>
    </button>
  );
}

export default function TopActions({
  onReset,
  resetDisabled = false,
  onPrimary,
  primaryLabel,
  primaryDisabled = false,
  volume = 0.8,
  onChangeVolume,
  extraTimers = [],
  onClickExtra,
  autoRepeatEnabled = false,
  onToggleAutoRepeat,
  showAutoRepeat = false,
}) {
  const [openVolume, setOpenVolume] = useState(false);
  const isMuted = volume <= 0;
  const volumeRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!volumeRef.current?.contains(e.target)) {
        setOpenVolume(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          onClick={resetDisabled ? undefined : onReset}
          disabled={resetDisabled}
          className={`h-10 rounded-xl border px-4 ${
            resetDisabled ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          리셋
        </button>

        <button
          onClick={primaryDisabled ? undefined : onPrimary}
          disabled={primaryDisabled}
          className={`h-10 rounded-xl border px-4 ${
            primaryDisabled ? 'opacity-40 cursor-not-allowed' : ''
          }`}
        >
          {primaryLabel}
        </button>

        <div className="relative" ref={volumeRef}>
          <button
            onClick={() => setOpenVolume((v) => !v)}
            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition ${
              isMuted
                ? 'border-red-400 text-red-400'
                : 'border-emerald-400 text-emerald-400'
            }`}
            title={isMuted ? '음소거' : '볼륨 조절'}
          >
            {isMuted ? (
              <IoVolumeMuteOutline className="text-lg" />
            ) : (
              <AiOutlineSound className="text-lg" />
            )}
          </button>

          {openVolume && (
            <div className="absolute left-0 top-12 z-20 w-40 rounded-xl border border-zinc-700 bg-zinc-900 p-3 shadow-xl">
              <div className="mb-2 text-xs text-zinc-400">
                볼륨: {Math.round(volume * 100)}%
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => onChangeVolume(Number(e.target.value) / 100)}
                className="w-full"
              />
            </div>
          )}
        </div>

        {showAutoRepeat && (
          <button
            onClick={onToggleAutoRepeat}
            className={`h-10 px-3 flex items-center justify-center rounded-xl border transition ${
              autoRepeatEnabled
                ? 'border-emerald-400 text-emerald-400'
                : 'border-white text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {autoRepeatEnabled ? (
              <TbRepeat className="text-lg" />
            ) : (
              <TbRepeatOff className="text-lg" />
            )}
          </button>
        )}
      </div>

      {!!extraTimers.length && (
        <div className="flex gap-2">
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
