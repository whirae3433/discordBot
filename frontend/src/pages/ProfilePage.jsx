import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterGroup from '../components/Character/CharacterGroup';
import AddCharacterCard from '../components/Character/AddCharacterCard';
import AddCharacterModal from '../components/Character/Modal/AddCharacterModal';
import { useState } from 'react';
import { useCharacters } from '../Hooks/useCharacters';

export default function ProfilePage() {
  const { serverId, discordId } = useParams();
  const { characters, loading, fetchCharacters } = useCharacters(
    serverId,
    discordId
  );

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (discordId) {
      fetchCharacters();
    }
  }, [discordId, fetchCharacters]);

  if (!discordId)
    return <div className="text-white">Discord ID가 없습니다.</div>;
  if (loading) return <div className="text-white">로딩 중...</div>;

  // 닉네임 기준으로 그룹화
  const grouped = characters.reduce((acc, char) => {
    if (!acc[char.ign]) acc[char.ign] = [];
    acc[char.ign].push(char);
    return acc;
  }, {});

  const hasCharacters = Object.keys(grouped).length > 0;

  return (
    <div>
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
        // 캐릭터 없을 때 전체 화면 중앙 아래쪽 배치
        <div className="flex justify-center items-start h-screen pt-60">
          <div className="scale-150">
            <AddCharacterCard onClick={() => setShowModal(true)} />
          </div>
        </div>
      )}

      {/* 모달 */}
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
  );
}
