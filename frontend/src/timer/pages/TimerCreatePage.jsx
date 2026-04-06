import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TIMER_SETS } from '../constants';
import { makeSlotsForSet } from '../utils/timerFactory';
import { buildDraftItems } from '../hooks/useTimerDraft';
import SetupGrid from '../components/SetupGrid';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

async function createRoom({ name, isPrivate, joinCode }) {
  const res = await fetch(`${API_BASE}/timer/rooms`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, isPrivate, joinCode }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'failed to create room');
  return data;
}

async function replaceItems({ roomId, setKey, items }) {
  const res = await fetch(`${API_BASE}/timer/items/replace`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomId, setKey, items }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || 'failed to replace items');
  return data;
}

export default function TimerCreatePage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [roomName, setRoomName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const leafSet = useMemo(() => TIMER_SETS.find((s) => s.key === 't1'), []);
  const smokeSet = useMemo(() => TIMER_SETS.find((s) => s.key === 't2'), []);
  const gongbanSet = useMemo(() => TIMER_SETS.find((s) => s.key === 't3'), []);

  const [leafSlots, setLeafSlots] = useState(() => makeSlotsForSet(leafSet));
  const [smokeSlots, setSmokeSlots] = useState(() => makeSlotsForSet(smokeSet));
  const [gongbanSlots, setGongbanSlots] = useState(() =>
    makeSlotsForSet(gongbanSet),
  );

  const onNext = () => {
    setError('');

    if (step === 1) {
      if (!roomName.trim()) return setError('방 이름을 입력해주세요');
      if (isPrivate && !joinCode.trim()) {
        return setError('비밀번호를 입력해줘.');
      }
    }

    setStep((s) => Math.min(4, s + 1));
  };

  const onPrev = () => {
    setError('');
    setStep((s) => Math.max(1, s - 1));
  };

  const onComplete = async () => {
    setError('');
    setSaving(true);

    try {
      const room = await createRoom({
        name: roomName.trim(),
        isPrivate,
        joinCode: isPrivate ? joinCode.trim() : null,
      });

      const leafDraft = buildDraftItems(leafSet, leafSlots).draft;
      const smokeDraft = buildDraftItems(smokeSet, smokeSlots).draft;
      const gongbanDraft = buildDraftItems(gongbanSet, gongbanSlots).draft;

      await replaceItems({
        roomId: room.roomId,
        setKey: 't1',
        items: leafDraft,
      });
      await replaceItems({
        roomId: room.roomId,
        setKey: 't2',
        items: smokeDraft,
      });
      await replaceItems({
        roomId: room.roomId,
        setKey: 't3',
        items: gongbanDraft,
      });

      navigate(`/timer/room/${room.roomId}`);
    } catch (e) {
      setError(e?.message || '방 생성에 실패했어.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 text-zinc-100">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm shadow-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-2 text-zinc-100">
          타이머 방 만들기
        </h1>
        <div className="mb-6 text-sm text-zinc-400">단계 {step} / 4</div>

        {step === 1 && (
          <div className="max-w-xl space-y-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <div>
              <div className="text-sm text-zinc-300 mb-2">방 제목</div>
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500"
                placeholder="예: 카혼 1팟"
              />
            </div>

            <label className="flex items-center gap-3 text-zinc-200">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="h-5 w-5 rounded border-zinc-600 bg-zinc-950"
              />
              <span>비공개 방</span>
            </label>

            {isPrivate && (
              <div>
                <div className="text-sm text-zinc-300 mb-2">비밀번호</div>
                <input
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-700 px-4 text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-500"
                  type="password"
                  placeholder="비밀번호 입력"
                />
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <div className="text-lg font-semibold mb-4 text-zinc-100">
              리프 세팅
            </div>
            <SetupGrid
              timerSet={leafSet}
              slots={leafSlots}
              setSlots={setLeafSlots}
            />
          </div>
        )}

        {step === 3 && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <div className="text-lg font-semibold mb-4 text-zinc-100">
              연막 세팅
            </div>
            <SetupGrid
              timerSet={smokeSet}
              slots={smokeSlots}
              setSlots={setSmokeSlots}
            />
          </div>
        )}

        {step === 4 && (
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <div className="text-lg font-semibold mb-4 text-zinc-100">
              공반 세팅
            </div>
            <SetupGrid
              timerSet={gongbanSet}
              slots={gongbanSlots}
              setSlots={setGongbanSlots}
            />
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {step > 1 && (
            <button
              onClick={onPrev}
              className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 hover:bg-zinc-800 transition"
            >
              이전
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={onNext}
              className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 hover:bg-zinc-800 transition"
            >
              다음
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={saving}
              className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {saving ? '생성 중...' : '완료'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
