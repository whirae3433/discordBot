import { useState, useCallback } from 'react';
import axios from 'axios';

export function useUpdateCharacter() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // 빈값이면 undefined → JSON 전송 시 필드 생략됨(기존 값 유지에 유리)
  const toNumOrUndef = (v) => {
    if (v === undefined || v === null || v === '') return undefined;
    const n = Number(String(v).replace(/,/g, '').trim());
    return Number.isNaN(n) ? undefined : n;
  };
  const toStrOrUndef = (v) => {
    if (v === undefined || v === null) return undefined;
    const s = String(v).trim();
    return s === '' ? undefined : s;
  };

  const updateCharacter = useCallback(
    async (data, serverId, discordId, characterId) => {
      if (!serverId || !discordId || !characterId) {
        throw new Error('serverId/discordId/characterId가 필요합니다.');
      }
      setLoading(true);
      setError(null);
      try {
        const payload = {
          nickname:     toStrOrUndef(data.nickname),
          ign:          toStrOrUndef(data.ign),
          profileImg:   toStrOrUndef(data.profileImg),
          job:          toStrOrUndef(data.job),
          level:        toNumOrUndef(data.level),
          atk:          toNumOrUndef(data.atk),
          bossDmg:      toNumOrUndef(data.bossDmg),
          accountGroup: toStrOrUndef(data.accountGroup),
          order:        toStrOrUndef(data.order),
          hp:           toNumOrUndef(data.hp),          
          acc:          toNumOrUndef(data.acc),     
          mapleWarrior: toStrOrUndef(data.mapleWarrior),
          clientLastModified: data.clientLastModified ?? undefined,
        };

        const res = await axios.patch(
          `/api/update/characters/${serverId}/${discordId}/${characterId}`,
          payload
        );
        return res.data;
      } catch (err) {
        console.error('updateCharacter fail:', err?.response?.status, err?.response?.data);
        if (err?.response?.status === 409) {
          setError('다른 사람이 먼저 수정했어요. 새로고침 후 다시 시도해주세요.');
        } else {
          setError(err?.response?.data?.message || '캐릭터 수정 중 오류가 발생했습니다.');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateCharacter, loading, error };
}
