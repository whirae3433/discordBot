import { useEffect, useMemo, useRef } from 'react';

export function useBeep({ src = '/beep.mp3', volume = 0.9 } = {}) {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const bufRef = useRef(null);

  const initOnce = useMemo(() => {
    let started = false;

    const init = async () => {
      if (started) return;
      started = true;

      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;

      const ctx = new Ctx();
      ctxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gain.connect(ctx.destination);
      gainRef.current = gain;

      try {
        const res = await fetch(src);
        const arr = await res.arrayBuffer();
        bufRef.current = await ctx.decodeAudioData(arr);
      } catch {
        // ignore
      }
    };

    return init;
  }, [src, volume]);

  // 앱 시작 시 미리 init 시도(실패해도 OK)
  useEffect(() => {
    initOnce();
  }, [initOnce]);

  const ensureReady = async () => {
    await initOnce();
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {}
    }
  };

  const beep = () => {
    const ctx = ctxRef.current;
    const gain = gainRef.current;
    const buf = bufRef.current;

    if (ctx && gain && buf) {
      try {
        const srcNode = ctx.createBufferSource();
        srcNode.buffer = buf;
        srcNode.connect(gain);
        srcNode.start(0);
      } catch {}
      return;
    }

    // fallback
    try {
      const a = new Audio(src);
      a.volume = volume;
      a.play().catch(() => {});
    } catch {}
  };

  return { beep, ensureReady };
}
