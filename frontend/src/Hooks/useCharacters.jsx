import { useState, useCallback } from 'react';
import axios from 'axios';

export function useCharacters(serverId, discordId) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/update/characters/${serverId}/${discordId}`);
      setCharacters(res.data.characters || []);
    } catch (err) {
      console.error('캐릭터 불러오기 실패:', err);
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  }, [serverId, discordId]);

  return { characters, loading, fetchCharacters };
}
