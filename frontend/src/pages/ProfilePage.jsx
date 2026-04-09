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

  if (loading) {
    return <div className="text-zinc-500">로딩 중...</div>;
  }

  // 닉네임 기준 그룹화
  const grouped = characters.reduce((acc, char) => {
    if (!acc[char.ign]) acc[char.ign] = [];
    acc[char.ign].push(char);
    return acc;
  }, {});
  const hasCharacters = Object.keys(grouped).length > 0;

  const displayName = user?.globalName || user?.username || '유저';

  return (
    <div className="text-zinc-700">
      {/* 상단 닉네임 헤더 */}
      <h1 className="mb-6 text-center text-2xl font-bold">
        {displayName}님의 프로필
      </h1>

      {hasCharacters ? (
        <div className="space-y-6">
          {Object.entries(grouped).map(([ign, chars]) => (
            <CharacterGroup
              key={ign}
              ign={ign}
              characters={chars}
              onRefresh={fetchCharacters}
            />
          ))}
        </div>
      ) : (
        <div className="flex justify-center pt-24">
          <div className="scale-125">
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
