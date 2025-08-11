// src/Hooks/useEscClose.js
import { useEffect } from 'react';
export function useEscClose(handler, disabled = false) {
  useEffect(() => {
    if (disabled) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') handler?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handler, disabled]);
}
