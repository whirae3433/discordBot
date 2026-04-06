import { useEffect, useRef } from 'react';

export function useSmokeDangerBeep({ items, volume, muted }) {
  const beepedRef = useRef(new Set());
  const audioRef = useRef(null);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceNodeRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/beep.mp3');
    audio.preload = 'auto';
    audioRef.current = audio;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const gainNode = ctx.createGain();
    const sourceNode = ctx.createMediaElementSource(audio);

    sourceNode.connect(gainNode);
    gainNode.connect(ctx.destination);

    audioCtxRef.current = ctx;
    gainNodeRef.current = gainNode;
    sourceNodeRef.current = sourceNode;

    return () => {
      try {
        audio.pause();
        audio.src = '';
      } catch {}

      try {
        gainNode.disconnect();
        sourceNode.disconnect();
      } catch {}

      try {
        ctx.close();
      } catch {}
    };
  }, []);

  useEffect(() => {
    for (const it of items) {
      const isDanger =
        it.running && it.remainingSec > 0 && it.remainingSec <= 10;

      if (!isDanger) {
        beepedRef.current.delete(it.id);
        continue;
      }

      if (beepedRef.current.has(it.id)) continue;
      if (muted) continue;

      beepedRef.current.add(it.id);

      const audio = audioRef.current;
      const ctx = audioCtxRef.current;
      const gainNode = gainNodeRef.current;

      if (!audio) continue;

      try {
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        audio.pause();
        audio.currentTime = 0;
        audio.volume = volume;

        if (gainNode) {
          gainNode.gain.value = 2;
        }

        audio.play().catch((e) => {
          console.error('beep 재생 실패:', e);
        });
      } catch (e) {
        console.error('beep 처리 실패:', e);
      }
    }
  }, [items, muted, volume]);
}
