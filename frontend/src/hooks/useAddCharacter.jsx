import { useState } from 'react';

export function useAddCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addCharacter = async (data) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/update/characters/me`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => '캐릭터 추가 실패');
        throw new Error(msg);
      }

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
