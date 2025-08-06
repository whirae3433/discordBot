import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CharacterGroup from '../components/Character/CharacterGroup';
import AddCharacterCard from '../components/Character/AddCharacterCard';
import AddCharacterModal from '../components/Character/Modal/AddCharacterModal';
import { useCharacters } from '../Hooks/useCharacters';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { useAuth } from '../Hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();
  const { nickname, username } = user || {};
  const { serverId, discordId } = useParams();
  const { characters, loading, fetchCharacters } = useCharacters(
    serverId,
    discordId
  );
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (discordId && serverId) {
      fetchCharacters();
    }
  }, [fetchCharacters, discordId, serverId]);

  if (!discordId)
    return <div className="text-white">Discord ID가 없습니다.</div>;
  if (loading) return <div className="text-white">로딩 중...</div>;

  // 닉네임 기준 그룹화
  const grouped = characters.reduce((acc, char) => {
    if (!acc[char.ign]) acc[char.ign] = [];
    acc[char.ign].push(char);
    return acc;
  }, {});
  const hasCharacters = Object.keys(grouped).length > 0;

  return (
    <ProtectedRoute discordId={discordId}>
      <div className="text-white">
        {/* 상단 닉네임 헤더 */}
        <h1 className="text-2xl font-bold mb-6 text-center">
          {nickname}님의 프로필
        </h1>

        {hasCharacters ? (
          Object.entries(grouped).map(([ign, chars]) => (
            <CharacterGroup
              key={ign}
              ign={ign}
              characters={chars}
              serverId={serverId}
              discordId={discordId}
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
            serverId={serverId}
            discordId={discordId}
            onClose={() => {
              setShowModal(false);
              fetchCharacters();
            }}
            onSuccess={fetchCharacters}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
