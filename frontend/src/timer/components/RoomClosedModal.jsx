import React from 'react';

export default function RoomClosedModal({ open, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <div className="text-lg font-bold">방이 삭제되었습니다.</div>
        <div className="mt-2 text-sm text-zinc-400">
          확인을 누르면 로비로 이동합니다.
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onConfirm}
            className="h-10 rounded-xl border border-zinc-700 px-4 hover:bg-white/5 transition"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
