import { useState, useCallback } from 'react';
import axios from 'axios';

export function useCharacters(serverId, discordId) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    if (!serverId || !discordId) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/update/characters/${serverId}/${discordId}`
      );
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
  }, [serverId, discordId]);

  return { characters, loading, fetchCharacters };
}
