import Modal from '../../../../components/ui/Modal';
import CharacterForm from '../CharacterForm/CharacterForm';
import { useUpdateCharacter } from '../../../../hooks/useUpdateCharacter';
import { useEscClose } from '../../../../hooks/useEscClose';

export default function EditCharacterModal({
  serverId,
  discordId,
  character, // id/characterId 포함
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
      onSuccess?.();
      onClose();
    } catch {
      alert('캐릭터 수정 중 오류 발생');
    }
  };

  const initialValues = {
    ign: character?.ign ?? '',
    profileImg: character?.profileImg ?? '',
    job: character?.job ?? '',
    level: character?.level === 0 || character?.level ? String(character.level) : '',
    atk: character?.atk === 0 || character?.atk ? String(character.atk) : '',
    bossDmg: character?.bossDmg === 0 || character?.bossDmg ? String(character.bossDmg) : '',
    accountGroup: character?.accountGroup ?? '본계정',
    hp: character?.hp === 0 || character?.hp ? String(character.hp) : '',
    acc: character?.acc === 0 || character?.acc ? String(character.acc) : '',
    mapleWarrior: character?.mapleWarrior ?? '없음',
    order: character?.order ?? '',
  };

  return (
    <Modal open onClose={onClose} title="캐릭터 수정" isLoading={loading}>
      <CharacterForm
        key={characterId}
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        submitLabel="수정하기"
      />
      {loading && <p className="text-sm text-gray-500 mt-2">저장 중...</p>}
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </Modal>
  );
}
