import { useAddCharacter } from '../../../Hooks/useAddCharacter';
import { useEscClose } from '../../../Hooks/useEscClose';
import CharacterForm from '../CharacterForm/CharacterForm';
import { IoBackspaceOutline } from 'react-icons/io5';

export default function AddCharacterModal({
  serverId,
  discordId,
  onClose,
  onSuccess,
}) {
  const { addCharacter, loading, error } = useAddCharacter();
  useEscClose(onClose, loading);

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
      <div className="relative bg-white p-6 rounded-md shadow-lg w-80 text-gray-900">
        <h2 className="text-lg font-semibold mb-4">캐릭터 추가</h2>
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 text-2xl"
          aria-label="닫기"
        >
          <IoBackspaceOutline />
        </button>
        <CharacterForm onSubmit={handleFormSubmit} />
        {loading && <p className="text-sm text-gray-500 mt-2">저장 중...</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}
