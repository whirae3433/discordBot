import { useDeleteCharacter } from '../../Hooks/useDelete';
import { MdOutlineDeleteForever } from 'react-icons/md';

export default function CharacterCard({
  character,
  serverId,
  discordId,
  onDeleted,
}) {
  const { deleteCharacter } = useDeleteCharacter();

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
      {/* 삭제 버튼 */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-2xl"
      >
        <MdOutlineDeleteForever />
      </button>

      {/* 프로필 이미지 */}
      <img
        src={character.profileImg}
        alt={character.ign}
        className="w-16 h-16 rounded-full border border-gray-300 mb-2"
      />

      {/* 인게임 닉네임 */}
      <h3 className="text-gray-900 font-semibold text-lg mb-2">
        {character.ign}
      </h3>

      {/* 정보: 좌측 직업/레벨, 우측 스공/보공 */}
      <div className="w-full grid grid-cols-2 gap-x-4 text-sm">
        {/* 왼쪽 컬럼 */}
        <div className="flex flex-col items-start text-gray-600">
          <span className="font-semibold">{character.job}</span>
          <span className="text-gray-500">Lv. {character.level}</span>
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="flex flex-col text-gray-700 w-full">
          <div className="flex justify-between">
            <span>스공 |</span>
            <span>{character.atk || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span>보공 |</span>
            <span>{character.bossDmg ? `${character.bossDmg}%` : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
