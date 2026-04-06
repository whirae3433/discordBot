import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { TIMER_SETS } from '../constants';
import { makeSlotsForSet } from '../utils/timerFactory';
import { buildDraftItems } from '../hooks/useTimerDraft';
import SetupGrid from '../components/SetupGrid';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

async function fetchRoomItems(roomId) {
  const res = await fetch(`${API_BASE}/timer/items?roomId=${roomId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || '아이템 조회 실패');
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
  if (!res.ok) throw new Error(data?.message || '세팅 저장 실패');
  return data;
}

function mapItemsToSlots(baseSlots, items, timerSet) {
  return baseSlots.map((slot, index) => {
    const item = items[index];
    if (!item) return slot;

    const next = {
      ...slot,
      name: item.title || '',
      title: item.title || '',
    };

    if (timerSet?.timeMode === 'minute-input') {
      next.minute = item.durationSec
        ? String(Math.floor(item.durationSec / 60))
        : '';
      next.minutes = next.minute;
    }

    if (timerSet?.timeMode === 'sec-input') {
      next.sec = item.durationSec ? String(item.durationSec) : '';
      next.seconds = next.sec;
    }

    return next;
  });
}

export default function TimerEditPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();

  const setKey = searchParams.get('setKey') || 't2';

  const timerSet = useMemo(
    () => TIMER_SETS.find((s) => s.key === setKey),
    [setKey],
  );

  const [slots, setSlots] = useState(() =>
    makeSlotsForSet(timerSet || TIMER_SETS[0]),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!timerSet) return;

    let cancelled = false;

    async function loadItems() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchRoomItems(roomId);
        const setItems = (data.items || []).filter(
          (it) => it.setKey === setKey,
        );

        const baseSlots = makeSlotsForSet(timerSet);
        const mappedSlots = mapItemsToSlots(baseSlots, setItems, timerSet);

        if (!cancelled) {
          setSlots(mappedSlots);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || '불러오기에 실패했어.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      cancelled = true;
    };
  }, [roomId, setKey, timerSet]);

  const onSave = async () => {
    try {
      setSaving(true);
      setError('');

      const draft = buildDraftItems(timerSet, slots).draft;
      // console.log('draft payload', draft);

      await replaceItems({
        roomId,
        setKey,
        items: draft,
      });

      navigate(`/timer/room/${roomId}`);
    } catch (e) {
      setError(e?.message || '저장에 실패했어.');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    navigate(`/timer/room/${roomId}`);
  };

  if (!timerSet) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6">
          잘못된 setKey야.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-zinc-100">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/95 p-6">
          불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-zinc-100">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm shadow-2xl p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-2 text-zinc-100">
          {timerSet.label} 세팅 편집
        </h1>
        <div className="mb-6 text-sm text-zinc-400">
          roomId: <span className="font-mono">{roomId}</span>
        </div>

        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
          <SetupGrid timerSet={timerSet} slots={slots} setSlots={setSlots} />
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={onCancel}
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 hover:bg-zinc-800 transition"
          >
            취소
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className="h-11 rounded-xl border border-zinc-700 bg-zinc-900 px-4 text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-50"
          >
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
