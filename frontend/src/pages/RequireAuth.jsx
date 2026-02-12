import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="mt-32 text-center text-gray-400">로그인 확인 중...</div>;
  }

  if (!user) {
    // 로그인 후 원래 가려던 곳으로 돌아오게 하려면 state로 저장
    return <Navigate to="/entry" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
