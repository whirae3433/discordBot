import { useEffect, useMemo, useState } from 'react';

export function useTimerRoomSocket({ socket, roomId }) {
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [roomState, setRoomState] = useState(null);

  // connect 상태
  useEffect(() => {
    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = (err) => console.error('socket connect_error:', err);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, [socket]);

  // room join + room:state
  useEffect(() => {
    if (!roomId) return;

    const onRoomState = (payload) => {
      if (!payload || payload.roomId !== roomId) return;
      setRoomState(payload);
    };

    socket.on('room:state', onRoomState);
    socket.emit('room:join', { roomId });

    return () => {
      socket.off('room:state', onRoomState);
      socket.emit('room:leave', { roomId });
    };
  }, [socket, roomId]);

  return { socketConnected, roomState };
}
