import { IoBackspaceOutline } from 'react-icons/io5';
import CharacterForm from '../CharacterForm/CharacterForm';
import { useUpdateCharacter } from '../../../Hooks/useUpdateCharacter';
import { useEscClose } from '../../../Hooks/useEscClose';

export default function EditCharacterModal({
  serverId,
  discordId,
  character, // 편집 대상 객체 (id/characterId 포함)
  onClose,
  onSuccess,
}) {
  const { updateCharacter, loading, error } = useUpdateCharacter();
  useEscClose(onClose, loading);

  const characterId = character?.id ?? character?.characterId;
  if (!characterId) return null;

  const handleFormSubmit = async (data) => {
    try {
      await updateCharacter(data, serverId, discordId, characterId);
      onSuccess?.(); // 목록 리페치
      onClose(); // 모달 닫기
    } catch (err) {
      alert('캐릭터 수정 중 오류 발생');
    }
  };

  // CharacterForm이 사용하는 키만 정확히 매핑
  const initialValues = {
    ign: character?.ign ?? '',
    profileImg: character?.profileImg ?? '',
    job: character?.job ?? '',
    level:
      character?.level === 0 || character?.level ? String(character.level) : '',
    atk: character?.atk === 0 || character?.atk ? String(character.atk) : '',
    bossDmg:
      character?.bossDmg === 0 || character?.bossDmg
        ? String(character.bossDmg)
        : '',
    accountGroup: character?.accountGroup ?? '본계정',
    hp: character?.hp === 0 || character?.hp ? String(character.hp) : '',
    acc: character?.acc === 0 || character?.acc ? String(character.acc) : '',
    mapleWarrior: character?.mapleWarrior ?? '없음',
    order: character?.order ?? '',
    // nickname은 CharacterForm에서 useAuth로 넣으므로 전달 불필요
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div
        className="relative bg-white p-6 rounded-md shadow-lg w-80 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">캐릭터 수정</h2>

        <button
          onClick={!loading ? onClose : undefined}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl disabled:opacity-50"
          aria-label="닫기"
          disabled={loading}
        >
          <IoBackspaceOutline />
        </button>

        <CharacterForm
          key={characterId} // 캐릭터 바뀔 때 폼 리셋
          onSubmit={handleFormSubmit} // CharacterForm은 onSubmit만 받음
          initialValues={initialValues} // ← CharacterForm이 이걸 읽도록만 해주면 프리필됨
          mode="edit" // (읽지 않으면 무시됨)
          submitLabel="수정하기"
        />

        {loading && <p className="text-sm text-gray-500 mt-2">저장 중...</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
