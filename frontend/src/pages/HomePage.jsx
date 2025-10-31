import React from 'react';
import InviteBotButton from '../components/button/InviteBotButton';

export default function HomePage({ serverId }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-3xl font-bold text-white">봇을 서버에 추가하세요.</h1>
      <InviteBotButton />
    </div>
  );
}
