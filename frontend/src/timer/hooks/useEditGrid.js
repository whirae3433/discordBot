import { useRef } from 'react';

export function clampMinuteStr(v) {
  const only = String(v ?? '').replace(/[^\d]/g, '');
  if (only === '') return '';
  const n = Math.min(999, Math.max(0, Number(only)));
  return String(n);
}

export function useEditGrid({ count, timeMode, focusFirst = false }) {
  const refs = useRef({});

  const focusField = (index, field) => {
    const el = refs.current?.[index]?.[field];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  const handleKeyDown = (e, index, field) => {
    const isEnter = e.key === 'Enter';
    const isTab = e.key === 'Tab';
    if (!isEnter && !isTab) return;

    e.preventDefault();
    const forward = !e.shiftKey;

    const nextIndex = (index + 1) % count;
    const prevIndex = (index - 1 + count) % count;

    if (timeMode === 'minute-input') {
      if (forward) {
        if (field === 'name') focusField(index, 'minute');
        else focusField(nextIndex, 'name');
      } else {
        if (field === 'minute') focusField(index, 'name');
        else focusField(prevIndex, 'minute');
      }
    } else {
      if (forward) focusField(nextIndex, 'name');
      else focusField(prevIndex, 'name');
    }
  };

  return { refs, focusField, handleKeyDown };
}