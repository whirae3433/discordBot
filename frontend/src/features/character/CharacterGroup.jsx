import { useState } from 'react';
import CharacterCard from './CharacterCard';
import AddCharacterCard from './AddCharacterCard';
import AddCharacterModal from '../../features/character/components/modals/AddCharacterModal';
import EditCharacterModal from '../../features/character/components/modals/EditCharacterModal';

export default function CharacterGroup({
  ign,
  characters,
  discordId,
  onRefresh,
}) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleClose = () => {
    setShowModal(false);
    if (onRefresh) onRefresh(); // 모달 닫으면서 목록 갱신
  };

  const openEdit = (char) => setEditing(char); // ✅ 편집 열기
  const closeEdit = () => {
    setEditing(null);
    onRefresh?.(); // 저장/닫기 후 목록 갱신
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">{ign}</h2>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {characters.map((char) => (
          <CharacterCard
            key={char.id}
            character={char}
            discordId={discordId}
            onDeleted={onRefresh}
            onEdit={openEdit}
          />
        ))}

        {/* 추가 카드 */}
        <AddCharacterCard onClick={() => setShowModal(true)} />
      </div>

      {/* 모달 */}
      {showModal && (
        <AddCharacterModal
          discordId={discordId}
          onClose={handleClose}
        />
      )}
      {editing && (
        <EditCharacterModal
          discordId={discordId}
          character={editing}
          onClose={closeEdit}
        />
      )}
    </div>
  );
}
