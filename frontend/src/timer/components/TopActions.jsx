import React from 'react';
import { AiOutlineSound } from "react-icons/ai";
import { IoVolumeMuteOutline } from "react-icons/io5";

export default function TopActions({
  mode,
  onReset,
  onPrimary,
  primaryLabel,
  muted,
  onToggleMute,
}) {
  const baseBtn =
    "h-[40px] rounded-xl border px-4 flex items-center justify-center transition";

  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onReset}
        className={`${baseBtn} border-zinc-700 hover:bg-white/5`}
      >
        리셋
      </button>

      <button
        onClick={onPrimary}
        className={`${baseBtn} border-zinc-700 hover:bg-white/5`}
      >
        {primaryLabel}
      </button>

      {/* 🔊 음소거 버튼 */}
      <button
        onClick={onToggleMute}
        className={`${baseBtn} ${
          muted
            ? "border-red-500 text-red-400 hover:bg-red-500/10"
            : "border-green-500 text-green-400 hover:bg-green-500/10"
        }`}
      >
        {muted ? (
          <IoVolumeMuteOutline size={18} />
        ) : (
          <AiOutlineSound size={18} />
        )}
      </button>
    </div>
  );
}
