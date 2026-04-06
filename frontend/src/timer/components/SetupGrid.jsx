import React, { useRef } from 'react';

export default function SetupGrid({ timerSet, slots, setSlots }) {
  const { timeMode, defaultMinute, defaultSec } = timerSet || {};
  const nameRefs = useRef([]);

  const updateSlot = (index, field, value) => {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot)),
    );
  };

  const moveToNextName = (index, shiftKey = false) => {
    const total = slots.length;
    if (!total) return;

    const nextIndex = shiftKey
      ? (index - 1 + total) % total
      : (index + 1) % total;

    const nextEl = nameRefs.current[nextIndex];
    if (nextEl) {
      nextEl.focus();
      nextEl.select?.();
    }
  };

  const handleNameKeyDown = (e, index) => {
    if (e.isComposing || e.nativeEvent?.isComposing) return;

    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      moveToNextName(index, e.shiftKey);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {slots.map((slot, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-zinc-700 bg-zinc-900/95 p-4 shadow-sm"
        >
          <div className="text-sm text-zinc-300 mb-2">닉네임</div>
          <input
            ref={(el) => {
              nameRefs.current[idx] = el;
            }}
            lang="ko"
            value={slot.name ?? slot.title ?? ''}
            onChange={(e) => {
              updateSlot(idx, 'name', e.target.value);
              updateSlot(idx, 'title', e.target.value);
            }}
            onKeyDown={(e) => handleNameKeyDown(e, idx)}
            className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-700 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500"
            placeholder="예: 이케아"
          />

          {timeMode === 'minute-input' && (
            <>
              <div className="text-sm text-zinc-300 mb-2 mt-4">타이머(분)</div>
              <input
                value={slot.minute ?? slot.minutes ?? ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, '');
                  updateSlot(idx, 'minute', v);
                  updateSlot(idx, 'minutes', v);
                }}
                className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-700 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500"
                placeholder={String(defaultMinute ?? 20)}
                type="number"
                min="0"
                tabIndex={-1}
              />
            </>
          )}

          {timeMode === 'sec-input' && (
            <>
              <div className="text-sm text-zinc-300 mb-2 mt-4">타이머(초)</div>
              <input
                value={slot.sec ?? slot.seconds ?? ''}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, '');
                  updateSlot(idx, 'sec', v);
                  updateSlot(idx, 'seconds', v);
                }}
                className="w-full h-10 rounded-xl bg-zinc-950 border border-zinc-700 px-3 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500"
                placeholder={String(defaultSec ?? 60)}
                type="number"
                min="0"
                tabIndex={-1}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}