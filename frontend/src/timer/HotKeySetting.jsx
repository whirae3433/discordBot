import React, { useEffect, useState } from 'react';

export default function HotkeySetting({
  active = false,
  enabled = false,
  setEnabled = () => {},
}) {
  const isApp = !!window?.muyeong?.isDesktopApp;
  const [acc, setAcc] = useState('[');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (!isApp) return;
    (async () => {
      const r = await window.muyeong.hotkeyGet();
      setAcc(r.accelerator || '[');
      // 앱 재시작 시에도 “미사용/사용”을 로컬에 저장해뒀다면 여기서 복원 가능
      const v = localStorage.getItem('timer_hotkey_enabled');
      if (v === 'true') setEnabled(true);
      if (v === 'false') setEnabled(false);
    })();
  }, [isApp, setEnabled]);

  const onKeyDown = (e) => {
    e.preventDefault();
    setAcc(e.key);
  };

  const applyNowIfRunning = async (nextEnabled) => {
    if (!isApp) return;
    if (!active) return;

    if (nextEnabled) await window.muyeong.hotkeyEnable?.();
    else await window.muyeong.hotkeyDisable?.();
  };

  const save = async () => {
    if (!isApp) return;

    const ok = await window.muyeong.hotkeySet(acc);
    if (!ok) {
      setSaved('저장 실패(다른 앱이 이미 사용중일 수 있음)');
      return;
    }

    setSaved(`단축키: '${acc}'`);
    localStorage.setItem('timer_hotkey', acc);

    // 저장 = 사용 상태로 전환
    setEnabled(true);
    localStorage.setItem('timer_hotkey_enabled', 'true');
    await applyNowIfRunning(true);
  };

  const clear = async () => {
    setSaved('');
    setEnabled(false);
    localStorage.setItem('timer_hotkey_enabled', 'false');

    if (!isApp) return;
    await window.muyeong.hotkeyDisable?.(); // 전역키 해제
  };

  return (
  <div
    className={`inline-block rounded-xl p-3 transition
      ${enabled
        ? 'border border-emerald-500 bg-emerald-500/5'
        : 'border border-zinc-700 bg-zinc-900'}
    `}
  >
    <div className="text-sm font-bold mb-1">단축키 (선택)</div>

    <div className="flex items-center justify-between mb-2">
      <div
        className={`text-xs font-medium flex items-center gap-2
          ${enabled ? 'text-emerald-400' : 'text-zinc-400'}
        `}
      >
        <span
          className={`w-2 h-2 rounded-full
            ${enabled ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}
          `}
        />
        {enabled
          ? '단축키 활성화됨'
          : '단축키 미사용 (키 안 잡힘)'}
      </div>

      {saved && (
        <div className="text-xs text-zinc-400">
          | {saved} |
        </div>
      )}
    </div>

    <div className="flex items-center gap-2">
      <input
        value={acc}
        onKeyDown={onKeyDown}
        onChange={() => {}}
        className="w-20 rounded-lg px-3 py-2 bg-zinc-950/40 border border-zinc-700
                   outline-none focus:border-zinc-300 text-sm text-zinc-100"
      />

      <button
        onClick={save}
        className="rounded-lg bg-zinc-100 text-zinc-900 px-3 py-2 font-bold"
      >
        저장
      </button>

      <button
        onClick={clear}
        className="rounded-lg border border-zinc-700 px-3 py-2 hover:bg-white/5"
      >
        취소
      </button>
    </div>
  </div>
);

}
