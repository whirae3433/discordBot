import { useState } from 'react';
import CharacterCard from './CharacterCard';
import AddCharacterCard from './AddCharacterCard';
import AddCharacterModal from './Modal/AddCharacterModal';

export default function CharacterGroup({
  ign,
  characters,
  serverId,
  discordId,
  onRefresh,
}) {
  const [showModal, setShowModal] = useState(false);

  const handleClose = () => {
    setShowModal(false);
    if (onRefresh) onRefresh(); // 모달 닫으면서 목록 갱신
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
            serverId={serverId}
            discordId={discordId}
            onDeleted={onRefresh}
          />
        ))}

        {/* 추가 카드 */}
        <AddCharacterCard onClick={() => setShowModal(true)} />
      </div>

      {/* 모달 */}
      {showModal && (
        <AddCharacterModal
          serverId={serverId}
          discordId={discordId}
          onClose={handleClose}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
