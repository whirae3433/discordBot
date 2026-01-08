import { useState, useCallback } from 'react';
import axios from 'axios';

export function useCharacters (discordId) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    if (!discordId) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/update/characters/${discordId}`, {
        withCredentials: true,
      });

      const data = Array.isArray(res.data.characters)
        ? res.data.characters
        : [];
      setCharacters(data);
    } catch (err) {
      console.error(err);
      setCharacters([]); // 에러 시 초기화
    } finally {
      setLoading(false);
    }
  }, [discordId]);

  return { characters, loading, fetchCharacters };
}
