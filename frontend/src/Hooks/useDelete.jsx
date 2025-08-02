import { useState } from 'react';

export function useDeleteCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteCharacter = async (serverId, discordId, characterId) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/update/characters/${serverId}/${discordId}/${characterId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('삭제 실패');
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteCharacter, loading, error };
}
