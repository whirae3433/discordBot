import { io } from 'socket.io-client';

// REACT_APP_BASE_URL이 "/api" 같은 path를 포함할 수 있어서, host만 쓰도록 정리
function normalizeSocketBase(raw) {
  const fallback = 'http://localhost:3001';
  const base = raw || fallback;

  try {
    const u = new URL(base);
    return u.origin;
  } catch {
    return base;
  }
}

const SOCKET_BASE = normalizeSocketBase(process.env.REACT_APP_BASE_URL);

// module-scope에서 1번만 생성 (중복 연결 방지)
export const socket = io(SOCKET_BASE, {
  withCredentials: true,
  transports: ['websocket'], // 개발에서 안정적
});