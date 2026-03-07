import React, { useState } from 'react';
import axios from 'axios';

export default function CreateRoomButton() {
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/timer/rooms');
      window.location.href = `/timer/room/${data.roomId}`;
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onCreate}
      disabled={loading}
      className="h-10 rounded-xl border border-zinc-700 px-4 hover:bg-white/5 transition disabled:opacity-50"
    >
      방 만들기
    </button>
  );
}
