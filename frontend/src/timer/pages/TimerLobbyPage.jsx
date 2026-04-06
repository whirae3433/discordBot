import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCrown } from 'react-icons/lu';
import { BsPersonCheckFill } from 'react-icons/bs';
import { BsFillPersonXFill } from 'react-icons/bs';
import { BiSolidLockOpen } from 'react-icons/bi';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

export default function TimerLobbyPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_BASE}/timer/rooms`, {
          credentials: 'include',
        });

        if (res.status === 401) {
          navigate('/entry', { replace: true, state: { from: '/timer' } });
          return;
        }

        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg.message || '방 목록 로드 실패');
        }

        const data = await res.json();
        if (!cancelled) setRooms(data.rooms || []);
      } catch (e) {
        if (!cancelled) setError(e.message || '에러 발생');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function renderRoleIcon(role) {
    if (role === 'owner') {
      return <LuCrown className="text-yellow-400" />;
    }
    if (role === 'member') {
      return <BsPersonCheckFill className="text-green-400" />;
    }
    return <BsFillPersonXFill className="text-zinc-500" />;
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-4 rounded-2xl bg-zinc-900 p-5 text-zinc-100 shadow">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold">타이머 로비</div>
            <div className="mt-1 text-sm text-zinc-400">
              방을 만들거나, 기존 방에 입장하세요.
            </div>
          </div>

          <button
            onClick={() => navigate('/timer/create')}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-100 disabled:opacity-50"
          >
            방 만들기
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 p-5 text-zinc-100 shadow">
        <div className="mb-3 text-m font-semibold text-zinc-200">
          [ 방 목록 ]
        </div>

        {loading ? (
          <div className="text-sm text-zinc-400">로딩 중...</div>
        ) : error ? (
          <div className="text-sm text-red-300">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="text-sm text-zinc-400">
            아직 참여 중인 방이 없습니다.
          </div>
        ) : (
          <ul className="space-y-2">
            {rooms.map((r) => (
              <li
                key={r.roomId}
                className="flex items-center justify-between rounded-xl bg-zinc-800 px-4 py-4 hover:bg-zinc-700 transition"
              >
                {/* 좌측 */}
                <div className="flex flex-col gap-1">
                  {/* 상단: 아이콘 + 제목 + 자물쇠 */}
                  <div className="flex items-center gap-2">
                    {renderRoleIcon(r.myRole)}

                    <span className="font-semibold text-base">{r.name}</span>

                    {r.isPrivate && (
                      <BiSolidLockOpen className="text-zinc-400 text-sm" />
                    )}
                  </div>

                  {/* 하단: 방장 닉네임 */}
                  <div className="text-xs text-zinc-400">
                    방장:{' '}
                    <span className="text-zinc-300">
                      {r.ownerName || '알 수 없음'}
                    </span>
                  </div>
                </div>

                {/* 우측 버튼 */}
                <button
                  onClick={() => navigate(`/timer/room/${r.roomId}`)}
                  className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-600 transition"
                >
                  입장
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
