import { useState, useCallback } from 'react';
import axios from 'axios';

export function useCharacters () {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/update/characters/me`, {
        withCredentials: true,
      });

      const data = Array.isArray(res.data.characters)
        ? res.data.characters
        : [];
      setCharacters(data);
    } catch (err) {
      console.error('[setCharacters]' ,err)
    } finally {
      setLoading(false);
    }
  }, []);

  return { characters, loading, fetchCharacters };
}
