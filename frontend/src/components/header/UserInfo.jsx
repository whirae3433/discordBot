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
                   flex items-center gap-2
                   px-4 py-2 text-sm font-semibold text-white
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
    <div className="flex items-center gap-3 text-white">
      <button
        onClick={logout}
        className="text-xs text-gray-300 hover:text-white transition"
        title="로그아웃"
      >
        로그아웃
      </button>
      <span className="h-3.5 w-px bg-gray-300" />
      <span className="text-sm font-semibold">{displayName}</span>
      <img
        src={
          user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
            : '/images/avatar-placeholder.png'
        }
        alt="avatar"
        className="w-8 h-8 rounded-full border border-gray-400"
      />
    </div>
  );
}
