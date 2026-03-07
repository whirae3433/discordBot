import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TimerApp from '../TimerApp'; // 경로 확인: pages 폴더 기준이면 ../TimerApp 맞음

const API_BASE = process.env.REACT_APP_BASE_URL || '';

export default function TimerRoomPage() {
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null); // { roomId, name, isPrivate, createdAt }
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState('');

  // 1) room meta 조회 (멤버 아니어도 가능)
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoading(true);
      setError('');
      setNeedLogin(false);
      setMeta(null);
      setJoined(false);

      try {
        const res = await fetch(`${API_BASE}/timer/rooms/${roomId}/meta`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.status === 401) {
          setNeedLogin(true);
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || '방 정보를 불러오지 못했습니다.');
        }

        if (!cancelled) {
          setMeta(data);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || '에러가 발생했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (roomId) loadMeta();
    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // 2) 공개방이면 자동 join (멤버 등록)
  useEffect(() => {
    if (!meta) return;
    if (meta.isPrivate) return; // 비번방은 수동

    let cancelled = false;

    async function autoJoin() {
      setError('');
      try {
        const res = await fetch(`${API_BASE}/timer/rooms/${roomId}/join`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (res.status === 401) {
          setNeedLogin(true);
          return;
        }

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(data?.message || '입장에 실패했습니다.');
        }

        if (!cancelled) setJoined(true);
      } catch (e) {
        if (!cancelled) setError(e?.message || '입장에 실패했습니다.');
      }
    }

    autoJoin();
    return () => {
      cancelled = true;
    };
  }, [meta, roomId]);

  const onJoinPrivate = async () => {
    setError('');
    try {
      const res = await fetch(`${API_BASE}/timer/rooms/${roomId}/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ joinCode }),
      });

      if (res.status === 401) {
        setNeedLogin(true);
        return;
      }

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || '비밀번호가 올바르지 않습니다.');
      }

      setJoined(true);
    } catch (e) {
      setError(e?.message || '입장에 실패했습니다.');
    }
  };

  // 로그인 필요하면 entry로 이동
  if (needLogin) {
    return (
      <Navigate to="/entry" replace state={{ from: `/timer/room/${roomId}` }} />
    );
  }

  if (loading) {
    return <div className="mt-12 text-center text-gray-400">로딩 중...</div>;
  }

  // meta 자체가 실패한 경우(방 없음/삭제됨 등)
  if (!meta) {
    return (
      <div className="mx-auto mt-12 max-w-xl rounded-xl bg-zinc-900 p-6 text-zinc-100">
        <div className="text-lg font-semibold">문제 발생</div>
        <div className="mt-2 text-sm text-zinc-300">
          {error || '방을 찾을 수 없습니다.'}
        </div>
        <div className="mt-4 text-sm text-zinc-400">
          roomId: <span className="font-mono">{roomId}</span>
        </div>
      </div>
    );
  }

  // 비번방 & 아직 join 안됨 -> 비번 입력 UI
  if (meta.isPrivate && !joined) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 rounded-2xl border border-zinc-700 bg-zinc-950 text-zinc-100">
        <div className="text-xl font-bold">
          🔒 {meta.name || '비공개 타이머 룸'}
        </div>
        <div className="text-zinc-400 text-sm mt-2">
          비밀번호를 입력해야 입장할 수 있어.
        </div>

        <input
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="비밀번호"
          className="mt-4 w-full h-10 rounded-xl bg-zinc-900 border border-zinc-700 px-3 outline-none"
          type="password"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onJoinPrivate();
          }}
        />

        {error && <div className="text-red-400 text-sm mt-3">{error}</div>}

        <button
          onClick={onJoinPrivate}
          className="mt-4 w-full h-10 rounded-xl border border-zinc-700 hover:bg-white/5 transition"
        >
          입장
        </button>

        <div className="mt-4 text-xs text-zinc-500">
          roomId: <span className="font-mono">{roomId}</span>
        </div>
      </div>
    );
  }

  // 공개방은 autoJoin 중일 수 있음
  if (!joined) {
    return (
      <div className="mt-12 text-center text-zinc-400">
        입장 처리 중...
        {error ? (
          <div className="mt-2 text-red-400 text-sm">{error}</div>
        ) : null}
      </div>
    );
  }

  // join 완료되면 TimerApp 렌더 (TimerApp이 socket join + state 받음)
  return <TimerApp />;
}
