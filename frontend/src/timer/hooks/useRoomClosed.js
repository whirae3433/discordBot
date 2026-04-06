import { useEffect, useState, useCallback } from 'react';
import { socket } from '../socket';

export function useRoomClosed(roomId) {
  const [roomClosed, setRoomClosed] = useState(false);

  useEffect(() => {
    function handleRoomClosed(payload) {
      if (String(payload?.roomId) !== String(roomId)) return;
      setRoomClosed(true);
    }

    socket.on('room:closed', handleRoomClosed);

    return () => {
      socket.off('room:closed', handleRoomClosed);
    };
  }, [roomId]);

  const clearRoomClosed = useCallback(() => {
    setRoomClosed(false);
  }, []);

  return {
    roomClosed,
    clearRoomClosed,
  };
}
