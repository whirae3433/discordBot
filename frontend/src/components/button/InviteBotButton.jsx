import React from 'react';
import { FaDiscord } from 'react-icons/fa';

export default function InviteBotButton() {
  const RAW_REDIRECT_URI = process.env.REACT_APP_DISCORD_INVITE_REDIRECT_URI;
  const INVITE_REDIRECT_URI = encodeURIComponent(RAW_REDIRECT_URI); // ✅ 인코딩 필수

  const INVITE_URL = `https://discord.com/oauth2/authorize?client_id=1394227164144074862&permissions=8&scope=bot&redirect_uri=${INVITE_REDIRECT_URI}&response_type=code`;

  const handleInvite = () => {
    // 디버그용: 현재 구성된 URL 확인
    console.log('INVITE_URL:', INVITE_URL);
    window.location.href = INVITE_URL;
  };

  return (
    <button
      onClick={handleInvite}
      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition"
    >
      <FaDiscord size={20} />
      무영봇 초대하기
    </button>
  );
}
