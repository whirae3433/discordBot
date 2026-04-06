import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="mt-32 text-center text-gray-400">로그인 확인 중...</div>
    );
  }

  if (!user) {
    const from = location.pathname + location.search + location.hash;
    return <Navigate to="/entry" replace state={{ from: from }} />;
  }

  return <Outlet />;
}
