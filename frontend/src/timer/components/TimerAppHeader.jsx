import React from 'react';
import SetSelector from './SetSelector';
import HotkeySetting from '../HotKeySetting';
import { ImExit } from 'react-icons/im';
import { LuCrown } from 'react-icons/lu';
import { BsPersonCheckFill } from 'react-icons/bs';

export default function TimerAppHeader({
  roomTitle,
  myRole,
  visibleSets,
  selectedKey,
  onSelectSet,
  onExitLobby,
  onDeleteRoom,
  hotkeyEnabled,
  setHotkeyEnabled,
}) {
  return (
    <div className="flex items-start justify-between gap-6 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{roomTitle || '로나 타이머'}</h1>

          <button
            onClick={onExitLobby}
            className="flex items-center gap-1 text-sm text-zinc-400 hover:text-red-400 transition"
            title="로비로 나가기"
          >
            <ImExit className="text-base" />
            <span>나가기</span>
          </button>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
          {myRole === 'owner' ? (
            <>
              <LuCrown className="text-yellow-400" />
              <span>방장</span>
            </>
          ) : (
            <>
              <BsPersonCheckFill className="text-green-400" />
              <span>멤버</span>
            </>
          )}
        </div>

        <div className="mt-2">
          <SetSelector
            sets={visibleSets}
            selectedKey={selectedKey}
            onSelect={onSelectSet}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {myRole === 'owner' && (
          <button
            onClick={onDeleteRoom}
            className="h-10 rounded-xl border border-red-500/40 px-4 text-red-300 hover:bg-red-500/10 transition"
          >
            방 삭제
          </button>
        )}

        <HotkeySetting
          active
          enabled={hotkeyEnabled}
          setEnabled={setHotkeyEnabled}
        />
      </div>
    </div>
  );
}
