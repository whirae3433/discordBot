import React from 'react';
import InviteBotButton from '../components/button/InviteBotButton';

export default function HomePage({ serverId }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <h1 className="text-3xl font-bold">봇을 초대하세요</h1>
      <InviteBotButton />
    </div>
  );
}
