import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import TimerApp from '../TimerApp';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

export default function TimerRoomPage() {
  const { roomId } = useParams();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [needJoinCode, setNeedJoinCode] = useState(false);
  const [error, setError] = useState('');

  // 1) room meta 조회
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoading(true);
      setError('');
      setNeedLogin(false);
      setNeedJoinCode(false);
      setMeta(null);
      setJoined(false);
      setMyRole(null);

      try {
        const res = await fetch(`${API_BASE}/timer/rooms/${roomId}/meta`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.status === 401) {
          if (!cancelled) setNeedLogin(true);
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
        if (!cancelled) {
          setError(e?.message || '에러가 발생했습니다.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (roomId) loadMeta();

    return () => {
      cancelled = true;
    };
  }, [roomId]);

  // 2) 일단 무조건 join 시도
  // - 이미 멤버면 private라도 바로 통과
  // - 새 유저면서 private면 joinCode required -> 그때만 비번창
  useEffect(() => {
    if (!meta) return;

    let cancelled = false;

    async function tryJoinWithoutCode() {
      setError('');
      setNeedJoinCode(false);

      try {
        const res = await fetch(`${API_BASE}/timer/rooms/${roomId}/join`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (res.status === 401) {
          if (!cancelled) setNeedLogin(true);
          return;
        }

        const data = await res.json().catch(() => null);

        if (res.ok) {
          if (!cancelled) {
            setJoined(true);
            setMyRole(data?.myRole || 'member');
            setNeedJoinCode(false);
          }
          return;
        }

        // private room + 신규 유저
        if (res.status === 400 && data?.message === 'joinCode required') {
          if (!cancelled) {
            setNeedJoinCode(true);
          }
          return;
        }

        throw new Error(data?.message || '입장에 실패했습니다.');
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || '입장에 실패했습니다.');
        }
      }
    }

    tryJoinWithoutCode();

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
      setMyRole(data?.myRole || 'member');
      setNeedJoinCode(false);
    } catch (e) {
      setError(e?.message || '입장에 실패했습니다.');
    }
  };

  if (needLogin) {
    return (
      <Navigate to="/entry" replace state={{ from: `/timer/room/${roomId}` }} />
    );
  }

  if (loading) {
    return <div className="mt-12 text-center text-gray-400">로딩 중...</div>;
  }

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

  // private + 아직 멤버 아니면 비번 입력
  if (needJoinCode && !joined) {
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

  return <TimerApp myRole={myRole} />;
}
