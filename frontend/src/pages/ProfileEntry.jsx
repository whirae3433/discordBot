import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProfileEntry() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // RequireAuth / TimerLobbyPage에서 넘겨준 목적지
  const from = location.state?.from || "/profile";

  // login()이 무한 호출되는 거 방지
  const triedRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    // 로그인 되어 있으면 원래 목적지로 보내기
    if (user) {
      navigate(from, { replace: true });
      return;
    }

    // 로그인 안 되어 있으면 OAuth 시작(딱 1번만)
    if (!triedRef.current) {
      triedRef.current = true;
      login();
    }
  }, [loading, user, login, navigate, from]);

  return <div className="text-white text-center mt-20">로그인 중...</div>;
}