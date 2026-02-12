import { useEffect, useRef } from 'react';

export function useElectronHotKey({ enabled, onTrigger }) {
  const triggerRef = useRef(onTrigger);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    triggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  // ✅ global-key 리스너는 1번만 등록
  useEffect(() => {
    if (!window?.muyeong?.isDesktopApp) return;
    if (!window.muyeong.onGlobalKey) return;

    const handler = () => {
      if (!enabledRef.current) return; // ✅ 최신 enabled 사용
      triggerRef.current?.();
    };

    window.muyeong.onGlobalKey(handler);
  }, []);

  // ✅ 실제 전역키 등록/해제는 enabled 변화에 맞춰 처리
  useEffect(() => {
    if (!window?.muyeong?.isDesktopApp) return;

    if (enabled) window.muyeong.hotkeyEnable?.();
    else window.muyeong.hotkeyDisable?.();

    return () => window.muyeong.hotkeyDisable?.();
  }, [enabled]);
}
