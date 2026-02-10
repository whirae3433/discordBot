import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function ProfileEntry() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 아직 로그인 안 됨 → 대기
    if (loading) return;

    // 로그인 안 되어 있으면 OAuth 시작
    if (!user) {
      login();
      return;
    }
    // 로그인 되어 있으면 내 프로필로
    navigate(`/profile`, { replace: true });
  }, [loading, user, login, navigate]);

  return <div className="text-white text-center mt-20">로그인 중...</div>;
}
