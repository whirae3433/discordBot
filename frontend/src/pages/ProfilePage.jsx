import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CharacterGroup from '../components/Character/CharacterGroup';
import { useCharacters } from '../Hooks/useCharacters';

export default function ProfilePage() {
  const { serverId, discordId } = useParams();

  const { characters, loading, fetchCharacters } = useCharacters(
    serverId,
    discordId
  );

  useEffect(() => {
    if (discordId) {
      fetchCharacters();
    }
  }, [discordId, fetchCharacters]);

  if (!discordId)
    return <div className="text-white">Discord ID가 없습니다.</div>;
  if (loading) return <div className="text-white">로딩 중...</div>;
  if (!characters.length)
    return <div className="text-white">캐릭터가 없습니다.</div>;

  // 닉네임(IGN) 기준으로 그룹화
  const grouped = characters.reduce((acc, char) => {
    if (!acc[char.ign]) acc[char.ign] = [];
    acc[char.ign].push(char);
    return acc;
  }, {});

  return (
    <div>
      {Object.entries(grouped).map(([ign, chars]) => (
        <CharacterGroup
          key={ign}
          ign={ign}
          characters={chars}
          serverId={serverId}
          discordId={discordId}
          onRefresh={fetchCharacters} // 새로고침 함수 내려줌
        />
      ))}
    </div>
  );
}
