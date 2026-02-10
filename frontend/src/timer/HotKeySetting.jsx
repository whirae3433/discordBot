import React, { useEffect, useState } from 'react';

export default function HotkeySetting({ active = false }) {
  const isApp = !!window?.muyeong?.isDesktopApp;
  const [acc, setAcc] = useState('[');
  const [originAcc, setOriginAcc] = useState('[');
  const [saved, setSaved] = useState('');

  useEffect(() => {
    if (!isApp) return;
    (async () => {
      const r = await window.muyeong.hotkeyGet();
      const v = r.accelerator || '[';
      setAcc(v);
      setOriginAcc(v); // ✅ 기준값 저장
    })();
  }, [isApp]);

  const onKeyDown = (e) => {
    e.preventDefault();
    const key = e.key;
    setAcc(key);
  };

  const applyNowIfRunning = async () => {
    if (!isApp) return;
    // 실행 중이면 즉시 반영되도록 재-enable
    if (active) {
      window.muyeong.hotkeyEnable?.();
    }
  };

  const save = async () => {
    if (!isApp) return;
    const ok = await window.muyeong.hotkeySet(acc);
    if (ok) {
      setSaved(`단축키: '${acc}'`);
      localStorage.setItem('timer_hotkey', acc);
      setOriginAcc(acc); // ✅ 새 기준값
      await applyNowIfRunning();
    }
  };

  const cancel = async () => {
    if (!isApp) return;

    setAcc(originAcc);
    setSaved('');

    await window.muyeong.hotkeySet(originAcc);
    await applyNowIfRunning();
  };

  return (
    <div className="inline-block rounded-xl border border-zinc-700 bg-zinc-900 p-3">
      <div className="text-sm font-bold mb-1">
        단축키 설정 (안쓰는 키로 지정바람)
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-zinc-400">원하는 키 입력 후 저장.</div>
        {saved && <div className="text-xs text-zinc-400">| {saved} |</div>}
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
          onClick={cancel}
          className="rounded-lg border border-zinc-700 px-3 py-2 hover:bg-white/5"
        >
          취소
        </button>
      </div>
    </div>
  );
}
