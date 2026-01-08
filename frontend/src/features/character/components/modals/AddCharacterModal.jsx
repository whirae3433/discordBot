import Modal from '../../../../components/ui/Modal';
import { useAddCharacter } from '../../../../hooks/useAddCharacter';
import { useEscClose } from '../../../../hooks/useEscClose';
import CharacterForm from '../CharacterForm/CharacterForm';

export default function AddCharacterModal({ discordId, onClose, onSuccess }) {
  const { addCharacter, loading, error } = useAddCharacter();
  useEscClose(onClose, loading);

  const handleFormSubmit = async (data) => {
    try {
      await addCharacter(data, discordId);
      onSuccess?.();
      onClose();
    } catch {
      alert('캐릭터 추가 중 오류 발생');
    }
  };

  return (
    <Modal open onClose={onClose} title="캐릭터 추가" isLoading={loading}>
      <CharacterForm onSubmit={handleFormSubmit} />
      {loading && <p className="text-sm text-gray-500 mt-2">저장 중...</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </Modal>
  );
}
