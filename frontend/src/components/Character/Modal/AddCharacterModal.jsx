import { useAddCharacter } from '../../../Hooks/useAddCharacter';
import CharacterForm from './CharacterForm';

export default function AddCharacterModal({
  serverId,
  discordId,
  onClose,
  onSuccess,
}) {
  const { addCharacter, loading, error } = useAddCharacter();

  const handleFormSubmit = async (data) => {
    try {
      await addCharacter(data, serverId, discordId);
      if (onSuccess) onSuccess(); // 목록 리페치
      onClose(); // 모달 닫기
    } catch (err) {
      alert('캐릭터 추가 중 오류 발생');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md shadow-lg w-80 text-gray-900">
        <h2 className="text-lg font-semibold mb-4">캐릭터 추가</h2>
        <CharacterForm onSubmit={handleFormSubmit} />
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            취소
          </button>
        </div>
        {loading && <p className="text-sm text-gray-500 mt-2">저장 중...</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
