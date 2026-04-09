import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import TimerApp from '../TimerApp';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

// 네 프로젝트에서 마지막 방 경로 저장 키가 따로 있으면 이 이름만 맞춰주면 됨.
const LAST_TIMER_ROOM_KEY = 'currentTimerRoomId';

export default function TimerRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [myRole, setMyRole] = useState(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [needJoinCode, setNeedJoinCode] = useState(false);
  const [error, setError] = useState('');

  // 삭제되었거나 더 이상 유효하지 않은 방인지
  const [needInvalidRoomModal, setNeedInvalidRoomModal] = useState(false);

  function clearSavedTimerRoomPath() {
    try {
      localStorage.removeItem(LAST_TIMER_ROOM_KEY);
    } catch (e) {
      console.error('마지막 타이머 방 경로 삭제 실패:', e);
    }
  }

  function handleInvalidRoom(message = '더 이상 존재하지 않는 방입니다.') {
    clearSavedTimerRoomPath();
    setError(message);
    setNeedInvalidRoomModal(true);
    setMeta(null);
    setJoined(false);
    setNeedJoinCode(false);
  }

  const onConfirmInvalidRoom = () => {
    setNeedInvalidRoomModal(false);
    navigate('/timer', { replace: true });
  };

  // 1) room meta 조회
  useEffect(() => {
    let cancelled = false;

    async function loadMeta() {
      setLoading(true);
      setError('');
      setNeedLogin(false);
      setNeedJoinCode(false);
      setNeedInvalidRoomModal(false);
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
          // 삭제된 방 / 존재하지 않는 방 처리
          if (res.status === 404) {
            if (!cancelled) {
              handleInvalidRoom(
                data?.message || '더 이상 존재하지 않는 방입니다.',
              );
            }
            return;
          }

          throw new Error(data?.message || '방 정보를 불러오지 못했습니다.');
        }

        if (!data) {
          if (!cancelled) {
            handleInvalidRoom('더 이상 존재하지 않는 방입니다.');
          }
          return;
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
    if (needInvalidRoomModal) return;

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

        // join 시점에 이미 삭제되었거나 유효하지 않은 방일 수도 있음
        if (res.status === 404) {
          if (!cancelled) {
            handleInvalidRoom(
              data?.message || '더 이상 존재하지 않는 방입니다.',
            );
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
  }, [meta, roomId, needInvalidRoomModal]);

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

      if (res.status === 404) {
        handleInvalidRoom(data?.message || '더 이상 존재하지 않는 방입니다.');
        return;
      }

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

  if (needInvalidRoomModal) {
    return (
      <div className="mx-auto mt-20 max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        <div className="text-xl font-bold">더 이상 존재하지 않는 방입니다.</div>
        <div className="mt-3 text-sm text-zinc-300">
          확인을 누르면 타이머 로비로 이동합니다.
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onConfirmInvalidRoom}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-100 hover:bg-zinc-800 transition"
          >
            확인
          </button>
        </div>
      </div>
    );
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
