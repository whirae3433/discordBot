import { useDeleteCharacter } from '../../hooks/useDelete';
import { RiDeleteBinLine } from 'react-icons/ri';
import { GrUpdate } from 'react-icons/gr';
import jobImg from '../../utils/jobImg';



export default function CharacterCard({
  character,
  serverId,
  discordId,
  onDeleted,
  onEdit,
}) {
  const { deleteCharacter } = useDeleteCharacter();
  console.log(">>> jobImg loaded!", jobImg);
  console.log("=== USING CharacterCard.jsx VERSION A ===");
console.log("jobName:", character.jobName);

  const handleDelete = async () => {
    if (!window.confirm(`${character.ign} 캐릭터를 삭제하시겠습니까?`)) return;

    try {
      await deleteCharacter(serverId, discordId, character.id);
      if (onDeleted) onDeleted(); // 삭제 후 목록 리페치
    } catch (err) {
      alert('삭제 중 오류 발생');
    }
  };

  return (
    <div className="relative bg-gray-100 rounded-none p-4 flex flex-col items-center shadow hover:shadow-md transition">
      {/* 수정 버튼 */}
      <button
        onClick={() => onEdit && onEdit(character)}
        className="absolute top-4 left-4 text-gray-400 hover:text-blue-500 text-xl"
      >
        <GrUpdate />
      </button>

      {/* 삭제 버튼 */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-2xl"
      >
        <RiDeleteBinLine />
      </button>

      {/* 프로필 이미지 */}
      <img
        src={jobImg[character.jobName] || jobImg.default}
        alt={character.ign}
        className="w-16 h-16 rounded-full border border-gray-300 mb-2"
      />
      

      {/* 인게임 닉네임 */}
      <h3 className="text-gray-900 font-semibold text-lg mb-2">
        {character.ign}
      </h3>

      {/* 1행: Job / Atk|Boss / MapleWarrior */}
      <div className="w-full grid grid-cols-3 text-sm text-gray-700">
        <div className="flex justify-start font-semibold">
          {character.jobName || '-'}
        </div>
        <div className="flex justify-center items-center gap-1 whitespace-nowrap shrink-0 leading-none tabular-nums">
          <span>{character.atk ?? '-'}</span>
          <span>|</span>
          <span>
            {character.bossDmg != null ? `${character.bossDmg}%` : '-'}
          </span>
        </div>
        <div className="flex justify-end">{character.mapleWarrior || '-'}</div>
      </div>

      {/* 2행: Lv / HP / Acc */}
      <div className="w-full grid grid-cols-3 text-sm mb-1 text-gray-700">
        <div className="flex justify-start">Lv. {character.level || '-'}</div>
        <div className="flex justify-center">HP: {character.hp || '-'}</div>
        <div className="flex justify-end">Acc: {character.acc || '-'}</div>
      </div>
    </div>
  );
}
