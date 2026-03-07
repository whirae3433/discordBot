import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = process.env.REACT_APP_BASE_URL || "";
console.log("API_BASE:", API_BASE);
export default function TimerLobbyPage() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadRooms() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/timer/rooms`, {
          credentials: "include",
        });

        if (res.status === 401) {
          navigate("/entry", { replace: true, state: { from: "/timer" } });
          return;
        }

        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg.message || "방 목록 로드 실패");
        }

        const data = await res.json();
        if (!cancelled) setRooms(data.rooms || []);
      } catch (e) {
        if (!cancelled) setError(e.message || "에러 발생");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const createRoom = async () => {
    setCreating(true);
    try {
      const payload = {
        guildId: "DEV_GUILD", // 일단 임시
        name: `타이머방 ${new Date().toLocaleTimeString()}`,
        isPrivate: false,
      };

      const res = await fetch(`${API_BASE}/timer/rooms`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        navigate("/entry", { replace: true, state: { from: "/timer" } });
        return;
      }

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.message || "방 생성 실패");
      }

      const data = await res.json(); // { roomId, ... }
      navigate(`/timer/room/${data.roomId}`);
    } catch (e) {
      alert(e.message || "방 생성 실패");
    } finally {
      setCreating(false);
    }
  };

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
            onClick={createRoom}
            disabled={creating}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm text-zinc-100 disabled:opacity-50"
          >
            {creating ? "생성 중..." : "방 생성"}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-zinc-900 p-5 text-zinc-100 shadow">
        <div className="mb-3 text-sm font-semibold text-zinc-200">내 방 목록</div>

        {loading ? (
          <div className="text-sm text-zinc-400">로딩 중...</div>
        ) : error ? (
          <div className="text-sm text-red-300">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="text-sm text-zinc-400">아직 참여 중인 방이 없습니다.</div>
        ) : (
          <ul className="space-y-2">
            {rooms.map((r) => (
              <li
                key={r.roomId}
                className="flex items-center justify-between rounded-xl bg-zinc-800 px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="mt-1 text-xs text-zinc-300">
                    roomId: <span className="font-mono">{r.roomId}</span>{" "}
                    <span className="ml-2 rounded bg-zinc-700 px-2 py-0.5">
                      {r.myRole}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/timer/room/${r.roomId}`)}
                  className="rounded-lg bg-zinc-700 px-3 py-1.5 text-sm"
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