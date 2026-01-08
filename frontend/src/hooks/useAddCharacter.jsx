import { useState } from 'react';

export function useAddCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCharacter = async (data, discordId) => {
    console.log('ADD CHARACTER CALL:' , discordId, data);
    try {
      setLoading(true);
      setError(null);

      const payload = { ...data };

      const res = await fetch(
        `/api/update/characters/${discordId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error('캐릭터 추가 실패');

      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addCharacter, loading, error };
}
