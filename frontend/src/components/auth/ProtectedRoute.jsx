import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginButton from './LoginButton';

export default function ProtectedRoute({ discordId, children }) {
  const { user, loading: authLoading } = useAuth();
  const { serverId } = useParams(); // URL에서 serverId 가져오기

  if (authLoading) return <div className="text-white">로그인 확인 중...</div>;

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="flex flex-col items-center gap-6 p-8 bg-gray-800 rounded-2xl shadow-lg">
          <p className="text-lg font-semibold text-gray-100">
            로그인이 필요합니다
          </p>
          <LoginButton serverId={serverId} />
        </div>
      </div>
    );
  }

  if (user.id !== discordId) {
    return (
      <div className="text-white">
        접근 권한이 없습니다. (로그인 ID: {user.id})
      </div>
    );
  }

  return children; // 인증 통과 시 실제 페이지 내용 렌더링
}
