import { useAuth } from '../../Hooks/useAuth';

export default function UserInfo({ serverId }) {
  const { user } = useAuth();

  if (!user) {
    return <div className="felx items-center">누구세용</div>;
  }

  const displayName = user.nickname || user.username;

  return (
    <div className="flex font-bold text-white text-xl items-center gap-3">
      <img
        src={
          user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
            : '/images/avatar-placeholder.png'
        }
        alt="avatar"
        className="w-8 h-8 rounded-full border border-gray-400"
      />
      <span className="text-white text-sm">{displayName} 님</span>
    </div>
  );
}
