import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_BASE_URL || '';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  // OAuth 로그인 트리거
  const login = useCallback((serverId) => {
    const url = serverId
      ? `${API_BASE}/api/auth/login?serverId=${encodeURIComponent(serverId)}`
      : `${API_BASE}/api/auth/login`;

    window.location.href = url;
  }, []);

  const logout = async () => {
    await axios.post('/api/auth/logout', {}, { withCredentials: true });
    setUser(null);
  };

  return { user, loading, login, logout, refreshMe };
}
