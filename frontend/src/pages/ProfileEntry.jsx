import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function ProfileEntry() {
  const { user, loading, login, refreshMe } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serverId = searchParams.get('serverId');

  useEffect(() => {
    // 아직 로그인 안 됨 → OAuth 시작
    if (!loading && !user) {
      login(serverId); // Discord OAuth redirect
      return;
    }

    // 로그인 되어있으면: serverId가 있을 때 members upsert 한 번 때리기

    // 로그인 완료 → 내 프로필로 이동
    (async () => {
      if (user?.id) {
        if (serverId) {
          try {
            await axios.post(
              '/api/auth/join-guild',
              { serverId },
              { withCredentials: true }
            );
            // 필요하면 세션 정보 갱신
            await refreshMe();
          } catch (e) {
            console.error(
              'join-guild fail',
              e?.response?.status,
              e?.response?.data
            );
          }
        }
        navigate(`/profile/${user.id}`, { replace: true });
      }
    })();
  }, [loading, user, serverId, login, navigate, refreshMe]);

  return <div className="text-white text-center mt-20">로그인 중...</div>;
}
