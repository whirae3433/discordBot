import { useEffect, useRef } from 'react';

/**
 * Electron 글로벌 단축키 핸들링
 * - enabled면 hotkeyEnable()
 * - disabled면 hotkeyDisable()
 * - onGlobalKey(handler) 등록
 *
 * NOTE: 현재 preload 구현이 "off"를 지원 안 해서
 * 중복 등록을 피하려면 enabled 전환 시점에만 등록되게 구성.
 */
export function useElectronHotKey({ enabled, onTrigger }) {
  const triggerRef = useRef(onTrigger);

  useEffect(() => {
    triggerRef.current = onTrigger;
  }, [onTrigger]);

  useEffect(() => {
    if (!window?.muyeong?.isDesktopApp) return;
    if (!window.muyeong.onGlobalKey) return;

    const handler = () => {
      if (!enabled) return;
      triggerRef.current?.();
    };

    window.muyeong.onGlobalKey(handler);

    // ❗ remove API가 없으므로 cleanup 불가
    // 대신 enabled 체크를 내부에서 함
  }, []); // ← 의존성 비워야 함

  useEffect(() => {
    if (!window?.muyeong?.isDesktopApp) return;

    if (enabled) window.muyeong.hotkeyEnable?.();
    else window.muyeong.hotkeyDisable?.();

    return () => window.muyeong.hotkeyDisable?.();
  }, [enabled]);
}
