import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FaDiscord } from 'react-icons/fa';

export default function UserInfo() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <button
        onClick={() => navigate('/entry')}
        className="
        h-9 flex items-center gap-2
        px-3 text-sm font-semibold text-white
      bg-indigo-600 rounded-md hover:bg-indigo-500
        transition"
      >
        <FaDiscord className="text-lg" />
        <span>로그인</span>
      </button>
    );
  }

  const displayName = user.nickname || user.globalName || user.username;

  return (
    <div className="h-9 flex items-center gap-2 text-zinc-500">
      <button
        onClick={logout}
        className="text-xs hover:text-black transition"
        title="로그아웃"
      >
        로그아웃
      </button>
      <span className="h-3.5 w-px bg-gray-400" />
      <span className="text-sm font-semibold">{displayName}</span>
      <img
        src={
          user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
            : '/images/avatar-placeholder.png'
        }
        alt="avatar"
        className="w-7 h-7 rounded-full border border-gray-400"
      />
    </div>
  );
}
