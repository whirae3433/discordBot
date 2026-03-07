import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function TimerUserBadge() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    axios.get('/timer/me').then(
      (res) => setMe(res.data),
      () => setMe(null)
    );
  }, []);

  if (!me) {
    return (
      <a
        href="/auth/login"
        className="h-10 rounded-xl border border-zinc-700 px-4 hover:bg-white/5 transition flex items-center"
      >
        Discord 로그인
      </a>
    );
  }

  const name = me.globalName || me.username;
  const avatarUrl = me.avatar
    ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=64`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  return (
    <div className="flex items-center gap-2">
      <img
        src={avatarUrl}
        alt="avatar"
        className="w-9 h-9 rounded-full border border-zinc-700"
      />
      <div className="text-sm font-bold">{name}</div>
    </div>
  );
}
