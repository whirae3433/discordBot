import jobVideo from '../../utils/jobVideo';
import { TfiMoreAlt } from 'react-icons/tfi';

export default function CharacterCard({ character, onEdit }) {
  return (
    <div className="group relative h-[410px] w-[280px] overflow-hidden rounded-[28px] bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {/* 🔹 상단 영역 (더 얇게) */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
          <span>Lv. {character.level || '-'}</span>
          <span className="text-zinc-400">|</span>
          <span>{character.jobName || '-'}</span>
        </div>

        <button
          type="button"
          onClick={() => onEdit?.(character)}
          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition hover:bg-zinc-200/70 hover:text-zinc-800"
          aria-label="캐릭터 수정"
          title="수정"
        >
          <TfiMoreAlt />
        </button>
      </div>

      {/* 🔹 비디오 영역 (위아래 여백 유지) */}
      <div className="absolute inset-x-0 top-[40px] bottom-[105px] overflow-hidden bg-zinc-100">
        <video
          src={jobVideo[character.jobName] || jobVideo.default}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
        />

        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      {/* 🔹 하단 정보 영역 */}
      <div className="absolute inset-x-0 bottom-0 z-20 bg-white px-4 py-5 text-zinc-900">
        <div className="grid grid-cols-2 gap-3 h-[54px]">
          {/* 🔹 왼쪽 (ATK / BOSS) */}
          <div className="grid grid-rows-2 gap-[2px] leading-none">
            <div className="grid grid-cols-[50px_1fr] items-center leading-none">
              <span className="text-[16px] text-zinc-500 leading-none">
                ATK
              </span>
              <div className="flex items-center leading-none">
                <span className="text-base font-semibold tabular-nums leading-none">
                  {character.atk ?? '-'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[50px_1fr] items-center leading-none">
              <span className="text-[16px] text-zinc-500 leading-none">
                BOSS
              </span>
              <div className="flex items-center leading-none">
                <span className="text-base font-semibold tracking-tight leading-none">
                  {character.bossDmg != null ? `+${character.bossDmg}%` : '-'}
                </span>

                {character.bossDmg >= 12.1 && (
                  <span className="ml-1 text-[10px] font-bold text-red-500 leading-none">
                    MAX
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 🔹 오른쪽 (HP / ACC / 메용) */}
          <div className="grid grid-rows-3 gap-[0px] leading-none">
            <div className="grid grid-cols-[53px_1fr] items-center leading-none">
              <span className="text-[12px] text-zinc-500 leading-none text-right">
                HP
              </span>
              <span className="text-right text-sm font-medium tabular-nums leading-none">
                {character.hp ?? '-'}
              </span>
            </div>

            <div className="grid grid-cols-[58px_1fr] items-center leading-none">
              <span className="text-[12px] text-zinc-500 leading-none text-right">
                ACC
              </span>
              <span className="text-right text-sm font-medium tabular-nums leading-none">
                {character.acc ?? '-'}
              </span>
            </div>

            <div className="grid grid-cols-[58px_1fr] items-center leading-none">
              <span className="text-[12px] text-zinc-500 leading-none text-right">
                메용
              </span>
              <span className="text-right text-sm font-medium tabular-nums leading-none">
                {character.mapleWarrior ?? '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}