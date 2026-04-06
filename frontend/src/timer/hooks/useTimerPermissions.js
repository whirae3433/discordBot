import { useCallback, useMemo } from 'react';
import { TIMER_SETS } from '../constants';

export function useTimerPermissions(myRole, selectedKey) {
  const canAccessSet = useCallback(
    (setKey) => {
      if (myRole === 'owner') return true;
      return setKey === 't2' || setKey === 't3';
    },
    [myRole],
  );

  const visibleSetKeys = useMemo(() => {
    return myRole === 'owner' ? ['t1', 't2', 't3'] : ['t2', 't3'];
  }, [myRole]);

  const visibleSets = useMemo(() => {
    return TIMER_SETS.filter((set) => visibleSetKeys.includes(set.key));
  }, [visibleSetKeys]);

  const canManageSelectedSet = useMemo(() => {
    return canAccessSet(selectedKey);
  }, [canAccessSet, selectedKey]);

  return {
    canAccessSet,
    visibleSetKeys,
    visibleSets,
    canManageSelectedSet,
  };
}
