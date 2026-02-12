import { useEffect, useState } from 'react';
import AddCharacterModal from '../features/character/components/modals/AddCharacterModal';
import { useCharacters } from '../hooks/useCharacters';
import { useAuth } from '../hooks/useAuth';
import AddCharacterCard from '../features/character/AddCharacterCard';
import CharacterGroup from '../features/character/CharacterGroup';

export default function ProfilePage() {
  const { user } = useAuth();
  const { characters, loading, fetchCharacters } = useCharacters();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  if (loading) return <div className="text-white">로딩 중...</div>;

  // 닉네임 기준 그룹화
  const grouped = characters.reduce((acc, char) => {
    if (!acc[char.ign]) acc[char.ign] = [];
    acc[char.ign].push(char);
    return acc;
  }, {});
  const hasCharacters = Object.keys(grouped).length > 0;

  const displayName = user?.globalName || user?.username || '유저';

  return (
    <div className="text-white">
      {/* 상단 닉네임 헤더 */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        {displayName}님의 프로필
      </h1>

      {hasCharacters ? (
        Object.entries(grouped).map(([ign, chars]) => (
          <CharacterGroup
            key={ign}
            ign={ign}
            characters={chars}
            onRefresh={fetchCharacters}
          />
        ))
      ) : (
        <div className="flex justify-center items-start h-screen pt-60">
          <div className="scale-150">
            <AddCharacterCard onClick={() => setShowModal(true)} />
          </div>
        </div>
      )}

      {showModal && (
        <AddCharacterModal
          onClose={() => {
            setShowModal(false);
            fetchCharacters();
          }}
        />
      )}
    </div>
  );
}
